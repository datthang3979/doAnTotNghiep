/* eslint-disable @typescript-eslint/no-empty-function */
import { Flashsale } from './../flashsales/entities/flashsale.entity';
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
@Injectable()
export class SendmailService {
  constructor(private readonly mailerService: MailerService) {}
  async sendVerifiedEmail(email: string, token: string) {
    this.mailerService
      .sendMail({
        to: `${email}`, // list of receivers
        from: 'thantaiong@gmail.com', // sender address
        subject: 'Verify your email', // Subject line
        text: `Your OTP: ${token}`, // plaintext body
        // html: '<h1>welcome</h1>', // HTML body content
      })
      .then((success) => {})
      .catch((err) => {});
  }
  async sendForgetPassword(email: string, token: string) {
    this.mailerService
      .sendMail({
        to: email, // list of receivers
        from: 'thantaiong@gmail.com', // sender address
        subject: 'Forget password', // Subject line
        text: `You want to reset your password. This is your OTP: ${token}.\nPlease don't share this code for anyone.`, // plaintext body
        // html: '<h1>welcome</h1>', // HTML body content
      })
      .then((success) => {})
      .catch((err) => {});
  }
  async sendNotification(email: string, flashsale: Flashsale) {
    this.mailerService
      .sendMail({
        to: `${email}`, // list of receivers
        from: 'thantaiong@gmail.com', // sender address
        subject: 'Flashsale notification', // Subject line
        text: `Welcome to flashsale: ${flashsale.name}.\n This flashsale start from: ${flashsale.startSale} to ${flashsale.endSale} `,
        // html: '<h1>welcome</h1>', // HTML body content
      })
      .then((success) => {})
      .catch((err) => {});
  }
}
