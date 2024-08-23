import { MembershipPurchase, MembershipPurchaseProps } from "../classes/MembershipPurchase";
import CRM, { ComparisonOperator } from "../crm";

interface FetchOptions {
    select?: string[];
    contactId?: number;
    limit?: number;
    offset?: number;
}

const MembershipPurchaseManager = new class MembershipPurchaseMangaer {
    private entity = "Activity";

    async fetch(options?: FetchOptions): Promise<MembershipPurchase[] | null> {
        const where: [string, ComparisonOperator, any][] = [];
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
            offset: options?.offset
        }).catch(() => null);

        if (!response) return null;
        else return response.data.map((m: MembershipPurchaseProps) => new MembershipPurchase(m));
    }
}

export default MembershipPurchaseManager;