import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAccountDTO } from './dto/auth.dto';
import { APIKey } from './decorators';

@Controller('account')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async createAccount(
    @Body(new ValidationPipe({ whitelist: true })) data: CreateAccountDTO,
  ) {
    data.API_Key = 'trying';
    return this.authService.createAccount(data);
  }

  @Get('verify')
  verifyAPIKey(@APIKey('X-API-KEY') API_Key: string) {
    return this.authService.getAccount({ API_Key });
  }
  @Post('generate')
  generateAPIKey() {
    return { msg: 'login' };
  }
  @Patch('deactivate')
  deactivateAPIKey() {
    return { msg: 'login' };
  }
}
