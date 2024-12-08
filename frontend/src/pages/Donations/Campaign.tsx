import { useNavigate, useParams } from "react-router-dom";
import Wrapper from "../../components/Wrapper";
import { useEffect, useState } from "react";
import CampaignHandler from "../../../utils/v2/handlers/CampaignHandler";
import { Campaign } from "../../../utils/v2/entities/Campaign";
import Loading from "../../components/Loading";
import { CiFileOff } from "react-icons/ci";
import config from "../../../../config.json";

export default function CampaignPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign>();

  useEffect(() => {
    (async () => {
      // #region If the campaign cannot be found with the provided ID
      const campaigns = await CampaignHandler.fetch({ where: [["id", "=", id] ]});
      if (!campaigns?.length) return navigate("/donor/campaigns");
      // #endregion
      setCampaign(campaign);
    })
  });

  return <Wrapper location="/donor/campaigns">
    {!campaign ? <Loading className="h-screen items-center" /> : <div className="p-4">
      <div className="bg-white rounded-md mt-4 py-6 px-4 max-w-[1600px]">
        {/* Image */}
        <div className="mb-8 h-[200px] rounded-lg relative border border-gray-50 bg-gray-200">
          {campaign.data.thumbnail?.url ? <img src={`${config.domain}/wp-content/uploads/civicrm/custom/${campaign.data.thumbnail.url}`} /> : <div className="absolute top-1-2 left-1-2 transform -translate-x-1/2 -translate-y-1/2">
            <CiFileOff className="text-[80px] text-gray-500" />
          </div>}
        </div>
        {/* Header */}
        <header className="flex flex-row justify-between w-full gap-x-4">
          <div className="flex-grow">
            {/* Subject */}
            <h2 className="text-2xl text-secondary font-semibold">{campaign.data.subject}</h2>
            {/* Description */}
            {(campaign.data.details?.length ?? 0) > 0 && <div className="max-w-[780px] mt-4 text-black/70" dangerouslySetInnerHTML={{ __html: campaign.data.details! }}>
            </div>}
          </div>
        </header>
      </div>
    </div>}
  </Wrapper>
}