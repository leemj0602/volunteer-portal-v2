import Entity from "./Entity";

export class Charity extends Entity {
    data: {
        id?: number;
        organization_name?: string;
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
        Charity_Contact_Details?: {
            Description?: string;
        }
        thumbnail?: {
            url?: string;
        }
    } = {};

    constructor(data: Record<string, any>) {
        super(data);
        for (const key in data)
            this.setNestedValue(this.data, key, data[key]);
    }
}