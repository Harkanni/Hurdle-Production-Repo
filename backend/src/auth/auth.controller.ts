import { Controller, Post, Get, Body, UseGuards, Req, HttpCode } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

@Controller('api')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Matches README contract: POST /api/register
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // Matches README contract: POST /api/login
 @Post('login')
@HttpCode(200)
login(@Body() dto: LoginDto) {
  return this.authService.login(dto);
}

  // Not in the README's suggested contract - added for session checking.
  // Confirm with the team before frontend relies on it, or drop if unneeded.
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: Request & { user: { userId: string } }) {
    return this.authService.findById(req.user.userId);
  }

  // Same note as above - not in the original contract, included for completeness.
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout() {
    return { message: 'Logged out. Discard your token client-side.' };
  }
}