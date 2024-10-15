import { Contact } from "../classes/Contact";
import CRM from "../crm";

const ContactManager = new class ContactManager {
    private entity: string = "Contact";

    async fetch(email: string): Promise<Contact> {
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
            where: [["email_primary.email", "=", email]]
        })!;

        return new Contact(response!.data[0]);
    }

    async fetchById(id: string): Promise<Contact> {
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
            where: [["id", "=", id]]
        })!;

        return new Contact(response!.data[0]);
    }

    async update(email: string, props: Partial<Contact>) {
        const result = await CRM(this.entity, "update", {
            where: [["email_primary.email", "=", email]],
            values: Object.keys(props).map((p) => ([p, props[p]]))
        }).catch(() => null);
        return result != null;
    }
}

export default ContactManager;