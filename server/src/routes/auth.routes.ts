import { Router } from "express";
import { postOtpRequest, postOtpVerify } from "../controllers/auth.controller";

const r = Router();
r.post("/auth/otp/request", postOtpRequest);
r.post("/auth/otp/verify", postOtpVerify);
export default r;
