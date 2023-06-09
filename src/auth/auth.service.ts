import { SendmailService } from './../sendmail/sendmail.service';
import { UsersService } from './../users/users.service';
import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as speakeasy from 'speakeasy';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private sendmailService: SendmailService,
  ) {}
  async generateOTP(secret) {
    const token = speakeasy.totp({
      secret: secret,
      encoding: 'base32',
    });
    return token;
  }
  async verifyOTP(secret, token) {
    const check = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token,
      window: 4,
    });
    return check;
  }
  async signIn(createAuthDto: CreateAuthDto) {
    const { email, password } = createAuthDto;
    const account = await this.usersService.findByEmail(email);
    const check = await bcrypt.compare(password, account.password);
    if (!account || !check) {
      return 'Email or password is incorrect';
    }
    if (!account.verified) {
      const token = await this.generateOTP(account.id);

      await this.sendmailService.sendVerifiedEmail(account.email, token);
      return 'Please verified this account.';
    }
    const payload = account.email;
    const access_token: string = await this.jwtService.sign({ payload });
    return `jwt: ${access_token}`;
  }
}
