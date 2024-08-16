import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { FormEvent, useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom"
import Wrapper from "../components/Wrapper";
import config from "../../../config";
import { Spinner } from "flowbite-react";
import swal from "sweetalert";

const stripePromise = loadStripe("pk_test_51PoK8yIWRO1wD2nNRseVeYLNAslyUb1cuRr8H4ZreTTPJAumlZS3Hqp2xKRONDKvKLATBTfvA8JK5vw6Y2vWB3UR00Cmt8K7yO");

export default function Checkout() {
    const { secret } = useParams();
    return <Elements options={{ appearance: { theme: "stripe" }, clientSecret: secret }} stripe={stripePromise}>
        <CheckoutForm />
    </Elements>
}

function CheckoutForm() {
    const { secret } = useParams();
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState<string>();
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!stripe) return;
        if (!secret) return;

        stripe.retrievePaymentIntent(secret).then(({ paymentIntent }) => {
            switch (paymentIntent?.status) {
                case "processing":
                    setMessage("Your payment is processing.");
                    break;
                case "requires_payment_method":
                    setMessage("Your payment was not successful, please try again.");
                    break;
                default:
                    setMessage("Something went wrong.");
                    break;
            }
        });
    }, [stripe]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!stripe || !elements) return;
        setIsLoading(true);

        const { error } = await stripe.confirmPayment({ elements, redirect: "if_required" });
        if (!error) {
            swal("Thank you for making your purchase!", { icon: "success" });
            navigate("/");
        }

        if (error?.type == "card_error" || error?.type == "validation_error") setMessage(error?.message);
        else setMessage("An unexpected error has occurred.");
        setIsLoading(false);
    }

    return <Wrapper>
        <div className="rounded-md mt-4 py-6 px-4 max-w-[1400px]">
            <form onSubmit={handleSubmit} className="p-4">
                <h1 className="text-2xl mb-4 text-gray-700">You are currently making a purchase!</h1>
                <PaymentElement className="mb-8" options={{ layout: "tabs" }} />
                <button disabled={isLoading || !stripe || !elements} className="cursor-pointer text-white font-semibold bg-secondary rounded-md w-full py-[6px] px-2 mb-2 disabled:bg-primary">
                    {isLoading ? <Spinner /> : "Pay Now"}
                </button>
                {message && <p className="text-red-500 text-sm">{message}</p>}
            </form>

        </div>
    </Wrapper>
}