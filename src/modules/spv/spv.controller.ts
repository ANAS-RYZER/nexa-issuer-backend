import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
  Put,
  UseGuards,
  UnauthorizedException,
  BadRequestException,
} from "@nestjs/common";
import { SPVService } from "./spv.service";
import {
  CreateSPVDto,
  UpdateSPVDto,
  BoardMemberDto,
  UpdateBoardMemberDto,
} from "./dto/spv.dto";
import { JwtAuthGuard } from "../auth_issuer/guards/jwt-auth.guard";
import { CurrentUser } from "../auth_issuer/decorators/current-user.decorator";

@Controller("spv")
export class SPVController {
  constructor(private readonly spvService: SPVService) {}

  /**
   * Get paginated SPV list for authenticated user (AUM, investors, etc.)
   * Only shows SPVs created by the authenticated user
   * Supports filtering by type, status, and search
   */
  @Get("spv-list")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getSPVList(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("search") search?: string,
    @Query("type") type?: string | string[],
    @Query("status") status?: string,
    @CurrentUser("userId") userId?: string,
  ) {
    try {
      const pageNum = page ? parseInt(page, 10) : 1;
      const limitNum = limit ? parseInt(limit, 10) : 10;

      // Normalize type to array
      let typeArray: string[] | undefined;
      if (type) {
        typeArray = Array.isArray(type) ? type : [type];
      }

      const result = await this.spvService.getSPVListByAggregation(
        {
          search,
          type: typeArray,
          status,
          userId, // Filter by authenticated user
        },
        pageNum,
        limitNum,
      );
      return {
        success: true,
        message: "SPVs retrieved successfully",
        data: result.spvs,
        pagination: result.pagination,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get active SPV names WITHOUT assets
   * Used for asset creation dropdown
   */
  @Get("names")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getSPVNamesWithoutAssets(@CurrentUser("userId") userId?: string) {
    try {
      const spvs = await this.spvService.getSPVNamesWithoutAssets(userId as string);

      return {
        success: true,
        message: "SPVs retrieved successfully",
        data: spvs,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get single SPV by ID
   * Returns complete SPV details
   * Requires JWT authentication
   */
  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getSPVById(
    @Param("id") id: string,
    @CurrentUser("userId") userId?: string,
  ) {
    try {
      const spv = await this.spvService.findById(id);

      return {
        success: true,
        message: "SPV retrieved successfully",
        data: spv,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create new SPV with comprehensive validation
   * Requires JWT authentication
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreateSPVDto,
    @CurrentUser("userId") userId?: string,
  ) {
    if (!userId) {
      throw new UnauthorizedException("User ID not found in token");
    }

    try {
      const spv = await this.spvService.create(createDto, userId);

      return {
        success: true,
        message: "SPV created successfully",
        data: spv,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update SPV (full update with PUT)
   * Requires JWT authentication
   */
  @Put(":id")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async update(
    @Param("id") id: string,
    @Body() updateDto: UpdateSPVDto,
    @CurrentUser("userId") userId?: string,
  ) {
    try {
      const spv = await this.spvService.update(id, updateDto);

      return {
        success: true,
        message: "SPV updated successfully",
        data: spv,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update SPV status only
   * Requires JWT authentication
   */
  @Patch(":id/status")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param("id") id: string,
    @Body("status") status: string,
    @CurrentUser("userId") userId?: string,
  ) {
    try {
      const spv = await this.spvService.updateStatus(id, status);

      return {
        success: true,
        message: "SPV status updated successfully",
        data: spv,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get DAO configuration by SPV ID
   * Returns only DAO configuration and currency
   * Requires JWT authentication
   */
  @Get("dao/:id")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getDaoBySpvId(
    @Param("id") id: string,
    @CurrentUser("userId") userId?: string,
  ) {
    try {
      const spvDao = await this.spvService.getDaoBySpvId(id);

      return {
        success: true,
        message: "SPV DAO configuration retrieved successfully",
        data: spvDao,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all board members of an SPV (embedded in document).
   */
  @Get(":id/board-members")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getBoardMembers(
    @Param("id") spvId: string,
    @CurrentUser("userId") userId?: string,
  ) {
    const data = await this.spvService.getBoardMembers(spvId);
    return {
      success: true,
      message: "Board members retrieved successfully",
      data,
    };
  }

  /**
   * Add a board member to an SPV.
   */
  @Post(":id/board-members")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async addBoardMember(
    @Param("id") spvId: string,
    @Body() dto: BoardMemberDto,
    @CurrentUser("userId") userId?: string,
  ) {
    const data = await this.spvService.addBoardMember(spvId, dto);
    return {
      success: true,
      message: "Board member created successfully",
      data,
    };
  }

  /**
   * Update a board member by index (0-based).
   */
  @Put(":id/board-members/:memberIndex")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateBoardMember(
    @Param("id") spvId: string,
    @Param("memberIndex") memberIndexStr: string,
    @Body() dto: UpdateBoardMemberDto,
    @CurrentUser("userId") userId?: string,
  ) {
    const memberIndex = parseInt(memberIndexStr, 10);
    if (Number.isNaN(memberIndex) || memberIndex < 0) {
      throw new BadRequestException(
        "memberIndex must be a non-negative integer",
      );
    }
    const data = await this.spvService.updateBoardMember(
      spvId,
      memberIndex,
      dto,
    );
    return {
      success: true,
      message: "Board member updated successfully",
      data,
    };
  }

  /**
   * Delete a board member by index (0-based).
   */
  @Delete(":id/board-members/:memberIndex")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBoardMember(
    @Param("id") spvId: string,
    @Param("memberIndex") memberIndexStr: string,
    @CurrentUser("userId") userId?: string,
  ) {
    const memberIndex = parseInt(memberIndexStr, 10);
    if (Number.isNaN(memberIndex) || memberIndex < 0) {
      throw new BadRequestException(
        "memberIndex must be a non-negative integer",
      );
    }
    await this.spvService.deleteBoardMember(spvId, memberIndex);
  }

  /**
   * Delete SPV
   * Requires JWT authentication
   * Returns success message on successful deletion
   */
  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param("id") id: string,
    @CurrentUser("userId") userId?: string,
  ) {
    await this.spvService.delete(id);

    return {
      success: true,
      message: "SPV deleted successfully",
    };
  }
}
