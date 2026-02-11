import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AssetExpense, AssetExpenseDocument } from '../schema/assetExpense.model';
import { Asset, AssetDocument } from '../schema/asset.model';
import { CreateAssetExpenseDto } from './dto/create-expense.dto';
import { UpdateAssetExpenseDto } from './dto/update-expense.dto';

// Constants for validation
const MAX_EXPENSE_PERCENTAGE = 100;
const MIN_EXPENSE_VALUE = 0;
const MAX_EXPENSE_NAME_LENGTH = 100;

@Injectable()
export class ExpenseService {
  constructor(
    @InjectModel(AssetExpense.name)
    private readonly assetExpenseModel: Model<AssetExpenseDocument>,
    @InjectModel(Asset.name)
    private readonly assetModel: Model<AssetDocument>,
  ) {}

  /**
   * Validates expense data
   */
  private validateExpenseData(expenseData: Partial<CreateAssetExpenseDto>): void {
    if (expenseData.name && expenseData.name.length > MAX_EXPENSE_NAME_LENGTH) {
      throw new BadRequestException(
        `Expense name cannot exceed ${MAX_EXPENSE_NAME_LENGTH} characters`,
      );
    }

    if (expenseData.value !== undefined) {
      if (expenseData.value < MIN_EXPENSE_VALUE) {
        throw new BadRequestException('Expense value cannot be negative');
      }

      if (
        expenseData.isPercentage &&
        expenseData.value > MAX_EXPENSE_PERCENTAGE
      ) {
        throw new BadRequestException('Percentage value cannot exceed 100%');
      }
    }
  }

  /**
   * Calculates expense amount based on percentage or fixed value
   */
  private calculateExpenseAmount(
    value: number,
    isPercentage: boolean,
    grossMonthlyRent: number,
  ): number {
    if (grossMonthlyRent <= 0) {
      throw new BadRequestException(
        "Asset's gross monthly rent must be greater than 0",
      );
    }

    const expenseAmount = isPercentage
      ? (value / 100) * grossMonthlyRent
      : value;

    // Handle floating point precision
    return Number(expenseAmount.toFixed(2));
  }

  /**
   * Updates asset financial information
   */
  private async updateAssetFinancials(
    assetId: string,
    expenseChange: number,
    operation: 'add' | 'subtract',
  ): Promise<void> {
    const asset = await this.assetModel.findById(assetId);
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    const multiplier = operation === 'add' ? 1 : -1;
    const monthlyExpenseChange = expenseChange * multiplier;
    const annualExpenseChange = monthlyExpenseChange * 12;

    // Ensure expenses don't go below 0
    const newMonthlyExpenses = Math.max(
      0,
      (asset.rentalInformation?.expenses?.monthlyExpenses || 0) + monthlyExpenseChange,
    );
    const newAnnualExpenses = Math.max(
      0,
      (asset.rentalInformation?.expenses?.annualExpenses || 0) + annualExpenseChange,
    );

    // Recalculate net cash flow based on rental income and expenses
    const grossMonthlyRent = asset.rentalInformation?.grossMonthlyRent || 0;
    const netMonthlyRent = Math.max(0, grossMonthlyRent - newMonthlyExpenses);
    const netAnnualRent = netMonthlyRent * 12;
    const netCashFlow = netAnnualRent;

    await this.assetModel.findByIdAndUpdate(
      assetId,
      {
        'rentalInformation.expenses.monthlyExpenses': newMonthlyExpenses,
        'rentalInformation.expenses.annualExpenses': newAnnualExpenses,
        'rentalInformation.netMonthlyRent': netMonthlyRent,
        'rentalInformation.netAnnualRent': netAnnualRent,
        'rentalInformation.netCashFlow': netCashFlow,
      },
      { new: true },
    );
  }

  /**
   * Creates a new expense for the given asset
   */
  async createAssetExpense(
    assetId: string,
    issuerId: string,
    expenseData: CreateAssetExpenseDto,
  ): Promise<AssetExpenseDocument> {
    this.validateExpenseData(expenseData);

    // Verify asset exists and belongs to issuer
    const asset = await this.assetModel.findOne({
      _id: assetId,
      issuerId: issuerId,
    });

    if (!asset) {
      throw new NotFoundException('Asset not found or does not belong to this issuer');
    }

    // Check for duplicate expense name
    const existingExpense = await this.assetExpenseModel.findOne({
      assetId,
      issuerId,
      name: expenseData.name,
    });

    if (existingExpense) {
      throw new ConflictException(
        `An expense with the name "${expenseData.name}" already exists for this asset`,
      );
    }

    const expenseAmount = this.calculateExpenseAmount(
      expenseData.value,
      expenseData.isPercentage,
      asset.rentalInformation?.grossMonthlyRent || 0,
    );

    if (expenseAmount > (asset.totalPropertyValueAfterFees || 0)) {
      throw new BadRequestException(
        `Expense amount (${expenseAmount}) cannot exceed the asset's total property value (${asset.totalPropertyValueAfterFees})`,
      );
    }

    await this.updateAssetFinancials(assetId, expenseAmount, 'add');

    const assetExpense = new this.assetExpenseModel({
      assetId: new Types.ObjectId(assetId),
      issuerId: new Types.ObjectId(issuerId),
      ...expenseData,
    });

    return await assetExpense.save();
  }

