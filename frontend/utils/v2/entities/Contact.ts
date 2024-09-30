import CRM from "../../crm";
import ContactHandler from "../handlers/ContactHandler";
import Entity, { obj } from "./Entity";

export class Contact extends Entity {
    data: {
        id?: number;
        email_primary?: {
            email?: string;
        }
        address_primary?: {
            street_address?: string;
            postal_code?: string;
        }
        phone_primary?: {
            phone_numeric?: string;
        }
        gender_id?: number;
        first_name?: string;
        last_name?: string;

        Volunteer_Contact_Details?: {
            Skills_Interests?: string[];
            [key: string]: any;
        }
    } = {};

    constructor(data: obj) {
        super(data);
        for (const key in data)
            this.setNestedValue(this.data, key, data[key]);
    }

    async update(values: [string, any][]): Promise<Contact | null> {
        const response = await CRM("Contact", "update", {
            values,
            where: [["email_primary.email", "=", this.data.email_primary?.email]]
        }).catch(() => null);
        if (!response) return null;

        const contact = await ContactHandler.fetch(this.data.email_primary!.email!);
        for (const key in contact) this.setNestedValue(this.data, key, (this.data as any)[key]);
        
        return this;
    }
}