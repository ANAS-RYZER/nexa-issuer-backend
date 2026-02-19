import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { spvStatus, SpvStatusDocument } from '../schemas/spvstatus.schema';
import { SPV, SPVDocument } from '../schemas/spv.schema';
import { CreateSpvStatusDto } from './dto/create-spv-status.dto';
import {
  IssuerUser,
  IssuerUserDocument,
} from '../../authIssuer/schemas/issuer-user.schema';
import { Admin, AdminDocument } from '../../admin/schemas/admin.schema';
// import { EmailService } from './infra/email/email.service';
import { EmailService } from '../../../infra/email/email.service';


@Injectable()
export class SpvStatusService {
  private readonly logger = new Logger(SpvStatusService.name);

  constructor(
    @InjectModel(spvStatus.name)
    private readonly spvStatusModel: Model<SpvStatusDocument>,

    @InjectModel(SPV.name)
    private readonly spvModel: Model<SPVDocument>,

    @InjectModel(IssuerUser.name)
    private readonly issuerModel: Model<IssuerUserDocument>,

    @InjectModel(Admin.name)
    private readonly adminModel: Model<AdminDocument>,

    private readonly emailService: EmailService,
  ) {}

  async createSpvStatus(
    issuerId: string,
    spvId: string,
    dto: CreateSpvStatusDto,
  ) {
    const spvObjectId = new Types.ObjectId(spvId);
    const issuerObjectId = new Types.ObjectId(issuerId);

    // Fetch SPV name
    const spv = await this.spvModel
      .findById(spvObjectId)
      .select('name')
      .lean();

    if (!spv) {
      throw new NotFoundException('SPV not found');
    }

    if (!spv.name) {
      throw new NotFoundException('SPV name not found');
    }

    const issuer = await this.issuerModel
      .findById(issuerObjectId)
      .select('firstName lastName email')
      .lean();

    if (!issuer) {
      throw new NotFoundException('Issuer not found');
    }

    if (!issuer.email) {
      throw new NotFoundException('Issuer email not found');
    }

    const issuerName = `${issuer.firstName ?? ''} ${issuer.lastName ?? ''}`.trim();

    // Prevent duplicate status row per SPV
    const existing = await this.spvStatusModel.findOne({
      spvId: spvObjectId,
    });
   
    if (existing) {
      throw new ConflictException('SPV status already exists');
    }

    // Create status entry
    const spvStatus = await this.spvStatusModel.create({
      issuerId,
      spvId: spvObjectId,
      issuername: issuerName,
      issueremail: issuer.email,
      spvname: spv.name,
      status: dto.status,
      issuerComments: dto.issuerComments,
    });

    await this.spvModel.updateOne(
      { _id: spvObjectId },
      { $set: { status: dto.status } },
    );

    // Send email notification to all active admins
    await this.sendAdminNotification(issuerName, issuer.email, spv.name, dto.status, dto.issuerComments);

    return spvStatus;
  }

  /**
   * Send email notification to all active admins about SPV approval request
   */
  private async sendAdminNotification(
    issuerName: string,
    issuerEmail: string,
    spvName: string,
    status: string,
    issuerComments?: string,
  ): Promise<void> {
    try {
      // Fetch all active admins
      const admins = await this.adminModel
        .find({ isActive: true })
        .select('email firstName')
        .lean();

      if (!admins || admins.length === 0) {
        this.logger.warn('No active admins found to send SPV approval notification');
        return;
      }

      // Send email to each admin
      const emailPromises = admins.map(async (admin) => {
        try {
          await this.emailService.sendEmail(
            admin.email,
            `New SPV Approval Request - ${spvName}`,
            'spv-approval-request',
            {
              issuerName,
              issuerEmail,
              spvName,
              status,
              issuerComments: issuerComments || 'No comments provided',
            },
          );
          this.logger.log(`SPV approval notification sent to admin: ${admin.email}`);
        } catch (error) {
          this.logger.error(
            `Failed to send SPV approval notification to admin ${admin.email}:`,
            error,
          );
        }
      });

      await Promise.allSettled(emailPromises);
    } catch (error) {
      this.logger.error('Error sending admin notifications:', error);
      // Don't throw error - we don't want to fail the SPV creation if email fails
    }
  }
}
