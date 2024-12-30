import moment from "moment";
import CRM, { ComparisonOperator } from "../../crm";
import { RecurringDonation } from "../entities/RecurringDonation";
import ContactHandler from "./ContactHandler";

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

    async create(email: string, subscriptionId: string) {
        // Fetch contact
        const contact = await ContactHandler.fetch(email);
        if (!contact || !contact.data?.id) {
            throw new Error("Contact not found");
        }

        const response = await CRM(this.entity, "create", {
            values: [
                ['activity_type_id:name', this.type],
                ['source_contact_id', contact.data.id],
                ['target_contact_id', contact.data.id],
                ['subject', subscriptionId],
            ]
        }).catch((error: any) => {
            console.error("CRM create error:", error);
            throw new Error("CRM create request failed");
        })

        if (!response) {
            throw new Error("Failed to create recurring donation");
        }

        return (response.data.length > 0)
    }
}

export default new RecurringDonationHandler;