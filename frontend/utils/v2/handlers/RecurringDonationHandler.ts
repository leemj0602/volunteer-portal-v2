import CRM, { ComparisonOperator } from "../../crm";
import { RecurringDonation } from "../entities/RecurringDonation";

class RecurringDonationHandler {
    private entity: string = "Activity";
    private type: string = "Recurring Donation";
    
    /** Get all recurring donations belonging to na email */
    async fetch(id: number): Promise<RecurringDonation[]> {
        const response = await CRM(this.entity, "get", {
            select: ["subject"],
            where: [
                ["activity_type_id:name", "=", this.type], 
                ["target_contact_id", "=", id],
                ["status_id:name", "!=", "Cancelled"]
            ],
        }).catch(console.log);

        if (!response) return [];
        return response.data.map((d: any) => new RecurringDonation(d));
    }
}

export default new RecurringDonationHandler;