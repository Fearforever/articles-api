import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiOkResponse, ApiCreatedResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { AuthDto } from "./dto/auth.dto";

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiCreatedResponse({
    description: 'User registered successfully',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Username already exists',
  })
  register(@Body() dto: AuthDto) {
    return this.authService.register(dto.username, dto.password);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiOkResponse({
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  login(@Body() dto: AuthDto) {
    return this.authService.login(dto.username, dto.password);
  }
}