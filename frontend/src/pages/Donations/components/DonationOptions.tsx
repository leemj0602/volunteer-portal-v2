import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CustomField } from "../../../../utils/v2/handlers/CustomFieldSetHandler";
import { Contact } from "../../../../utils/v2/entities/Contact";
import Swal from "sweetalert2";
import numeral from "numeral";
import ReactDOM from "react-dom";
import DropdownField from "../../../components/Fields/DropdownField";

interface DonationOptionsProps {
    isRecurring: boolean;
    setIsRecurring: (value: boolean) => void;
    setAmount: (value: number | undefined) => void;
    handleForm: (e: React.FormEvent<HTMLFormElement>) => void;
    handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    penconCustomFields: CustomField[] | undefined;
    amount: number | undefined;
    contact: Contact | undefined;
    isProcessing: boolean;
    setIsProcessing: (value: boolean) => void;
    handlePendingDonation: (data: any) => Promise<void>;
    applicableForTDR: boolean;
    minimumTDRAmount?: number | undefined;
    minimumDonationAmount?: number | undefined;
}

const DonationOptions: React.FC<DonationOptionsProps> = ({
    isRecurring,
    setIsRecurring,
    setAmount,
    handleForm,
    handleKeyDown,
    penconCustomFields,
    amount,
    contact,
    isProcessing,
    setIsProcessing,
    handlePendingDonation,
    applicableForTDR,
    minimumTDRAmount = 50, // Default
    minimumDonationAmount = 1, // Default
}) => {
    const navigate = useNavigate();

    useEffect(() => {
        if (!amount || amount < minimumDonationAmount) return;

        let selectedPaymentMethod: string | null = null;
        let tdrInput: HTMLInputElement;

        (async () => {
            const paymentMethodsArr = penconCustomFields?.find(
                (field) => field.name === "pencon_cf_paymeth"
            )?.options;

            const filteredPaymentMethods = paymentMethodsArr?.filter((method) =>
                isRecurring
                    ? ["Credit Card"].includes(method.name!)
                    : ["Credit Card", "PayNow", "GrabPay"].includes(method.name!)
            );

            const result = await Swal.fire({
                title: "Confirm your donation",
                confirmButtonText: "Proceed",
                showCloseButton: true,
                html: `
              <p style="font-weight: 600;">You are about to donate $${numeral(amount).format(
                    "0,0"
                )}${isRecurring ? "/month" : ""}</p>
              <div id="dropdown-container"></div>
              <div style="font-weight: 600; align-items: center; margin-top: 12px;">
              ${applicableForTDR
                        ? amount >= minimumTDRAmount
                            ? `<input type="checkbox" id="tdr" name="tdr" />
                                <label htmlFor="tdr" for="tdr" style="color: #5A71B4; cursor: pointer;">I would like a tax deductible receipt</label>`
                            : `<p style="color: #5A71B4;  font-style: italic">Tax-deductible receipt is only eligible for donations starting from $${numeral(minimumTDRAmount).format('0,0')}.</p>`
                        : ""
                    }
              </div>
              
            `,
                customClass: {
                    htmlContainer: "!text-left",
                },
                didOpen: () => {
                    const popup = Swal.getPopup()!;
                    tdrInput = popup.querySelector("#tdr") as HTMLInputElement;

                    const container = document.getElementById("dropdown-container");
                    if (container && filteredPaymentMethods) {
                        ReactDOM.render(
                            <DropdownField
                                id="payment-method"
                                className="mt-3"
                                fields={{ paymentMethod: selectedPaymentMethod }}
                                options={filteredPaymentMethods}
                                handleFields={(id, value) => {
                                    selectedPaymentMethod = value; // Capture the selected payment method
                                }}
                                label="Select Payment Method"
                                required
                            />,
                            container
                        );
                    }
                },
                preConfirm: () => {
                    const tdr = tdrInput?.checked || false;

                    if (!selectedPaymentMethod) {
                        Swal.showValidationMessage("Please select a payment method.");
                        return false;
                    }

                    return { tdr, paymentMethod: selectedPaymentMethod };
                },
            });

            if (!result.isConfirmed) return setAmount(undefined);

            const { tdr, paymentMethod } = result.value;
            const finType = tdr ? 1 : 5;

            if (tdr && !contact?.data.external_identifier) {
                await Swal.fire({
                    icon: "warning",
                    title: "Missing/Invalid NRIC/FIN details!",
                    html: `<p>Please provide a valid NRIC/FIN in the profile page.</p>`,
                    confirmButtonText: "Go to Profile Page",
                    showCancelButton: true,
                    cancelButtonText: "Cancel",
                    preConfirm: () => navigate("/profile"),
                });
                return;
            }
            const nric = tdr ? contact?.data.external_identifier : ' ';

            setIsProcessing(true);
            Swal.fire({
                title: "Processing...",
                allowOutsideClick: false,
                showConfirmButton: false,
                didOpen: () => Swal.showLoading(),
            });

            const paymentMethodName = filteredPaymentMethods?.find(method => method.value === paymentMethod)?.name
            const donationData = {
                email: contact?.data.email_primary?.email,
                finType,
                amount,
                paymentMethod,
                paymentMethodName,
                nric,
                isRecurring: isRecurring ? 1 : 2,
            };

            console.log(donationData);

            await handlePendingDonation(donationData);
            Swal.close();
            setIsProcessing(false);
            setAmount(undefined);
        })();
    }, [amount]);

    const predefinedAmounts = isRecurring ? [50, 100, 150] : [10, 25, 50, 100];

    return (
        <div>
            {/* Heading */}
            <h2 className="font-semibold text-2xl text-gray-700 mt-12">Donate</h2>
            <p className="mt-2">
                {applicableForTDR &&
                    `Please note: Donations of $${numeral(minimumTDRAmount).format("0,0")} or more are eligible for a tax deduction.`}{" "}
                Valid NRIC/FIN details must be provided in the{" "}
                <button className="text-secondary" onClick={() => navigate('/profile')}>
                    profile page
                </button>.
            </p>

            {/* Recurring Donation Option */}
            <div className="mt-2">
                <label className="flex items-center gap-x-2">
                    <input
                        type="checkbox"
                        className="form-checkbox"
                        checked={isRecurring}
                        onChange={(e) => setIsRecurring(e.target.checked)}
                        disabled={isProcessing}
                    />
                    <span className="text-gray-700 font-medium">
                        Make this a recurring donation (monthly)
                    </span>
                </label>
            </div>

            {/* Predefined Donation Prices */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 mt-2">
                {predefinedAmounts.map((value) => (
                    <button
                        key={value}
                        onClick={() => setAmount(value)}
                        className={`p-2 rounded-lg border-2 text-center cursor-pointer text-gray-700 ${isProcessing
                            ? "cursor-not-allowed opacity-50"
                            : "hover:border-secondary shadow-md hover:bg-secondary hover:text-white"
                            }`}
                        disabled={isProcessing}
                    >
                        <p className="text-xl font-bold">
                            ${value}
                            {isRecurring ? "/month" : ""}
                        </p>
                    </button>
                ))}
            </div>

            {/* Custom Donation Amount */}
            {!isRecurring && (
                <form onSubmit={handleForm} className="mt-4">
                    <div className="w-full flex items-center gap-x-6">
                        <div className="flex-grow rounded-lg border flex items-center">
                            <span className="text-gray-700 font-semibold pl-4">$</span>
                            <input
                                onKeyDown={handleKeyDown}
                                type="number"
                                placeholder="Set custom value"
                                className="ml-2 p-2 focus:ring-0 w-full"
                                step="0.01"
                                min={minimumDonationAmount}
                                max={10000000}
                                name="amount"
                                disabled={isProcessing}
                            />
                        </div>
                        <button
                            className="bg-secondary hover:bg-primary text-white px-6 py-2 rounded-lg transition"
                            disabled={isProcessing}
                        >
                            Donate
                        </button>
                    </div>
                    {minimumDonationAmount > 0 && <p className="text-sm text-gray-500 mt-1">Minimum donations start from ${numeral(minimumDonationAmount).format('0,0')}</p>}
                </form>
            )}
        </div>
    );
};

export default DonationOptions;
