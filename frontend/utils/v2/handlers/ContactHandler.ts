import CRM from "../../crm";
import { Contact } from "../entities/Contact";

class ContactHandler {
    private entity: string = "Contact";

    /** Fetch specific entity by email */
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
                "external_identifier",
                "Volunteer_Contact_Details.*",
                "Donator_Contact_Details.*",
                "Caregiver_Contact_Details.*",
                "Patient_Contact_Details.*"
            ],
            where: [["email_primary.email", "=", email]]
        });

        return new Contact(response?.data[0]);
    }
}

export default new ContactHandler;