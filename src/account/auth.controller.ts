import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('account')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  signUp() {
    return { msg: 'signing up' };
  }
  @Post('verify')
  verify() {
    return { msg: 'login' };
  }
}
