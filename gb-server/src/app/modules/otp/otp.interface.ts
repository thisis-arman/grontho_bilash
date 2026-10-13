export interface Otp {
  email: string;
  otp: number;
  expiresAt: Date;
  verified: boolean;
  verifiedAt?: Date;
  attempts: number;
}
