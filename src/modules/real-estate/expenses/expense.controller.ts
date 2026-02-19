import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateAssetExpenseDto } from './dto/create-expense.dto';
import { UpdateAssetExpenseDto } from './dto/update-expense.dto';
import {
  AssetIdQueryDto,
  ExpenseIdParamDto,
  AssetIdParamDto,
} from './dto/expense-query.dto';
import { JwtAuthGuard } from "../../authIssuer/guards/jwt-auth.guard";

@Controller('expense')
@UseGuards(JwtAuthGuard)
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  /**
   * Create a new asset expense by asset ID
   * POST /expense?assetId=...
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAssetExpense(
    @Req() req: any,
    @Query() query: AssetIdQueryDto,
    @Body() createDto: CreateAssetExpenseDto,
  ) {
    const issuerId = req.user?.userId;
    const newExpense = await this.expenseService.createAssetExpense(
      query.assetId,
      issuerId,
      createDto,
    );

    return {
      data: newExpense,
      message: 'Asset expense created successfully',
    };
  }

  /**
   * Get all expenses for an asset
   * GET /expense/asset?assetId=...
   */
  @Get('asset')
  @HttpCode(HttpStatus.OK)
  async getAllExpensesByAssetId(
    @Req() req: any,
    @Query() query: AssetIdQueryDto,
  ) {
    const issuerId = req.user?.userId;
    const expenses = await this.expenseService.getAllExpensesByAssetId(
      query.assetId,
      issuerId,
    );

    return {
      data: expenses,
      message: 'Asset expenses fetched successfully',
    };
  }

  /**
   * Get a specific asset expense by expense ID
   * GET /expense/:expenseId
   */
  @Get(':expenseId')
  @HttpCode(HttpStatus.OK)
  async getAssetExpenseById(
    @Req() req: any,
    @Param() params: ExpenseIdParamDto,
  ) {
    const issuerId = req.user?.userId;
    const expense = await this.expenseService.getExpenseByExpenseId(
      params.expenseId,
      issuerId,
    );

    return {
      data: expense,
      message: 'Asset expense fetched successfully',
    };
  }

  /**
   * Update a specific asset expense by expense ID
   * PUT /expense/:expenseId
   */
  @Put(':expenseId')
  @HttpCode(HttpStatus.OK)
  async updateAssetExpense(
    @Req() req: any,
    @Param() params: ExpenseIdParamDto,
    @Body() updateDto: UpdateAssetExpenseDto,
  ) {
    const issuerId = req.user?.userId;
    const updatedExpense = await this.expenseService.updateAssetExpense(
      params.expenseId,
      issuerId,
      updateDto,
    );

    return {
      data: updatedExpense,
      message: 'Asset expense updated successfully',
    };
  }

  /**
   * Delete a specific asset expense by expense ID
   * DELETE /expense/:expenseId
   */
  @Delete(':expenseId')
  @HttpCode(HttpStatus.OK)
  async deleteAssetExpense(
    @Req() req: any,
    @Param() params: ExpenseIdParamDto,
  ) {
    const issuerId = req.user?.userId;
    const result = await this.expenseService.deleteAssetExpense(
      params.expenseId,
      issuerId,
    );

    return {
      data: result,
      message: 'Asset expense deleted successfully',
    };
  }

  /**
   * Delete all expenses for an asset
   * DELETE /expense/asset/:assetId
   */
  @Delete('asset/:assetId')
  @HttpCode(HttpStatus.OK)
  async deleteAllAssetExpenses(
    @Req() req: any,
    @Param() params: AssetIdParamDto,
  ) {
    const issuerId = req.user?.userId;
    const result = await this.expenseService.deleteAllAssetExpenses(
      params.assetId,
      issuerId,
    );

    return {
      data: result,
      message: `Successfully deleted ${result.deletedCount} asset expenses`,
    };
  }
}
