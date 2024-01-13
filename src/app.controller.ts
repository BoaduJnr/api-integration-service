import { Controller, Get } from '@nestjs/common';
@Controller({ version: '1' })
export class AppController {
  @Get('/')
  async serverTest() {
    return {
      success: true,
      message: 'Server running',
    };
  }
}
