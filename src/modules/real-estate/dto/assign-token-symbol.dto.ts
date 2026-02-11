import { IsString, IsNotEmpty } from 'class-validator';

export class AssignTokenSymbolDto {
  @IsString()
  @IsNotEmpty()
  symbol: string;
}

