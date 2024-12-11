import CRM from "../../crm";
import { Charity } from "../entities/Charity";

class CharityHandler {
    private entity: string = "Contact";

    async fetchCharity(email: string): Promise<Charity> {
        const response = await CRM(this.entity, "get", {
            select: [
                'organization_name',
                'email_primary.email',
                "address_primary.street_address",
                "address_primary.postal_code",
                'phone_primary.phone_numeric',
                'Charity_Contact_Details.Description',
                'thumbnail.url',
            ],
            join: [
                ['File AS thumbnail', 'LEFT', ['Charity_Contact_Details.Thumbnail', '=', 'thumbnail.id']],
            ],
            where: [
                ['email_primary.email', '=', email],
            ]
        });

        return new Charity(response?.data[0]);
    }
}

export default new CharityHandler;