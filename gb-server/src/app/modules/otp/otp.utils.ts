import nodemailer from "nodemailer";
import config from "../../config";
import AppError from "../../errors/AppError";

export const sendEmail = async (email: string, otp: number) => {
  // Configure the mailer
  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    secure: false, // Use false for TLS
    auth: {
      user: config.email, // Your email
      pass: config.password, // Your email password or app-specific password
    },
  });

  // Send OTP via email
  const mailOptions = {
    from: `"Grontho Bilash" <${config.email}>`,
    to: email,
    subject: "তোমার OTP যাচাই কোড | Grontho Bilash",
    text: `তোমার OTP কোড: ${otp}`, // Fallback for email clients that don't support HTML
    html: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5; padding: 40px 20px; text-align: center;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border-top: 5px solid #EAB308;">
              <img src="https://res.cloudinary.com/dshjcmrd0/image/upload/v1771834927/grontho-bilash-transparent.png.png" alt="Grontho Bilash লোগো" style="max-width: 180px; margin-bottom: 25px;">
              <h2 style="color: #1f2937; margin-bottom: 15px; font-size: 24px; font-weight: 700;">যাচাই কোড</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 35px;">
                  হ্যালো,<br><br>
                  যাচাই প্রক্রিয়া শেষ করতে নিচের ওয়ান-টাইম পাসওয়ার্ড (OTP) ব্যবহার করো। এই কোড কারও সাথে শেয়ার করো না।
              </p>
              <div style="background-color: #FEF9C3; border: 2px dashed #EAB308; padding: 20px 30px; display: inline-block; border-radius: 10px; margin-bottom: 30px;">
                  <span style="font-size: 38px; font-weight: bold; letter-spacing: 8px; color: #CA8A04;">${otp}</span>
              </div>
              <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">
                  এই কোডের মেয়াদ কিছুক্ষণের মধ্যেই শেষ হয়ে যাবে। তুমি এই কোড না চেয়ে থাকলে ইমেইলটি নিশ্চিন্তে উপেক্ষা করতে পারো।
              </p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0 20px 0;">
              <p style="color: #9ca3af; font-size: 12px; line-height: 1.5;">
                  <strong>Grontho Bilash</strong><br>
                  &copy; ${new Date().getFullYear()} Grontho Bilash. সর্বস্বত্ব সংরক্ষিত।
              </p>
          </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new AppError(
      502,
      "যাচাইয়ের ইমেইল পাঠানো যায়নি। অনুগ্রহ করে একটু পরে আবার চেষ্টা করো।"
    );
  }
};
