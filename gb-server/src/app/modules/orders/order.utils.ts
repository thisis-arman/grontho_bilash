import nodemailer from "nodemailer";
import config from "../../config";
import { TOrder } from "./order.interface";

export const sendEmailAboutOrderDetailtoSystemAdmin = async (
  adminEmails: string[],
  order: TOrder
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    secure: false,
    auth: {
      user: config.email,
      pass: config.password,
    },
  });

  const orderedBooks = order.books
    .map(
      (book, index) => `
      <tr>
        <td style="padding:10px;border:1px solid #e5e7eb;">${index + 1}</td>
        <td style="padding:10px;border:1px solid #e5e7eb;">${book.bookTitle}</td>
        <td style="padding:10px;border:1px solid #e5e7eb;text-align:center;">${book.quantity}</td>
        <td style="padding:10px;border:1px solid #e5e7eb;text-align:right;">৳${book.price}</td>
      </tr>
    `
    )
    .join("");

  const mailOptions = {
    from: `"Grontho Bilash" <${config.email}>`,
    to: adminEmails,
    subject: `🛒 New Order Received | ${order.orderId}`,

    text: `
New Order Received

Order ID: ${order.orderId}

Customer:
${order.email}
${order.phoneNumber}

Total: ৳${order.totalAmount}

Please login to the admin dashboard to process this order.
    `,

    html: `
<div style="background:#f5f5f4;padding:40px 20px;font-family:Arial,Helvetica,sans-serif;">

<div style="max-width:700px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e7e5e4;">

<div style="background:#f59e0b;padding:30px;text-align:center;">
<img
src="https://res.cloudinary.com/dshjcmrd0/image/upload/v1771834927/grontho-bilash-transparent.png.png"
width="170"
/>

<h2 style="margin:20px 0 0;color:white;">
New Order Received
</h2>

<p style="color:#fef3c7;">
A customer has placed a new order.
</p>
</div>


<div style="padding:30px;">

<h3 style="margin-top:0;color:#292524;">
Order Information
</h3>

<table style="width:100%;border-collapse:collapse;margin-bottom:25px;">

<tr>
<td style="padding:8px;font-weight:bold;">Order ID</td>
<td>${order.orderId}</td>
</tr>

<tr>
<td style="padding:8px;font-weight:bold;">Payment Method</td>
<td>${order.paymentMethod.toUpperCase()}</td>
</tr>

<tr>
<td style="padding:8px;font-weight:bold;">Payment Status</td>
<td>${order.paymentStatus}</td>
</tr>

<tr>
<td style="padding:8px;font-weight:bold;">Total Amount</td>
<td><strong>৳${order.totalAmount}</strong></td>
</tr>

<tr>
<td style="padding:8px;font-weight:bold;">Shipping Cost</td>
<td>৳${order.shippingCost}</td>
</tr>

</table>


<h3 style="color:#292524;">
Customer Information
</h3>

<table style="width:100%;border-collapse:collapse;margin-bottom:25px;">

<tr>
<td style="padding:8px;font-weight:bold;">Email</td>
<td>${order.email}</td>
</tr>

<tr>
<td style="padding:8px;font-weight:bold;">Phone</td>
<td>${order.phoneNumber}</td>
</tr>

<tr>
<td style="padding:8px;font-weight:bold;">Address</td>
<td>${order.deliveryAddress}</td>
</tr>

<tr>
<td style="padding:8px;font-weight:bold;">Shipping Area</td>
<td>${order.shippingArea}</td>
</tr>

</table>


<h3 style="color:#292524;">
Ordered Products
</h3>

<table
style="width:100%;border-collapse:collapse;margin-top:10px;"
>

<thead>

<tr style="background:#f5f5f4;">
<th style="padding:10px;border:1px solid #e5e7eb;">#</th>
<th style="padding:10px;border:1px solid #e5e7eb;">Book</th>
<th style="padding:10px;border:1px solid #e5e7eb;">Qty</th>
<th style="padding:10px;border:1px solid #e5e7eb;">Price</th>
</tr>

</thead>

<tbody>

${orderedBooks}

</tbody>

</table>

${order.comment
        ? `
<h3 style="margin-top:30px;color:#292524;">
Customer Comment
</h3>

<div style="background:#fafaf9;padding:15px;border-radius:8px;border-left:4px solid #f59e0b;">
${order.comment}
</div>
`
        : ""
      }

<div
style="
margin-top:35px;
padding:18px;
background:#fef3c7;
border:1px solid #fde68a;
border-radius:10px;
"
>

<strong>Action Required</strong>

<p style="margin-top:8px;color:#444;">
Please log in to the Grontho Bilash Admin Dashboard and process this order as soon as possible.
</p>

</div>

</div>


<div
style="
background:#fafaf9;
padding:18px;
text-align:center;
font-size:12px;
color:#78716c;
"
>

© ${new Date().getFullYear()} Grontho Bilash

</div>

</div>

</div>
`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    //console.log("Order notification email sent:", info.response);
  } catch (error) {
    console.error("Failed to send order notification:", error);
  }
};
const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));

