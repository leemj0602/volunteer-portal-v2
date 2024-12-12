import { isAxiosError } from "axios";
import CRM, { ComparisonOperator } from "../../crm";
import { Campaign } from "../entities/Campaign";

interface FetchOptions {
  where?: [string, ComparisonOperator, any][];
  sort?: [string, 'ASC' | 'DESC'][]
}

class CampaignHandler {
  private entity: string = "Activity";

  /** Fetching multiple campaigns */
  async fetch(options?: FetchOptions) {
    try {
      const response = await CRM(this.entity, 'get', {
        where: [
          ["activity_type_id:name", "=", "Donation Campaign"],
          ...(options?.where ?? [])
        ],
        select: ['*', 'status_id:name', 'Donation_Campaign_Details.*', 'Donation_Campaign_Details.Financial_Type:label', 'thumbnail.*', 'thumbnail.url'],
        join: [["File AS thumbnail", "LEFT", ["thumbnail.id", "=", "Donation_Campaign_Details.Thumbnail"]]],
        order: options?.sort
      });

      return response?.data.map((d: Record<string, any>) => new Campaign(d)) as Campaign[];
    }
    catch(err) {
      if (isAxiosError(err)) throw err;
    } 
  }
}

export default new CampaignHandler;