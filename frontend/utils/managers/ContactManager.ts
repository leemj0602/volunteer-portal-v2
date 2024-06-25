import config from "../../../config";
import { Contact } from "../classes/Contact";
import CRM from "../crm";

export default class ContactManager {
    public email: string;
    private entity: string = "contact";
    constructor(email: string) {
        this.email = email ?? config.email;
    }

    async fetch(): Promise<Contact> {        
        const response = await CRM(this.entity, "get", {
            select: [
                "email_primary.email",
                "address_primary.street_address",
                "address_primary.postal_code",
                "phone_primary.phone_numeric",
                "gender_id",
                "first_name",
                "last_name",
                "Volunteer_Contact_Details.*"
            ],
            where: [["email_primary.email", "=", this.email]]
        })!;
        return new Contact(response!.data[0]);
    }

    async update(props: Partial<Contact>) {
        const contact = await this.fetch();
        await contact.update(props);
        return contact;
    }
}