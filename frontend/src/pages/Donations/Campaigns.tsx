import { useEffect, useState } from "react";
import Wrapper from "../../components/Wrapper";
import CampaignHandler from "../../../utils/v2/handlers/CampaignHandler";
import { Campaign, CampaignStatus } from "../../../utils/v2/entities/Campaign";
import moment from "moment";
import Loading from "../../components/Loading";
import CampaignCard from "../../components/Card/CampaignCard";

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>();
  useEffect(() => {
    (async () => {
      const campaigns = await CampaignHandler.fetch({ 
        where: [
          ['status_id:name', '=', CampaignStatus.COMPLETED],
          ['activity_date_time', '<', moment(new Date).format("YYYY-MM-DD HH:mm:ss")],
          ['Donation_Campaign_Details.End_Date', '>=', moment(new Date).format("YYYY-MM-DD HH:mm:ss")]
        ],
        sort: [['Donation_Campaign_Details.End_Date', 'ASC']]
      });

      setCampaigns(campaigns);
    })();
  }, []);
  return <Wrapper>
    {!campaigns ? <Loading className="items-center h-screen" /> : <div className="p-4 mb-12">
      <div className="max-w-[1400px] px-0 md:px-6 mx-auto">
        <div className="flex flex-col justify-between h-full">
          {!campaigns.length && <p className="text-lg text-gray-500">Looks like there aren't any campaigns</p>}
          {campaigns.length > 0 && <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 mt-6">
            {campaigns.map(campaign => <CampaignCard className="flex justify-center" campaign={campaign} />)}
          </div>}
        </div>
      </div>
    </div>}
  </Wrapper>
}