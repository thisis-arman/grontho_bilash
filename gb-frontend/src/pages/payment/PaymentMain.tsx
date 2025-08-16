import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "./CheckoutForm";
import React, { useEffect, useState } from "react";

const stripePromise = loadStripe("pk_test_51NEOh0J6vP03PB2ILt5O7hn75B5d8YyGSS2sPiBDw5lNR3YPDB8osmyLP0I1mbbBJyIsOkcPLjt5kGTFBp70yoUi00C93xJduk");

const PaymentMain = () => {
  const [clientSecret, setClientSecret] = useState("");
  

  useEffect(() => {
    fetch("http://localhost:5000/api/v1/payments/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 1000, currency: "usd" }), 
    })
      .then((res) => res.json())
      .then((data) =>{
        setClientSecret(data?.data.clientSecret);
      });
  }, []);

  if (!clientSecret) return <p>Loading payment...</p>;

  return (
   <Elements stripe={stripePromise} options={{
  clientSecret,
  appearance: {
    theme: 'stripe', 
    labels: 'floating', 
    variables: {
      colorPrimary: '#0570de',
      colorBackground: '#ffffff',
      colorText: '#30313d',
      borderRadius: '8px',
      spacingUnit: '4px',
    },
    rules: {
      ".Input": { padding: '12px' },
      ".Label": { fontSize: '14px' }
    }
  }
}}>
      <div className="">
        <CheckoutForm />
      </div>
    </Elements>
  );
};

export default PaymentMain;
