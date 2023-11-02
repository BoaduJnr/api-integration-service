import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAccountDTO } from './dto/auth.dto';

@Controller('account')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async signUp(
    @Body(new ValidationPipe({ whitelist: true })) data: CreateAccountDTO,
  ) {
    try {
      // con
      console.log(data);
      // const account = await this.authService.createAccount(createAccountDTO);
      // return account;
      return { msg: 'Heweeey' };
    } catch (err) {}
  }
  @Post('verify')
  verify() {
    return { msg: 'login' };
  }
}
