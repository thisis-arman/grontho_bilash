import nodemailer from "nodemailer";
import config from "../../config";

export const sendEmail = async (email: string, otp: number) => {
  // Configure the mailer
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use false for TLS
    auth: {
      user: config.email, // Your email
      pass: config.password, // Your email password or app-specific password
    },
  });

  // Send OTP via email
  const mailOptions = {
    from: config.email,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is: ${otp}`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
