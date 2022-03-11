import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCheckoutSesssion {
  @IsString()
  @IsNotEmpty()
  planId: string;
}
