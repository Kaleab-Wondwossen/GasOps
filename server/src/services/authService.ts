import { OtpCodeModel } from "../models/OtpCode";
import { UserModel } from "../models/User";
import { normalizePhone } from "../utils/phone";
import { sha256 } from "../utils/hash";
import { signJwt } from "./jwt";
import { ConsoleSmsSender, SmsSender, TwilioSmsSender } from "./smsService";
import { env } from "../config/env";

// const sms: SmsSender = new ConsoleSmsSender(); // swap with a real provider later

function genCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
}

// choose at runtime
function buildSms(): SmsSender {
  if (env.SMS_PROVIDER.toLowerCase() === "twilio") {
    return new TwilioSmsSender();
  }
  return new ConsoleSmsSender();
}
const sms: SmsSender = buildSms();
export async function requestOtp(payload: { phone: string }) {
  const phone = normalizePhone(payload.phone);

  // Enforce resend cooldown: find last OTP for this phone
  const last = await OtpCodeModel.findOne({ phone }).sort({ createdAt: -1 });
  const now = new Date();
  if (last?.cooldownUntil && last.cooldownUntil > now) {
    const wait = Math.ceil((last.cooldownUntil.getTime() - now.getTime()) / 1000);
    throw new Error(`Please wait ${wait}s before requesting another code`);
  }

  const code = genCode();
  const expiresAt = new Date(Date.now() + env.OTP_CODE_TTL_MIN * 60 * 1000);
  const cooldownUntil = new Date(Date.now() + env.OTP_RESEND_COOLDOWN_SEC * 1000);

  await OtpCodeModel.create({
    phone,
    codeHash: sha256(code),
    attempts: 0,
    cooldownUntil,
    expiresAt
  });

  await sms.send(phone, `Your ${env.SMS_FROM} login code is ${code}. It expires in ${env.OTP_CODE_TTL_MIN} minutes.`);

  return { ok: true, ttlMin: env.OTP_CODE_TTL_MIN };
}

export async function verifyOtp(payload: {
  phone: string;
  code: string;
  stationId: string;   // which station to associate new users with
  displayName?: string;
}) {
  const phone = normalizePhone(payload.phone);
  const codeHash = sha256(payload.code);

  const rec = await OtpCodeModel.findOne({ phone, used: false })
    .sort({ createdAt: -1 });

  if (!rec) throw new Error("No OTP request found for this phone");
  if (rec.expiresAt < new Date()) throw new Error("OTP expired");

  // attempts
  if (rec.attempts >= env.OTP_MAX_ATTEMPTS) throw new Error("Too many attempts. Request a new code.");

  if (rec.codeHash !== codeHash) {
    rec.attempts += 1;
    await rec.save();
    throw new Error("Invalid code");
  }

  rec.used = true;
  await rec.save();

  // Find or create user
  let user = await UserModel.findOne({ phone });
  if (!user) {
    user = await UserModel.create({
      phone,
      displayName: payload.displayName || phone,
      role: "staff",
      stationId: payload.stationId
    });
  } else if (!user.stationId && payload.stationId) {
    user.stationId = payload.stationId;
    await user.save();
  }
  user.lastLoginAt = new Date();
  await user.save();

  const token = signJwt({ id: user.id, phone: user.phone, role: user.role, stationId: user.stationId });
  return { token, user: { id: user.id, phone: user.phone, role: user.role, stationId: user.stationId, displayName: user.displayName } };
}
