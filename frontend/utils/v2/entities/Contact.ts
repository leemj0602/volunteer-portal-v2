import CRM from "../../crm";
import { Entity } from "./Entity";

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

    get flat() {
        return this.flatten(this.data);
    }

    constructor(data: { [key: string]: any }) {
        super();
        for (const key in data)
            this.setNestedValue(this.data, key, data[key]);
    }

    async update(data?: any): Promise<Contact | null> {
        const result = await CRM("Contact", "update", {
            where: [["email_primary.email", "=", this.data.email_primary?.email]],
            values: Object.keys(data ?? this.flat).map(k => ([k, data ?? this.flat[k]]))
        }).catch(() => null);
        return result ? this : null;
    }
}