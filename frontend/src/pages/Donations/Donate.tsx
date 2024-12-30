import { useNavigate, useParams } from "react-router-dom";
import Wrapper from "../../components/Wrapper";
import { FormEvent, KeyboardEvent, useEffect, useState } from "react";
import Loading from "../../components/Loading";
import { CiFileOff } from "react-icons/ci";
import CharityHandler from "../../../utils/v2/handlers/CharityHandler";
import { Charity } from "../../../utils/v2/entities/Charity";
import config from "../../../../config.json";
import CustomFieldSetHandler, { CustomField } from "../../../utils/v2/handlers/CustomFieldSetHandler";
import ContactHandler from "../../../utils/v2/handlers/ContactHandler";
import { Contact } from "../../../utils/v2/entities/Contact";
import PendingDonationHandler from "../../../utils/v2/handlers/PendingDonationHandler";
import DonationOptions from "./components/DonationOptions";

export default function Donate() {
  const navigate = useNavigate();
  const email = (window as any).email;
  const [amount, setAmount] = useState<number>();
  const [contact, setContact] = useState<Contact>();
  const [charity, setCharity] = useState<Charity>();
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [penconCustomFields, setPenconCustomFields] = useState<CustomField[]>();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const contact = await ContactHandler.fetch(email);
      setContact(contact);

      const charity = await CharityHandler.fetchCharity(config.charityEmail);
      if (!charity) {
        alert("Cannot fetch charity");
        return;
      };
      setCharity(charity);

      const penconCustomFields = await CustomFieldSetHandler.fetch('pencon_customgroup');
      if (penconCustomFields) {
        setPenconCustomFields(penconCustomFields);
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

        <DonationOptions
          isRecurring={isRecurring}
          setIsRecurring={setIsRecurring}
          setAmount={setAmount}
          handleForm={handleForm}
          handleKeyDown={handleKeyDown}
          penconCustomFields={penconCustomFields}
          amount={amount}
          contact={contact}
          isProcessing={isProcessing}
          setIsProcessing={setIsProcessing}
          handlePendingDonation={async (data) => {
            const response = await PendingDonationHandler.create(
              data.email,
              data.finType,
              data.amount,
              data.paymentMethod,
              data.nric,
              data.isRecurring
            );
            if (response) {
              navigate("/donor/donate/payment", {
                state: {
                  paymentMethod: data.paymentMethodName,
                  amount: data.amount,
                  isRecurring: data.isRecurring === 1,
                  scontact: contact,
                  processingActivity: response,
                },
              });
            }
          }}
        />
      </div>
    </div>}
  </Wrapper>
}

