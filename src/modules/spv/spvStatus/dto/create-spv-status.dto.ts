import { IsOptional,  IsIn, IsString} from 'class-validator';
import { Type } from 'class-transformer';


export class CreateSpvStatusDto {
  @IsIn(['Pending'], {
    message: 'Status must be Pending',
  })
  status: 'Pending';

  @IsOptional()
  @IsString()
  issuerComments?: string;
}

