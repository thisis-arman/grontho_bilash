import nodemailer from "nodemailer";
import config from "../../config";

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
    subject: "Your OTP Verification Code | Grontho Bilash",
    text: `Your OTP code is: ${otp}`, // Fallback for email clients that don't support HTML
    html: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5; padding: 40px 20px; text-align: center;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border-top: 5px solid #EAB308;">
              <img src="https://res.cloudinary.com/dshjcmrd0/image/upload/v1771834927/grontho-bilash-transparent.png.png" alt="Grontho Bilash Logo" style="max-width: 180px; margin-bottom: 25px;">
              <h2 style="color: #1f2937; margin-bottom: 15px; font-size: 24px; font-weight: 700;">Verification Code</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 35px;">
                  Hello,<br><br>
                  Please use the following One-Time Password (OTP) to complete your verification process. Do not share this code with anyone.
              </p>
              <div style="background-color: #FEF9C3; border: 2px dashed #EAB308; padding: 20px 30px; display: inline-block; border-radius: 10px; margin-bottom: 30px;">
                  <span style="font-size: 38px; font-weight: bold; letter-spacing: 8px; color: #CA8A04;">${otp}</span>
              </div>
              <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">
                  This code will expire shortly. If you did not request this verification, you can safely ignore this email.
              </p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0 20px 0;">
              <p style="color: #9ca3af; font-size: 12px; line-height: 1.5;">
                  <strong>Grontho Bilash</strong><br>
                  &copy; ${new Date().getFullYear()} Grontho Bilash. All rights reserved.
              </p>
          </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
