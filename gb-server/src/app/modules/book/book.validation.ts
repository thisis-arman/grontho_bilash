import { Types } from "mongoose";
import { z } from "zod";


const createBookSchema = z.object({
  user: z.string(),
  bookTitle: z
    .string({ message: "বইয়ের নাম দিতে হবে" })
    .min(1, { message: "বইয়ের নাম খালি রাখা যাবে না" }),
  price: z
    .number({ message: "দাম দিতে হবে" })
    .positive({ message: "দাম শূন্যের চেয়ে বেশি হতে হবে" }),
  description: z
    .string({ message: "বিবরণ দিতে হবে" })
    .min(1, { message: "বিবরণ খালি রাখা যাবে না" }),
  condition: z.enum(["Fresh", "Used"], {
    message: "বইয়ের অবস্থা 'Fresh' অথবা 'Used' হতে হবে",
  }),
  level: z.string({
    message: "লেভেল দিতে হবে"
  }),
  faculty: z.string({
    message: "ফ্যাকাল্টি দিতে হবে"
  }).optional(),
  department: z.string({
    message: "ডিপার্টমেন্ট দিতে হবে"
  }).optional(),
  isContactHidden: z.boolean({
    message: "যোগাযোগের তথ্য লুকানো থাকবে কি না, তা ঠিক করে দাও",
  }),
  isNegotiable: z.boolean({ message: "দাম আলোচনাসাপেক্ষ কি না, তা ঠিক করে দাও" }),
  images: z
    .array(z.string().url({ message: "প্রতিটি ছবির লিংক সঠিক হতে হবে" }), {
      message: "ছবিগুলোর লিংক সঠিকভাবে দিতে হবে",
    })
    .min(1, { message: "অন্তত একটি ছবি দিতে হবে" }),
  publicationYear: z
    .number({ message: "প্রকাশের বছর দিতে হবে" })
    .int({ message: "প্রকাশের বছর একটি পূর্ণসংখ্যা হতে হবে" }),
  transactionDate: z
    .date({ message: "লেনদেনের তারিখটি সঠিক হতে হবে" })
    .optional(),
  location: z
    .string({ message: "লোকেশন দিতে হবে" })
    .min(1, { message: "লোকেশন খালি রাখা যাবে না" }),
  deliveryOption: z.enum(["Pickup", "Shipping"], {
    message: "ডেলিভারির ধরন 'Pickup' অথবা 'Shipping' হতে হবে",
  }),
  shippingCost: z
    .number({ message: "শিপিং খরচ একটি সংখ্যা হতে হবে" })
    .positive({ message: "শিপিং খরচ শূন্যের চেয়ে বেশি হতে হবে" })
    .optional(),
});

const updateBookSchema = createBookSchema
  .pick({
    // Required in updates
    bookTitle: true,
    price: true,
  })
  .partial()
  .merge(
    createBookSchema.pick({
      // Always optional in updates
      condition: true,
      images: true,
      // Add other fields that should be optional
    })
  );

export const zodValidationSchema = {
  createBookSchema,
  updateBookSchema,
};
