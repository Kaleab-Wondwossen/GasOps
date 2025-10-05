import "dotenv/config";

export const env = {
    PORT: process.env.PORT || "8080",
    NODE_ENV: process.env.NODE_ENV || "development",
    APP_NAME: process.env.APP_NAME || "gasops-server",
    MONGO_URI: process.env.MONGO_URI || "",

    JWT_SECRET: process.env.JWT_SECRET || "dev-secret",
    OTP_CODE_TTL_MIN: Number(process.env.OTP_CODE_TTL_MIN || "10"),
    OTP_RESEND_COOLDOWN_SEC: Number(process.env.OTP_RESEND_COOLDOWN_SEC || "60"),
    OTP_MAX_ATTEMPTS: Number(process.env.OTP_MAX_ATTEMPTS || "5"),
    SMS_FROM: process.env.SMS_FROM || "GASOPS",

    // TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    // TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    // TWILIO_FROM: process.env.TWILIO_FROM,
    SMS_PROVIDER: process.env.SMS_PROVIDER || "console",
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_FROM: process.env.TWILIO_FROM,


};
