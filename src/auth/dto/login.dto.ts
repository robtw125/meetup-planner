import { IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  password: string;
}
