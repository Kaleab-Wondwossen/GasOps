// Pluggable SMS service. For dev, we log to console.
// Swap with Twilio/other provider in production.

import twilio from "twilio";
import { env } from "../config/env";

export interface SmsSender {
  send(to: string, body: string): Promise<void>;
}

export class ConsoleSmsSender implements SmsSender {
  async send(to: string, body: string) {
    console.log(`[SMS->${to}] ${body}`);
  }
}

export interface SmsSender {
  send(to: string, body: string): Promise<void>;
}

export class TwilioSmsSender implements SmsSender {
  private client: ReturnType<typeof twilio>;
  private from: string;

  constructor() {
    if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) {
      throw new Error("Twilio credentials missing");
    }
    this.client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
    // prefer dedicated number if set; else fall back to SMS_FROM
    this.from = env.TWILIO_FROM || env.SMS_FROM;
  }

  async send(to: string, body: string) {
    // Ensure E.164 format (e.g., +2519xxxxxxx)
    if (!/^\+?[1-9]\d{6,14}$/.test(to)) {
      throw new Error(`Invalid E.164 phone: ${to}`);
    }
    await this.client.messages.create({
      to,
      from: this.from,
      body,
    });
  }
}

// Example Twilio impl (commented)
// import twilio from "twilio";
// export class TwilioSmsSender implements SmsSender {
//   private client;
//   private from: string;
//   constructor(accountSid: string, authToken: string, from: string) {
//     this.client = twilio(accountSid, authToken);
//     this.from = from;
//   }
//   async send(to: string, body: string) {
//     await this.client.messages.create({ to, from: this.from, body });
//   }
// }