  /**
   * Retrieves an expense by its ID (issuerId filter applied)
   */
  async getExpenseByExpenseId(
    expenseId: string,
    issuerId: string,
  ): Promise<AssetExpenseDocument> {
    const expense = await this.assetExpenseModel.findOne({
      _id: expenseId,
      issuerId: issuerId,
    });

    if (!expense) {
      throw new NotFoundException('Asset expense not found');
    }

    return expense;
  }

  /**
   * Updates an expense by its ID
   */
  async updateAssetExpense(
    expenseId: string,
    issuerId: string,
    updateData: UpdateAssetExpenseDto,
  ): Promise<AssetExpenseDocument> {
    this.validateExpenseData(updateData);

    const currentExpense = await this.assetExpenseModel.findOne({
      _id: expenseId,
      issuerId: issuerId,
    });

    if (!currentExpense) {
      throw new NotFoundException('Asset expense not found');
    }

    const asset = await this.assetModel.findOne({
      _id: currentExpense.assetId,
      issuerId: issuerId,
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    // Check for duplicate name if name is being updated
    if (updateData.name && updateData.name !== currentExpense.name) {
      const existingExpense = await this.assetExpenseModel.findOne({
        assetId: currentExpense.assetId,
        issuerId: issuerId,
        name: updateData.name,
        _id: { $ne: expenseId },
      });

      if (existingExpense) {
        throw new ConflictException(
          `An expense with the name "${updateData.name}" already exists for this asset`,
        );
      }
    }

    // Handle financial updates if value or percentage changes
    if (
      updateData.value !== undefined ||
      updateData.isPercentage !== undefined
    ) {
      // Remove old expense amount (only if status was true)
      if (currentExpense.status !== false) {
        const oldExpenseAmount = this.calculateExpenseAmount(
          currentExpense.value,
          currentExpense.isPercentage,
          asset.rentalInformation?.grossMonthlyRent || 0,
        );
        await this.updateAssetFinancials(
          currentExpense.assetId.toString(),
          oldExpenseAmount,
          'subtract',
        );
      }

      // Add new expense amount
      const newExpenseAmount = this.calculateExpenseAmount(
        updateData.value !== undefined ? updateData.value : currentExpense.value,
        updateData.isPercentage !== undefined
          ? updateData.isPercentage
          : currentExpense.isPercentage,
        asset.rentalInformation?.grossMonthlyRent || 0,
      );

      if (newExpenseAmount > (asset.totalPropertyValueAfterFees || 0)) {
        throw new BadRequestException(
          `New expense amount (${newExpenseAmount}) cannot exceed the asset's total property value (${asset.totalPropertyValueAfterFees})`,
        );
      }

      // Add new expense if status is not false
      if (updateData.status !== false) {
        await this.updateAssetFinancials(
          currentExpense.assetId.toString(),
          newExpenseAmount,
          'add',
        );
      }
    }

    const updatedExpense = await this.assetExpenseModel.findOneAndUpdate(
      { _id: expenseId, issuerId: issuerId },
      { ...updateData },
      { new: true, runValidators: true },
    );

    if (!updatedExpense) {
      throw new NotFoundException('Asset expense not found');
    }

    return updatedExpense;
  }

  /**
   * Retrieves all expenses for an asset (issuerId filter applied)
   */
  async getAllExpensesByAssetId(
    assetId: string,
    issuerId: string,
  ): Promise<AssetExpenseDocument[]> {
    const asset = await this.assetModel.findOne({
      _id: assetId,
      issuerId: issuerId,
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    return await this.assetExpenseModel.find({
      assetId,
      issuerId,
    });
  }

  /**
   * Deletes all expenses for an asset (issuerId filter applied)
   */
  async deleteAllAssetExpenses(
    assetId: string,
    issuerId: string,
  ): Promise<{ deletedCount: number }> {
    const asset = await this.assetModel.findOne({
      _id: assetId,
      issuerId: issuerId,
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    const expenses = await this.assetExpenseModel.find({
      assetId,
      issuerId,
    });

    let totalExpenseReduction = 0;

    for (const expense of expenses) {
      if (expense.status !== false) {
        const expenseAmount = this.calculateExpenseAmount(
          expense.value,
          expense.isPercentage,
          asset.rentalInformation?.grossMonthlyRent || 0,
        );
        totalExpenseReduction += expenseAmount;
      }
    }

    if (totalExpenseReduction > 0) {
      await this.updateAssetFinancials(assetId, totalExpenseReduction, 'subtract');
    }

    const result = await this.assetExpenseModel.deleteMany({
      assetId,
      issuerId,
    });

    return { deletedCount: result.deletedCount || 0 };
  }

  /**
   * Deletes a specific expense by its ID (issuerId filter applied)
   */
  async deleteAssetExpense(
    expenseId: string,
    issuerId: string,
  ): Promise<{ deleted: boolean }> {
    const currentExpense = await this.assetExpenseModel.findOne({
      _id: expenseId,
      issuerId: issuerId,
    });

    if (!currentExpense) {
      throw new NotFoundException('Asset expense not found');
    }

    const asset = await this.assetModel.findOne({
      _id: currentExpense.assetId,
      issuerId: issuerId,
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    if (currentExpense.status !== false) {
      const expenseAmount = this.calculateExpenseAmount(
        currentExpense.value,
        currentExpense.isPercentage,
        asset.rentalInformation?.grossMonthlyRent || 0,
      );

      await this.updateAssetFinancials(
        currentExpense.assetId.toString(),
        expenseAmount,
        'subtract',
      );
    }

    const result = await this.assetExpenseModel.deleteOne({
      _id: expenseId,
      issuerId: issuerId,
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Asset expense not found');
    }

    return { deleted: true };
  }
}