// Receipt for the buyer. One email per checkout, even when the cart was
// split into several orders (one per seller).
export const sendOrderConfirmationToBuyer = async (email: string, orders: TOrder[]) => {
  if (!orders.length) return;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: config.email, pass: config.password },
  });

  const total = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const first = orders[0];
  const rows = orders
    .flatMap((order) =>
      order.books.map(
        (item) => `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #e7e5e4;">${escapeHtml(item.bookTitle)} × ${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e7e5e4;text-align:right;">৳${item.price * item.quantity}</td>
        </tr>`
      )
    )
    .join("");
  const delivery = orders.reduce((sum, order) => sum + order.shippingCost, 0);
  const ids = orders.map((order) => order.orderId).join(", ");

  try {
    await transporter.sendMail({
      from: `"Grontho Bilash" <${config.email}>`,
      to: email,
      subject: `তোমার অর্ডার পেয়েছি | ${ids}`,
      text: `অর্ডার করার জন্য ধন্যবাদ (${ids})। মোট: ৳${total}। আমরা শিগগিরই অর্ডারটি কনফার্ম করব। 'আমার অর্ডার' পাতায় যেকোনো সময় অর্ডারের অবস্থা দেখতে পারবে।`,
      html: `<div style="font-family:Helvetica,Arial,sans-serif;background:#f5f5f4;padding:32px 16px;">
        <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;border-top:4px solid #f59e0b;">
          <h2 style="margin:0 0 8px;color:#1c1917;">ধন্যবাদ, ${escapeHtml(first.recipientName ?? "")}! তোমার অর্ডার আমরা পেয়েছি।</h2>
          <p style="color:#57534e;margin:0 0 24px;">অর্ডার ${escapeHtml(ids)} কনফার্মেশনের অপেক্ষায় আছে। আমরা তোমার পেমেন্ট যাচাই করে বিক্রেতা${orders.length > 1 ? "দের" : ""}কে জানিয়ে দেব।</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;color:#1c1917;">${rows}
            <tr><td style="padding:8px 0;color:#57534e;">ডেলিভারি চার্জ</td><td style="padding:8px 0;text-align:right;">৳${delivery}</td></tr>
            <tr><td style="padding:8px 0;font-weight:bold;">মোট</td><td style="padding:8px 0;text-align:right;font-weight:bold;">৳${total}</td></tr>
          </table>
          <p style="color:#57534e;margin:24px 0 0;font-size:14px;">ডেলিভারির ঠিকানা: ${escapeHtml(first.deliveryAddress)} · ${escapeHtml(first.phoneNumber)}</p>
          <p style="color:#a8a29e;margin:24px 0 0;font-size:12px;">gronthobilash.com-এর 'আমার অর্ডার' পাতায় তুমি তোমার অর্ডারের খোঁজ রাখতে পারবে।</p>
        </div>
      </div>`,
    });
  } catch (error) {
    console.error("Failed to send order confirmation to buyer:", error);
  }
};
