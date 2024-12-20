import { loadStripe } from "@stripe/stripe-js";
import type { Stripe, StripeElements, StripeCardElement } from "@stripe/stripe-js";
import { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import Wrapper from "../../components/Wrapper";
import StripeLogo from "../../../assets/stripe_logo.png";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../../../../config.json";
import { Contact } from "../../../utils/v2/entities/Contact";

enum PaymentMethod {
    CREDIT_CARD = "Credit Card",
    PAYNOW = "PayNow",
    GRABPAY = "GrabPay",
}

export default function Payment() {
    const location = useLocation();
    const { paymentMethod, amount, isRecurring, scontact } = location.state || {};

    const navigate = useNavigate();

    const contact: Contact = scontact;
    const [stripe, setStripe] = useState<Stripe | null>(null);
    const [elements, setElements] = useState<StripeElements | null>(null);
    const [cardElement, setCardElement] = useState<StripeCardElement | null>(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState<number>(1);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [processingFee, setProcessingFee] = useState<number>(0);
    const [totalAmount, setTotalAmount] = useState<number>(amount);
    const [absorbFee, setAbsorbFee] = useState<boolean>(true);
    const [paymentMethodId, setPaymentMethodId] = useState<string>();

    useEffect(() => {
        const initialiseStripe = async () => {
            const stripeInstance = await loadStripe(import.meta.env.VITE_TEST_STRIPE_PUBLISHABLE_KEY);
            if (stripeInstance) {
                setStripe(stripeInstance);

                if (paymentMethod === PaymentMethod.CREDIT_CARD && stripeInstance) {
                    const elementsInstance = stripeInstance.elements();
                    setElements(elementsInstance);

                    const cardElementInstance = elementsInstance.create("card", {
                        style: {
                            base: {
                                color: "#5A71B4",
                                fontSize: "16px",
                                "::placeholder": { color: "#AAB7C4" },
                            },
                            invalid: { color: "#D9D9D9" }
                        },
                        hidePostalCode: true,
                    });
                    console.log(cardElementInstance);

                    setCardElement(cardElementInstance);
                }
            }
        };

        initialiseStripe();
        calculateFees();
        setLoading(false);
    }, [absorbFee]);

    useEffect(() => {
        // Wait for loading to be false and then mount the card element
        if (cardElement && !loading) {
            cardElement.mount("#card-element");
        }
    }, [cardElement, loading]);

    const calculateFees = async (isDomestic?: boolean) => {
        console.log("paymentMethod:", paymentMethod);
        let feeRate = 0;
        if (paymentMethod === PaymentMethod.CREDIT_CARD) {
            console.log("isDomestic:", isDomestic);
            feeRate = isDomestic ? 2.6 : 4;

            if (!isRecurring) {
                // One-time donation logic
                const fee = (amount * 100 + 65) / (1 - feeRate / 100) / 100; // Add fixed 65 cents
                const calculatedFee = fee - amount; // Processing fee
                setProcessingFee(calculatedFee);
                setTotalAmount(absorbFee ? fee : amount); // Total amount with fee
            } else {
                // Recurring donation logic
                const fee = (amount + 0.65) / (1 - (feeRate / 100 + 0.5 / 100)); // Includes extra 0.5% fee for recurring
                const calculatedFee = fee - amount;
                setProcessingFee(calculatedFee);
                setTotalAmount(absorbFee ? fee : amount);
            }
        } else {
            // PayNow or GrabPay Fee Logic
            if (paymentMethod === PaymentMethod.PAYNOW) feeRate = 1.1;
            else if (paymentMethod === PaymentMethod.GRABPAY) feeRate = 3.7;

            const fee = (amount * 100) / (1 - feeRate / 100) / 100;
            const calculatedFee = fee - amount;
            console.log(calculatedFee);
            setProcessingFee(calculatedFee);
            setTotalAmount(absorbFee ? fee : amount);
        }
    }

    const handleCardValidation = async () => {
        if (!stripe || !cardElement) {
            console.error("Stripe has not been initialised");
            return;
        }

        const { paymentMethod, error } = await stripe.createPaymentMethod({
            type: "card",
            card: cardElement,
        });

        if (error) {
            console.error("Payment error:", error.message);
        } else {
            setPaymentMethodId(paymentMethod.id);
            console.log("Payment Method ID: ", paymentMethod.id);
            // Determine domestic or international
            const cardCountry = paymentMethod.card?.country;
            console.log("Card Country:", cardCountry);
            let isDomestic = cardCountry === "SG";

            calculateFees(isDomestic);
            setStep(2);
        }
    };

    // Send paymentMethod.id to backend to create payment
    const handleMakePayment = async () => {
        if (!stripe) return;

        if (!isRecurring) {
            const email = contact?.data.email_primary?.email;
            const name = `${contact?.data.first_name} ${contact?.data.last_name}`;
            const amount = Math.round(totalAmount * 100);
            const applicationFeeAmount = processingFee;
            const paymentIntentData = {
                email: email,
                name: name,
                amount: amount,
                applicationFeeAmount: applicationFeeAmount,
                paymentMethodId: paymentMethodId || null,
                paymentMethodDataType: paymentMethod === PaymentMethod.PAYNOW ? "paynow" : paymentMethod === PaymentMethod.GRABPAY ? "grabpay" : null,
            }
            try {
                const response = await axios.post(`${config.domain}/portal/api/stripe/create_payment_intent.php`, { paymentIntentData });

                const { client_secret, payment_intent_id } = response.data;

                if (client_secret) {
                    if (paymentMethod === PaymentMethod.CREDIT_CARD) {
                        stripe.confirmCardPayment(client_secret).then((result) => {
                            if (result.error) {
                                console.error("Error:", result.error.message);
                                navigate("/payment-status?status=failed");
                            } else {
                                navigate(`/donor/donate/payment?status=success&payment_intent=${payment_intent_id}`);
                            }
                        });
                    } else if (paymentMethod === PaymentMethod.PAYNOW || paymentMethod === PaymentMethod.GRABPAY) {
                        console.log("clientSecret:", client_secret);
                        stripe.confirmPayment({
                            clientSecret: client_secret,
                            confirmParams: {
                                return_url: `${config.domain}/donor/donate/payment?status=success&payment_intent=${payment_intent_id}`,
                            },
                        });
                    }
                }
            } catch (error) {
                console.error("Error creating payment intent:", error);
                navigate("/payment-status?status=failed");
            }
        } else {
            alert("Creating Subscription...");
            alert("Subscribe Success!")
        }
    }

    return <Wrapper>
        {loading ? (
            <Loading className="h-screen items-center" />
        ) : (
            <div className="p-4">
                <div className="bg-white shadow-md rounded-md py-6 px-4 max-w-[600px] gap-x-8 mx-auto">
                    {/* Header */}
                    <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">
                        {step === 1 ? "Enter Your Payment Details" : step === 2 && "Payment Summary"}
                    </h1>

                    {paymentMethod === PaymentMethod.CREDIT_CARD ? (
                        step === 1 ? (
                            // Card Details
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Card Details
                                </label>
                                <div id="card-element" className="p-3 border rounded-lg shadow-inner bg-gray-50"></div>
                                <button
                                    onClick={handleCardValidation}
                                    className="w-full mt-6 bg-secondary text-white py-2 rounded-lg hover:bg-primary transition shadow-md"
                                >
                                    Continue
                                </button>
                            </div>
                        ) : (
                            // Payment Summary
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-md text-gray-700 font-semibold">Donation Amount</span>
                                    <span className="text-lg font-semibold">${amount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-md text-gray-700 font-semibold">Processing Fee</span>
                                    <span className="text-lg font-semibold">${processingFee.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between border-t pt-2">
                                    <span className="text-lg font-semibold">Total Amount</span>
                                    <span className="text-lg font-semibold">${totalAmount.toFixed(2)}{isRecurring ? '/month' : ''}</span>
                                </div>
                                <label className="flex items-center mt-4">
                                    <input
                                        type="checkbox"
                                        checked={absorbFee}
                                        onChange={() => setAbsorbFee(!absorbFee)}
                                        className="h-5 w-5 text-secondary rounded focus:ring-primary-dark"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Absorb Processing Fee</span>
                                </label>
                                {/* Info Message */}
                                <div className="bg-[#ffc107] text-black text-sm rounded-md p-3 mt-4 shadow">
                                    <strong>Important: </strong>
                                    Please do not close or navigate away from this page during the payment process. You will be redirected to the payment details page after completing the payment.
                                </div>
                                <button
                                    onClick={handleMakePayment}
                                    className="w-full mt-6 bg-secondary text-white py-2 rounded-lg hover:bg-primary transition shadow-md"
                                >
                                    Make Payment with {paymentMethod}
                                </button>
                            </div>
                        )
                    ) : (paymentMethod === PaymentMethod.PAYNOW || paymentMethod === PaymentMethod.GRABPAY) && (
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-700">Donation Amount</span>
                                <span className="text-lg font-semibold">${amount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-700">Processing Fee</span>
                                <span className="text-lg font-semibold">${processingFee.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                                <span className="text-lg font-semibold">Total Amount</span>
                                <span className="text-lg font-semibold">${totalAmount.toFixed(2)}{isRecurring ? '/month' : ''}</span>
                            </div>
                            <label className="flex items-center mt-4">
                                <input
                                    type="checkbox"
                                    checked={absorbFee}
                                    onChange={() => setAbsorbFee(!absorbFee)}
                                    className="h-5 w-5 text-primary rounded focus:ring-primary-dark"
                                />
                                <span className="ml-2 text-sm text-gray-700">Absorb Processing Fee</span>
                            </label>
                            {/* Info Message */}
                            <div className="bg-[#ffc107] text-black text-sm rounded-md p-3 mt-4 shadow">
                                <strong>Important: </strong>
                                Please do not close or navigate away from this page during the payment process. You will be redirected to the payment details page after completing the payment.
                            </div>
                            <button
                                onClick={handleMakePayment}
                                className="w-full mt-6 bg-secondary text-white py-2 rounded-lg hover:bg-primary transition shadow-md"
                            >
                                Make Payment with {paymentMethod}
                            </button>
                        </div>
                    )}


                    {/* Footer */}
                    <div className="text-center mt-6 text-sm text-gray-600">
                        Powered by
                        <img src={StripeLogo} alt="Stripe Logo" className="inline-block h-6 ml-2" />
                    </div>
                </div>
            </div>
        )}
    </Wrapper>
}