import CRM from "../../crm";
import ContactHandler from "../handlers/ContactHandler";
import Entity from "./Entity";

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

        Patient_Contact_Details?: {
            [key: string]: any;
        }
    } = {};

    constructor(data: Record<string, any>) {
        super(data);
        for (const key in data)
            this.setNestedValue(this.data, key, data[key]);
    }

    async update(values: Record<string, any> | [string, any][]): Promise<Contact | null> {
        if (!this.data.id) throw new Error("Contact does not have an ID.");
        if (typeof values == 'object') values = Object.entries(values);

        const response = await CRM("Contact", "update", {
            values: values as [string, any][],
            where: [["id", "=", this.data.id]]
        }).catch(() => null);

        if (!response) return null;

        const contact = await ContactHandler.fetch(this.data.email_primary!.email!);
        return contact;
    }
}