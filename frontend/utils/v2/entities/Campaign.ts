import Entity from "./Entity";

export enum CampaignStatus {
  SCHEDULED = 'Scheduled',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

export class Campaign extends Entity {
  data: {
    id?: number;
    subject?: string;
    details?: string;
    activity_date_time?: string;
    "status_id:name"?: CampaignStatus;
    Donation_Campaign_Details?: {
      End_Date?: string;
      "Financial_Type:label"?: string;
      Financial_Goal?: number;
    },
    thumbnail?: {
      url?: string;
    }
  } = {}; 

  constructor(data: Record<string, any>) {
    super(data);
    for (const key in data)
      this.setNestedValue(this.data, key, data[key]);
  }
}