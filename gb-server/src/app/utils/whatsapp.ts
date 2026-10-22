import config from "../config";

// Automatic WhatsApp order updates through Meta's WhatsApp Cloud API.
//
// Off until these are set (Vercel → Environment Variables):
//   WHATSAPP_TOKEN            permanent access token of the WhatsApp Business app
//   WHATSAPP_PHONE_NUMBER_ID  the sending number's ID (not the phone number itself)
//   WHATSAPP_ORDER_TEMPLATE   approved template name (default: order_status_update)
//   WHATSAPP_TEMPLATE_LANG    template language code (default: bn)
//
// Messages a business starts must use a template Meta has approved. The
// template body must have 4 variables, in this order:
//   {{1}} customer name · {{2}} order ID · {{3}} status · {{4}} link
// e.g. "প্রিয় {{1}}, আপনার অর্ডার {{2}} এর বর্তমান অবস্থা: {{3}}। বিস্তারিত: {{4}}"
//
// Sending never throws and gives up after 5 seconds, so an outage at Meta
// can't block or fail an order.

const API_VERSION = "v21.0";
const ORDERS_URL = "https://www.gronthobilash.com/user/my-orders";

export const ORDER_STATUS_BN: Record<string, string> = {
  pending: "অর্ডার পেয়েছি, শীঘ্রই নিশ্চিত করা হবে",
  confirmed: "অর্ডার নিশ্চিত হয়েছে",
  shipped: "বই পাঠানো হয়েছে",
  delivered: "বই পৌঁছে গেছে",
  cancelled: "অর্ডার বাতিল হয়েছে",
};

// Bangladeshi mobile number in WhatsApp's format (8801XXXXXXXXX), or null.
export const toWhatsAppNumber = (phone: string | undefined | null) => {
  let digits = String(phone ?? "").replace(/\D/g, "");
  if (digits.startsWith("01") && digits.length === 11) digits = `88${digits}`;
  if (digits.startsWith("1") && digits.length === 10) digits = `880${digits}`;
  return /^8801[3-9]\d{8}$/.test(digits) ? digits : null;
};

export const isWhatsAppConfigured = () => Boolean(config.whatsapp_token && config.whatsapp_phone_number_id);

const sendTemplate = async (to: string, params: string[]) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(`https://graph.facebook.com/${API_VERSION}/${config.whatsapp_phone_number_id}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${config.whatsapp_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: config.whatsapp_order_template,
          language: { code: config.whatsapp_template_lang },
          components: [
            {
              type: "body",
              // Template variables may not contain new lines or long runs of spaces.
              parameters: params.map((text) => ({ type: "text", text: text.replace(/\s+/g, " ").slice(0, 200) })),
            },
          ],
        },
      }),
      signal: controller.signal,
    });
    if (!response.ok) {
      console.error("WhatsApp message failed:", response.status, (await response.text()).slice(0, 300));
    }
    return response.ok;
  } catch (error) {
    console.error("WhatsApp message failed:", (error as Error).message);
    return false;
  } finally {
    clearTimeout(timer);
  }
};

type OrderLike = { orderId: string; orderStatus?: string; phoneNumber?: string; recipientName?: string };

// Tells the buyer about a new order or a status change.
export const notifyOrderStatus = async (order: OrderLike) => {
  if (!isWhatsAppConfigured()) return false;
  const to = toWhatsAppNumber(order.phoneNumber);
  if (!to) return false;
  return sendTemplate(to, [
    order.recipientName?.trim() || "গ্রাহক",
    order.orderId,
    ORDER_STATUS_BN[order.orderStatus ?? "pending"] ?? order.orderStatus ?? "",
    ORDERS_URL,
  ]);
};
