import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { FormEvent, useState } from "react";
import { ShieldCheck, Lock, Loader2, CreditCard } from "lucide-react"; // Modern icons

const CheckoutForm = ({ paymentIntent }: { paymentIntent: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [errorMessage, setErrorMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage("");

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/success`, 
      },
    });

    // If we reach this point, it means there was an error
    if (error) {
      setErrorMessage(error.message ?? "An unexpected error occurred.");
    } else {
      console.log("Payment initiated for:", paymentIntent);
    }

    setIsProcessing(false);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mt-24 mb-4">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center ">
        <h2 className="font-bold text-gray-800 flex items-center gap-2">
          <CreditCard size={18} className="text-yellow-600" />
          Secure Payment
        </h2>
        <div className="flex items-center gap-1 text-green-600 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck size={14} />
          SSL Encrypted
        </div>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="min-h-[250px]">
             <PaymentElement 
                options={{
                    layout: "tabs",
                }}
             />
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg animate-pulse">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={!stripe || isProcessing}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-200 flex items-center justify-center gap-2 shadow-md ${
              isProcessing || !stripe
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-yellow-600 hover:bg-yellow-700 active:scale-[0.98]"
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Processing Payment...
              </>
            ) : (
              <>
                <Lock size={18} />
                Pay Safely Now
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <p className="mt-6 text-center text-xs text-gray-400 flex items-center justify-center gap-1">
            Powered by <span className="font-bold text-indigo-500 italic">Stripe</span>
        </p>
      </div>
    </div>
  );
};

export default CheckoutForm;