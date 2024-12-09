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

export default function CampaignPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign>();
  const [amount, setAmount] = useState<number>();

  useEffect(() => {
    (async () => {
      // #region If the campaign cannot be found with the provided ID
      const campaigns = await CampaignHandler.fetch({ where: [["id", "=", id]] });
      if (!campaigns?.length) return navigate("/donor/campaigns");
      // #endregion
      setCampaign(campaigns[0]);
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

  // What to do after setting the amount
  useEffect(() => {
    console.log(amount);
    if (amount) {
      Swal.fire({
        icon: "success",
        timer: 3000,
        timerProgressBar: true,
        title: `Thank you for donating $${amount}!`
      });
      // In the scenario where you think that they'll still be on the same page and want to re-set the amount
      // Remove if this is not the case
      setAmount(-1);
    }
  }, [amount]);


  return <Wrapper location="/donor/campaigns">
    {!campaign ? <Loading className="h-screen items-center" /> : <div className="p-4">
      <div className="bg-white rounded-md mt-4 py-6 px-4 max-w-[1600px] gap-x-8">
        <div className="flex flex-col lg:flex-row">
          {/* Left */}
          <div className="flex-grow">
            {/* Image */}
            <div className="h-[200px] md:h-[265px] rounded-lg relative border border-gray-50 bg-gray-200">
              {campaign.data.thumbnail?.url ? <img src={campaign.data.thumbnail.url} className="w-full h-full object-contain rounded-lg" /> : <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <CiFileOff className="text-[80px] text-gray-500" />
              </div>}
            </div>
          </div>
          {/* Right */}
          <div className="px-4 w-full lg:w-1/3 mt-4 lg:mt-8">
            {/* Text */}
            <div className="text-center text-xl text-secondary">
              <h3 className="font-bold text-2xl">${numeral(23205).format('0,0')}</h3>
              <p className="font-semibold text-xl mb-2">raised of ${numeral(campaign.data.Donation_Campaign_Details?.Financial_Goal).format('0,0')}</p>
            </div>
            {/* Progress Bar */}
            <Progress progress={(23205 / campaign.data.Donation_Campaign_Details!.Financial_Goal!) * 100} className="text-secondary mb-6" />
            <form onSubmit={handleForm}>
              <div className="font-semibold flex items-center border rounded-lg px-4">
                <span className="text-gray-700">$</span>
                <input onKeyDown={handleKeyDown} className="ml-2 focus:ring-0 w-full" type="number" name="amount" step="0.01" min={1} max={10000000} />
              </div>
              <button className="w-full rounded-lg bg-secondary hover:bg-primary text-white font-semibold p-2 mt-3">Donate</button>
            </form>
          </div>
        </div>
        <hr className="md:hidden my-8" />
        {/* Subject and Description */}
        <div className="md:mt-4">
          <h2 className="text-2xl text-secondary font-semibold">{campaign.data.subject}</h2>
          {(campaign.data.details?.length ?? 0) > 0 && <div className="max-w-[780px] mt-4 text-black/70" dangerouslySetInnerHTML={{ __html: campaign.data.details! }}>
          </div>}
        </div>
        {/* Prices */}
        <h2 className="font-semibold text-2xl text-gray-700 mt-12">Donate</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 mt-2">
          {[10, 25, 50, 100].map(value => {
            return <button onClick={() => setAmount(value)} className="p-2 rounded-lg border-2 hover:border-secondary shadow-md hover:bg-secondary text-center cursor-pointer text-gray-700 hover:text-white">
              <p className="text-xl font-bold">${value}</p>
            </button>
          })}
        </div>
        <form onSubmit={handleForm} className="mt-4">
          <div className="w-full flex items-center gap-x-6">
            <div className="flex-grow rounded-lg border flex items-center">
              <span className="text-gray-700 font-semibold pl-4">$</span>
              <input onKeyDown={handleKeyDown} type="number" placeholder="Set custom value" className="ml-2 p-2 focus:ring-0 w-full" step="0.01" min={1} max={10000000} name="amount" />
            </div>
            <button className="bg-secondary hover:bg-primary text-white px-6 py-2 rounded-lg transition">Donate</button>
          </div>
        </form>
      </div>
    </div>}
  </Wrapper>
}

