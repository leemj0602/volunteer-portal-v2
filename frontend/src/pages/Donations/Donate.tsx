import { useNavigate, useParams } from "react-router-dom";
import Wrapper from "../../components/Wrapper";
import { FormEvent, KeyboardEvent, useEffect, useState } from "react";
import Loading from "../../components/Loading";
import { CiFileOff } from "react-icons/ci";
import Swal from "sweetalert2";
import CharityHandler from "../../../utils/v2/handlers/CharityHandler";
import { Charity } from "../../../utils/v2/entities/Charity";
import config from "../../../../config.json";

export default function Donate() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState<number>();
  const [charity, setCharity] = useState<Charity>();
  const [isRecurring, setIsRecurring] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const charity = await CharityHandler.fetchCharity(config.charityEmail);
      if (!charity) alert("Cannot fetch charity");
      setCharity(charity);
      console.log(charity);
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
        title: `Thank you for donating $${amount}${isRecurring ? '/mo' : ''}!`
      });
      // In the scenario where you think that they'll still be on the same page and want to re-set the amount
      // Remove if this is not the case
      setAmount(undefined);
    }
  }, [amount]);


  return <Wrapper location="/donor/donate">
    {!charity ? <Loading className="h-screen items-center" /> : <div className="p-4">
      <div className="bg-white rounded-md mt-4 py-6 px-4 max-w-[1600px] gap-x-8">
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
        {/* Recurring Donation Option */}
        <div className="mt-6">
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
        {/* Prices */}
        <h2 className="font-semibold text-2xl text-gray-700 mt-12">Donate</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 mt-2">
          {[10, 25, 50, 100].map(value => {
            return <button onClick={() => setAmount(value)} className="p-2 rounded-lg border-2 hover:border-secondary shadow-md hover:bg-secondary text-center cursor-pointer text-gray-700 hover:text-white">
              <p className="text-xl font-bold">${value}{isRecurring ? "/mo" : ""}</p>
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

