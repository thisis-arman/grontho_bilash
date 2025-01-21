// stripe.js
import Stripe from"stripe";
import config from "../../config";
const stripe = new Stripe(config.stripe_sk as string);

module.exports = stripe;
