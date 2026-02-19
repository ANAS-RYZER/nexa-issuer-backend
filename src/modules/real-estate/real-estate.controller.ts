import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Query,
} from "@nestjs/common";
import { AssetService } from "./real-estate.service";
import { CreateAssetDto } from "./dto/create-asset.dto";
import { UpdateAssetDto } from "./dto/update-asset.dto";
import { AssetIdParamsDto } from "./dto/asset-id-params.dto";
import { CheckTokenSymbolDto } from "./dto/check-token-symbol.dto";
import { AssignTokenSymbolDto } from "./dto/assign-token-symbol.dto";
import { AdminAssetListingQueryDto } from "./dto/admin-asset-listing-query.dto";
import { PublicAssetListQueryDto } from "./dto/public-asset-list-query.dto";
import { JwtAuthGuard } from "../authIssuer/guards/jwt-auth.guard";
import { OptionalJwtAuthGuard } from "../auth/guards/optional-jwt-auth.guard";
import { IpGuard } from "../ip/guards/ip.guards";

@Controller("real-estate")
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  /**
   * user side asset list with optional authentication
   * Example without auth: GET /api/real-estate/user/assets
   * Example with auth: GET /api/real-estate/user/assets (with Bearer token)
   */
  @Get("user/assets")
  @UseGuards(OptionalJwtAuthGuard)
  @UseGuards(IpGuard)
  @HttpCode(HttpStatus.OK)
  async getPublicAssetList(
    @Query() query: PublicAssetListQueryDto,
    @Req() req: any,
  ) {
    // Extract user ID from token if present (for future user-specific features)
    // console.log("Request", req);
    // const ip = req.headers["x-forwarded-for"];
    // console.log("Ip", ip);
    const userId = req.user?.userId;
    console.log("User ID in Controller:", req.ip);
    const currency = req.userCurrency

    const result = await this.assetService.getPublicAssetList(query, currency);

    return {
      statusCode: HttpStatus.OK,
      message: result.message,
      data: result.assets,
      userCurrency: result.userCurrency,
      pagination: result.pagination,
      filters: result.filters,

      // Include user context if logged in (for debugging)
      ...(userId && { userContext: { userId, isAuthenticated: true } }),
    };
  }

  /**
   * user side asset details with optional authentication
   */
  @Get("user/assets/:assetId")
  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getPublicAssetById(
    @Param("assetId") assetId: string,
    @Req() req: any,
    @Query("investorId") investorId?: string,
  ) {
    // Priority: Manual investorId > Token userId > null
    const effectiveInvestorId = investorId || req.user?.userId;

    const asset = await this.assetService.getPublicAssetById(
      assetId,
      effectiveInvestorId,
    );

    return {
      statusCode: HttpStatus.OK,
      data: asset,
      message: "Asset details fetched successfully",
      // Include auth context for debugging
      ...(req.user?.userId && {
        userContext: {
          userId: req.user.userId,
          isAuthenticated: true,
          usingTokenAuth: !investorId,
        },
      }),
    };
  }

  /* 
      This asset list used for issuer asset list
    */
  @Get("asset-list")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getAdminAssetListing(
    @Query() query: AdminAssetListingQueryDto,
    @Req() req: Request,
  ) {
    const issuerId = (req as any).user?.userId;
    console.log("Issuer ID in Controller:", issuerId);
    const result = await this.assetService.getAdminAssetListing(
      query,
      issuerId,
    );

    return {
      data: result.assets,
      pagination: {
        page: result.page,
        limit: result.limit,
        currentPage: result.currentPage,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage,
        totalCount: result.totalCount,
        totalPages: result.totalPages,
      },
      message: "Assets fetched successfully",
    };
  }
  /*
       This asset list used for particular issuer asset list
    */

  @Get("")
  @UseGuards(JwtAuthGuard)
  async getAllAssets(@Req() req: Request) {
    // return this.assetService.create(body);
    const issuerId = (req as any).user?.userId;
    console.log("issuerId", issuerId);
    try {
      const assets = await this.assetService.getAllAssets(issuerId);
      return {
        data: assets.data,
        message: assets.message,
      };
    } catch (error: any) {
      return {
        data: [],
        message: error.message,
      };
    }
  }
  /* create asset for issuer */
  @Post("")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createAsset(@Body() body: CreateAssetDto, @Req() req: Request) {
    const adminId = (req as any).user?.userId;
    console.log("adminId", adminId);
    const newAsset = await this.assetService.createAssetBasicDetails(
      body,
      adminId,
    );

    return {
      data: newAsset,
      message: "Asset basic details created successfully",
    };
  }
  /* get asset by id for issuer */
  @Get(":assetId")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getAssetById(@Param() params: AssetIdParamsDto, @Req() req: Request) {
    const { assetId } = params;
    const issuerId = (req as any).user?.userId;
    const asset = await this.assetService.getAssetByIdWithDetails(
      assetId,
      issuerId,
    );

    return {
      data: asset,
      message: "Asset fetched successfully",
    };
  }
  /*
       update call for asset issuer
     */
  @Put(":assetId")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateAssetById(
    @Param() params: AssetIdParamsDto,
    @Body() updateData: UpdateAssetDto,
  ) {
    const { assetId } = params;
    await this.assetService.updateAsset(assetId, updateData);

    // Fetch the updated asset to return complete data
    const asset = await this.assetService.getAssetById(assetId);

    return {
      data: asset,
      message: "Asset updated successfully",
    };
  }

  /*
      check token-symbol for issuer side
    */

  @Post("check-token-symbol")
  @HttpCode(HttpStatus.OK)
  async checkTokenSymbol(@Body() body: CheckTokenSymbolDto) {
    const { available, message } = await this.assetService.checkTokenSymbol(
      body.symbol,
    );

    return {
      success: true,
      available,
      message,
    };
  }
  /*
      create token-symbol for issuer side
    */
  @Put(":assetId/token-symbol")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async assignTokenSymbol(
    @Param() params: AssetIdParamsDto,
    @Body() body: AssignTokenSymbolDto,
  ) {
    const { assetId } = params;
    const { symbol } = body;

    const updatedAsset = await this.assetService.assignTokenSymbol(
      symbol,
      assetId,
    );

    return {
      success: true,
      message: `Token symbol "${symbol}" has been successfully assigned to asset ${assetId}.`,
      data: updatedAsset,
    };
  }
}
