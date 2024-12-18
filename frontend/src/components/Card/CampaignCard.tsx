import { Progress } from "flowbite-react";
import Card from ".";
import { Campaign, CampaignStatus } from "../../../utils/v2/entities/Campaign"
import numeral from "numeral";

interface CampaignCardProps {
  campaign: Campaign;
  className?: string;
}

export default function CampaignCard(props: CampaignCardProps) {
  const details = props.campaign.data.details!.replace(/<\/?[^>]+(>|$)/g, "");
  const donated = 23205;

  return <Card
    className={props.className}
    url={`/donor/campaigns/${props.campaign.data.id}`}
    thumbnail={props.campaign.data.thumbnail?.uri}
    cancelled={props.campaign.data["status_id:name"] == CampaignStatus.CANCELLED}
  >
    <h1 className="font-semibold mb-4">{props.campaign.data.subject}</h1>
    <p className="text-gray-600 text-sm min-h-[80px]">{details.slice(0, 150)}{details!.length > 150 ? "..." : ""}</p>
    <div className="mt-2">
      <p className="font-semibold text-gray-700 text-lg text-right mb-1">${numeral(donated).format('0,0')} / ${numeral(props.campaign.data.Donation_Campaign_Details?.Financial_Goal!).format('0,0')} Raised</p>
      <Progress progress={(donated/props.campaign.data.Donation_Campaign_Details!.Financial_Goal!) * 100} className="text-secondary" />
    </div>
  </Card>
}