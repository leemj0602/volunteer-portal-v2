import { useNavigate, useParams } from "react-router-dom";
import Wrapper from "../../components/Wrapper";
import { FormEvent, KeyboardEvent, useEffect, useState } from "react";
import Loading from "../../components/Loading";
import { CiFileOff } from "react-icons/ci";
import Swal from "sweetalert2";
import CharityHandler from "../../../utils/v2/handlers/CharityHandler";
import { Charity } from "../../../utils/v2/entities/Charity";
import config from "../../../../config.json";
import CustomFieldSetHandler, { CustomField, CustomFieldOptions } from "../../../utils/v2/handlers/CustomFieldSetHandler";
import numeral from "numeral";
import ContactHandler from "../../../utils/v2/handlers/ContactHandler";
import { Contact } from "../../../utils/v2/entities/Contact";
import DropdownField from "../../components/Fields/DropdownField";
import ReactDOM from "react-dom";

export default function Donate() {
  const navigate = useNavigate();
  const email = (window as any).email;
  const [amount, setAmount] = useState<number>();
  const [contact, setContact] = useState<Contact>();
  const [charity, setCharity] = useState<Charity>();
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [penconCustomFields, setPenconCustomFields] = useState<CustomField[]>();
  const [supportedPaymentMethods, setSupportedPaymentMethods] = useState<CustomFieldOptions[]>();

  useEffect(() => {
    (async () => {
      const contact = await ContactHandler.fetch(email);
      setContact(contact);

      const charity = await CharityHandler.fetchCharity(config.charityEmail);
      const penconCustomFields = await CustomFieldSetHandler.fetch('pencon_customgroup');
      if (!charity) {
        alert("Cannot fetch charity");
        return;
      };
      setCharity(charity);

      if (penconCustomFields) {
        setPenconCustomFields(penconCustomFields);
        console.log("Custom Fields Fetched: ", penconCustomFields);

        const paymentMethodsArr = penconCustomFields.find(field => field.name === 'pencon_cf_paymeth')?.options;
        console.log("All Payment Methods: ", paymentMethodsArr);

        const supportedPaymentMethods = paymentMethodsArr?.filter(method => ['Credit Card', 'PayNow', 'GrabPay'].includes(method.name!));
        console.log("Supported Payment Method: ", supportedPaymentMethods);
        setSupportedPaymentMethods(supportedPaymentMethods);
      }
    })();
  }, []);

  const handleForm = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem('amount') as HTMLInputElement;
    setAmount(parseFloat(input.value));
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key == 'Enter') {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  }

  let tdrInput: HTMLInputElement;
  // What to do after setting the amount
  useEffect(() => {
    console.log(amount);
    if (!amount) return;

    let selectedPaymentMethod: string | null = null; // To capture dropdown selection

    (async () => {
      const result = await Swal.fire({
        title: 'Confirm your donation',
        confirmButtonText: 'PROCEED',
        showCloseButton: true,
        html: `
          <p style="font-weight: 600;">You are about to donate $${numeral(amount).format('0,0')}${isRecurring ? '/month' : ''}</p>
          <div id="dropdown-container"></div>
          ${amount >= 50
            ? `<div style="font-weight: 600; align-items: center; margin-top: 12px;">
            <input type="checkbox" id="tdr" name="tdr" />
            <label htmlFor="tdr" for="tdr" style="color: #5A71B4; cursor: pointer;">I would like a tax deductible receipt</label>
          </div>`
            : ''}
        `,
        customClass: {
          htmlContainer: "!text-left"
        },
        didOpen: () => {
          const popup = Swal.getPopup()!;
          tdrInput = popup.querySelector('#tdr') as HTMLInputElement;
          console.log(supportedPaymentMethods);
          // Dynamically render DropdownField into the placeholder
          const container = document.getElementById("dropdown-container");
          if (container && supportedPaymentMethods) {
            ReactDOM.render(
              <DropdownField
                id="payment-method"
                className="mt-3"
                fields={{ paymentMethod: selectedPaymentMethod }}
                options={supportedPaymentMethods}
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

          // Validate payment method selection
          if (!selectedPaymentMethod) {
            Swal.showValidationMessage("Please select a payment method.");
            return false;
          }

          return { tdr, paymentMethod: selectedPaymentMethod };
        }
      });

      if (!result.isConfirmed) return setAmount(undefined);

      const { tdr, paymentMethod } = result.value;
      if (tdr) {
        console.log('external id: ', contact?.data.external_identifier);
        if (!contact?.data.external_identifier) {
          await Swal.fire({
            icon: "warning",
            title: "Missing NRIC/FIN details!",
            html: `<p>Please provide your NRIC/FIN details in the profile page.</p>`,
            confirmButtonText: "Go to Profile Page",
            showCancelButton: true,
            cancelButtonText: "Cancel",
            preConfirm: () => {
              // Redirect to profile page
              navigate('/profile');
            }
          });
          return;
        }
      }

      const paymentMethodName = supportedPaymentMethods?.find(method => method.value === paymentMethod)?.name
      console.log(`Payment Method Selected: ${paymentMethodName}, Amount: ${amount}, Recurring: ${isRecurring}, TDR: ${tdr}`);

      // Create pending contribution activity

      // Stripe
      navigate('/donor/donate/payment', {
        state: {
          paymentMethod: paymentMethodName,
          amount: amount,
          isRecurring: isRecurring,
        }
      });
      setAmount(undefined);
    })();
  }, [amount, supportedPaymentMethods]);


  return <Wrapper location="/donor/donate">
    {!charity ? <Loading className="h-screen items-center" /> : <div className="p-4">
      <div className="bg-white rounded-md py-6 px-4 max-w-[1600px] gap-x-8">
        {/* Image */}
        <div className="h-[200px] md:h-[265px] rounded-lg relative border border-gray-50 bg-gray-200">
          {charity.data.thumbnail?.url ? <img src={charity.data.thumbnail.url} className="w-full h-full object-contain rounded-lg" /> : <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <CiFileOff className="text-[80px] text-gray-500" />
          </div>}
        </div>
        {/* Name, Description, and Contact Details */}
        <div className="md:mt-4 grid md:grid-cols-3 gap-x-8">
          {/* Name and Description */}
          <div className="md:col-span-2">
            <h2 className="text-2xl text-secondary font-semibold">
              {charity.data.organization_name}
            </h2>
            {(charity.data.Charity_Contact_Details?.Description?.length ?? 0) > 0 && (
              <div
                className="mt-4 text-black/70"
                dangerouslySetInnerHTML={{
                  __html: charity.data.Charity_Contact_Details?.Description!,
                }}
              ></div>
            )}
          </div>
          {/* Contact Details */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-md md:col-span-1 mt-6 md:mt-0">
            <h3 className="text-lg font-semibold text-gray-700">Contact & Address Details</h3>
            <div className="mt-2 text-black/70">
              {charity.data.email_primary?.email && (
                <p>
                  <span className="font-semibold">Email:</span>{" "}
                  {charity.data.email_primary.email}
                </p>
              )}
              {charity.data.phone_primary?.phone_numeric && (
                <p>
                  <span className="font-semibold">Phone:</span>{" "}
                  {charity.data.phone_primary.phone_numeric}
                </p>
              )}
              {charity.data.address_primary?.street_address && (
                <p>
                  <span className="font-semibold">Address:</span>{" "}
                  {charity.data.address_primary.street_address}
                </p>
              )}
              {charity.data.address_primary?.postal_code && (
                <p>
                  <span className="font-semibold">Postal Code:</span>{" "}
                  {charity.data.address_primary.postal_code}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Prices */}
        <h2 className="font-semibold text-2xl text-gray-700 mt-12">Donate</h2>
        <p>Please note: Donations of $50 or more are eligible for a tax deduction & NRIC/FIN details must be provided in the <button className="text-secondary" onClick={() => navigate('/profile')}>profile page</button>.</p>
        {/* Recurring Donation Option */}
        <div className="mt-2">
          <label className="flex items-center gap-x-2">
            <input
              type="checkbox"
              className="form-checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
            />
            <span className="text-gray-700 font-medium">Make this a recurring donation (monthly)</span>
          </label>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 mt-2">
          {(isRecurring ? [50, 100, 150] : [10, 25, 50, 100]).map(value => {
            return <button onClick={() => setAmount(value)} className="p-2 rounded-lg border-2 hover:border-secondary shadow-md hover:bg-secondary text-center cursor-pointer text-gray-700 hover:text-white">
              <p className="text-xl font-bold">${value}{isRecurring ? "/month" : ""}</p>
            </button>
          })}
        </div>
        {!isRecurring && (
          <form onSubmit={handleForm} className="mt-4">
            <div className="w-full flex items-center gap-x-6">
              <div className="flex-grow rounded-lg border flex items-center">
                <span className="text-gray-700 font-semibold pl-4">$</span>
                <input onKeyDown={handleKeyDown} type="number" placeholder="Set custom value" className="ml-2 p-2 focus:ring-0 w-full" step="0.01" min={1} max={10000000} name="amount" />
              </div>
              <button className="bg-secondary hover:bg-primary text-white px-6 py-2 rounded-lg transition">Donate</button>
            </div>
          </form>
        )}
      </div>
    </div>}
  </Wrapper>
}

