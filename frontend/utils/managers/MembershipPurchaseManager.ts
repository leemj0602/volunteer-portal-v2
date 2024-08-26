import moment from "moment";
import { MembershipPurchase, MembershipPurchaseProps } from "../classes/MembershipPurchase";
import CRM, { ComparisonOperator } from "../crm";

export interface MembershipPurchaseFetchOptions {
    select?: string[];
    contactId?: number;
    limit?: number;
    offset?: number;
}

const MembershipPurchaseManager = new class MembershipPurchaseMangaer {
    private entity = "Activity";

    async fetch(options?: MembershipPurchaseFetchOptions): Promise<MembershipPurchase[] | null> {
        const where: [string, ComparisonOperator, any][] = [["activity_type_id:name", "=", "Membership Purchase"]];
        if (options?.contactId) where.push(["contact.id", "=", options.contactId]);
        
        const response = await CRM(this.entity, "get", {
            where,
            select: options?.select ?? [
                "id",
                "activity_date_time",
                "Membership_Purchase_Details.*"
            ],
            join: [
                ["Contact AS contact", "LEFT", ["target_contact_id", "=", "contact.id"]],
            ],
            limit: options?.limit,
            offset: options?.offset,
            order: [["Membership_Purchase_Details.Expiration_Date", "DESC"]]
        }).catch(() => null);

        if (!response) return null;
        else return response.data.map((m: MembershipPurchaseProps) => new MembershipPurchase(m));
    }

    async create(contactId: number, pricing: number) {
        const response = await CRM(this.entity, "create", {
            values: [
                ["activity_type_id:name", "Membership Purchase"],
                ["target_contact_id", contactId],
                ["source_contact_id", contactId],
                ["Membership_Purchase_Details.Pricing", pricing],
                ["Membership_Purchase_Details.Expiration_Date", moment(Date.now()).add(2, "years").format("YYYY-MM-DD hh:mm:ss")]
            ]
        });

        return response?.data.length > 0;
    }
}

export default MembershipPurchaseManager;