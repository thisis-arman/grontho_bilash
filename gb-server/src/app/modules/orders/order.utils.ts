import nodemailer from "nodemailer";
import config from "../../config";
import { TOrder } from "./order.interface";

export const sendEmailAboutOrderDetailtoSystemAdmin = async (
  email: string,
  order: TOrder
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
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
    to: email,
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
    console.log("Order notification email sent:", info.response);
  } catch (error) {
    console.error("Failed to send order notification:", error);
  }
};