import { useNavigate, useParams } from "react-router-dom";
import Wrapper from "../../components/Wrapper";
import { FormEvent, KeyboardEvent, useEffect, useState } from "react";
import CampaignHandler from "../../../utils/v2/handlers/CampaignHandler";
import { Campaign } from "../../../utils/v2/entities/Campaign";
import Loading from "../../components/Loading";
import { CiFileOff } from "react-icons/ci";
import { Progress } from "flowbite-react";
import numeral from "numeral";
import Swal from "sweetalert2";
import { Contact } from "../../../utils/v2/entities/Contact";
import CustomFieldSetHandler, { CustomField } from "../../../utils/v2/handlers/CustomFieldSetHandler";
import DonationOptions from "./components/DonationOptions";
import PendingDonationHandler from "../../../utils/v2/handlers/PendingDonationHandler";
import ContactHandler from "../../../utils/v2/handlers/ContactHandler";

export default function CampaignPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const email = (window as any).email;
  const [campaign, setCampaign] = useState<Campaign>();
  const [amount, setAmount] = useState<number>();
  const [contact, setContact] = useState<Contact>();
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [penconCustomFields, setPenconCustomFields] = useState<CustomField[]>();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);


  useEffect(() => {
    (async () => {
      const contact = await ContactHandler.fetch(email);
      setContact(contact);

      // #region If the campaign cannot be found with the provided ID
      const campaigns = await CampaignHandler.fetch({ where: [["id", "=", id]] });
      if (!campaigns?.length) return navigate("/donor/campaigns");
      // #endregion
      setCampaign(campaigns[0]);

      const penconCustomFields = await CustomFieldSetHandler.fetch('pencon_customgroup');
      if (penconCustomFields) {
        setPenconCustomFields(penconCustomFields);
      }
    })();
  }, []);

  const handleForm = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem('amount') as HTMLInputElement;
    const value = parseFloat(input.value);
    if (campaign?.data.Donation_Campaign_Details?.Minimum_Donation_Amount && value < campaign?.data.Donation_Campaign_Details?.Minimum_Donation_Amount) {
      return Swal.fire({
        icon: 'error',
        text: `You can only donate a minimum of $${numeral(campaign.data.Donation_Campaign_Details.Minimum_Donation_Amount).format('0,0')}`,
        timer: 3000,
        timerProgressBar: true
      });
    }
    setAmount(parseFloat(input.value));
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key == 'Enter') {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  }

  return <Wrapper location="/donor/campaigns">
    {!campaign ? <Loading className="h-screen items-center" /> : <div className="p-4">
      <div className="bg-white rounded-md mt-4 py-6 px-4 max-w-[1600px] gap-x-8">
        {/* Image */}
        <div className="h-[200px] md:h-[265px] rounded-lg relative border border-gray-50 bg-gray-200">
          {campaign.data.thumbnail?.url ? <img src={campaign.data.thumbnail.url} className="w-full h-full object-contain rounded-lg" /> : <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <CiFileOff className="text-[80px] text-gray-500" />
          </div>}
        </div>
        <hr className="md:hidden my-8" />
        {/* Progress, Subject and Description */}
        <div className="md:mt-4 flex flex-col lg:flex-row">
          {/* Left */}
          <div className='flex-grow'>
            <h2 className="text-2xl text-secondary font-semibold">{campaign.data.subject}</h2>
            {(campaign.data.details?.length ?? 0) > 0 && <div className="max-w-[780px] mt-4 text-black/70" dangerouslySetInnerHTML={{ __html: campaign.data.details! }}>
            </div>}
          </div>
          {/* Right */}
          <div className="px-4 w-full lg:w-1/3 mt-4 lg:mt-8">
            {/* Text */}
            <div className="text-center text-xl text-secondary">
              <h3 className="font-bold text-2xl">${numeral(0).format('0,0')}</h3>
              <p className="font-semibold text-xl mb-2">raised of ${numeral(campaign.data.Donation_Campaign_Details?.Financial_Goal).format('0,0')}</p>
            </div>
            {/* Progress Bar */}
            <Progress progress={(0 / campaign.data.Donation_Campaign_Details!.Financial_Goal!) * 100} className="text-secondary mb-6" />
            {/* <form onSubmit={handleForm}> */}
            {/* <div className="font-semibold flex items-center border rounded-lg px-4">
              <span className="text-gray-700">$</span>
              <input onKeyDown={handleKeyDown} className="ml-2 focus:ring-0 w-full" type="number" name="amount" step="0.01" min={campaign.data.Donation_Campaign_Details?.Minimum_Donation_Amount ?? 1} />
            </div> */}
            {/* <button className="w-full rounded-lg bg-secondary hover:bg-primary text-white font-semibold p-2 mt-3">Donate</button>
              {(campaign.data.Donation_Campaign_Details?.Minimum_Donation_Amount ?? 0) > 0 && <p className="text-sm text-gray-500 mt-1">Minimum donations start from ${numeral(campaign.data.Donation_Campaign_Details?.Minimum_Donation_Amount).format('0,0')}</p>} */}
            {/* </form> */}
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
              data.isRecurring,
              Number(id),
            );
            if (response) {
              navigate("/donor/payment", {
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
          applicableForTDR={campaign.data.Donation_Campaign_Details?.["Financial_Type:label"] === 'TDR'}
          minimumTDRAmount={campaign.data.Donation_Campaign_Details?.TDR_Minimum_Requirement}
          minimumDonationAmount={campaign.data.Donation_Campaign_Details?.Minimum_Donation_Amount}
        />
      </div>
    </div>}
  </Wrapper>
}

