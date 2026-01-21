import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength, MinLength } from "class-validator";

export class AuthDto {
  @ApiProperty()
  @IsString()
  @MinLength(4)
  @MaxLength(32)
  username: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  @MaxLength(128)
  password: string;
}