import { IsOptional, IsIn, IsString } from "class-validator";
import { Type } from "class-transformer";

export class SendAssetApprovalDto {
  @IsIn(["pending"], {
    message: "Status must be pending",
  })
  status: "pending";

  @IsOptional()
  @IsString()
  issuerComments?: string;
}
