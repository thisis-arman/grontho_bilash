import nodemailer, { Transporter } from "nodemailer";
import config from "../config";

// One reusable Gmail transport for notification emails (book alerts, ...).
// Sending never throws: a failed email must not break the request that
// triggered it.

let transporter: Transporter | null = null;
const getTransporter = () =>
  (transporter ??= nodemailer.createTransport({
    service: "gmail",
    auth: { user: config.email, pass: config.password },
  }));

export const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));

export const sendMail = async (mail: { to: string; subject: string; text: string; html: string }) => {
  if (!config.email || !config.password) return false;
  try {
    await getTransporter().sendMail({ from: `"Grontho Bilash" <${config.email}>`, ...mail });
    return true;
  } catch (error) {
    console.error("Email failed:", (error as Error).message);
    return false;
  }
};

// The site's standard email frame, so every notification looks the same.
export const emailLayout = (heading: string, bodyHtml: string) => `<div style="font-family:Helvetica,Arial,sans-serif;background:#f5f5f4;padding:32px 16px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;border-top:4px solid #f59e0b;">
    <h2 style="margin:0 0 12px;color:#1c1917;">${heading}</h2>
    ${bodyHtml}
    <p style="color:#a8a29e;margin:28px 0 0;font-size:12px;">গ্রন্থবিলাস · gronthobilash.com</p>
  </div>
</div>`;
