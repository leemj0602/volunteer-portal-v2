import CRM, { ComparisonOperator } from "../../crm";
import { Contribution } from "../entities/Contribution";

class ContributionHandler {
    private entity: string = "Contribution";
    
    /** Get all contributions belonging to this email */
    async fetch(email: string, where: [string, ComparisonOperator, any][] = []): Promise<Contribution[]> {
        const response = await CRM(this.entity, "get", {
            select: [
                "source",
                "currency",
                "total_amount",
                "receive_date"
            ],
            where: [...where, ["contact.email_primary.email", "=", email]],
            join: [["Contact AS contact", "LEFT", ["contact.id", "=", "contact_id"]]]
        }).catch(console.log);

        if (!response) return [];
        return response.data.map((d: any) => new Contribution(d));
    }
}

export default new ContributionHandler;