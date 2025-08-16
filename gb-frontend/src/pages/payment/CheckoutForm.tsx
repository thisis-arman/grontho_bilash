import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { FormEvent, useState } from "react";

const CheckoutForm = ({paymentIntent }:{paymentIntent:string}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: "http://localhost:5173/success", 
      },
    });

    if (!error && paymentIntent) {
  console.log("PaymentIntent ID:", paymentIntent);
}
    if (error) {
      setErrorMessage(error.message ?? "Payment failed");
    }
  };

  return (
        <div className="p-5">
                <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button type="submit" className="px-5 bg-green-700 rounded-md shadow-sm text-white mt-4" disabled={!stripe}>Pay Now</button>
      {errorMessage && <div>{errorMessage}</div>}
    </form>
        </div>
  );
};

export default CheckoutForm;
