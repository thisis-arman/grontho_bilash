// otp.utils.ts

import nodemailer from "nodemailer";

// Configure the mailer
const transporter = nodemailer.createTransport({
  service: "gmail", // Or any other mail service you prefer
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your email password or app-specific password
  },
});

// Send OTP via email
export const sendOtpViaEmail = async (email: string, otp: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is: ${otp}`,
  };

  await transporter.sendMail(mailOptions);
};
