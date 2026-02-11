import { IsString, IsNotEmpty } from 'class-validator';

export class CheckTokenSymbolDto {
  @IsString()
  @IsNotEmpty()
  symbol: string;
}

