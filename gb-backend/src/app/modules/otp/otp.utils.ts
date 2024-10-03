// otp.utils.ts

import nodemailer from "nodemailer";
import config from "../../config";

// Configure the mailer
const transporter = nodemailer.createTransport({
  service: "gmail", // Or any other mail service you prefer
  auth: {
    user: config.email, // Your email
    pass: config.password, // Your email password or app-specific password
  },
});

// Send OTP via email
export const sendOtpViaEmail = async (email: string, otp: number) => {
  const mailOptions = {
    from: config.email,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is: ${otp}`,
  };

  await transporter.sendMail(mailOptions);
};
