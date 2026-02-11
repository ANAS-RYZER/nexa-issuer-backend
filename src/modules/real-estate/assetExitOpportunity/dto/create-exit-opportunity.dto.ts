import {
  IsString,
  IsNotEmpty,
} from 'class-validator';

export class CreateExitOpportunityDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}

