import config from "../../../config";
import CRM from "../crm";

export interface ContactProps {
    id: number;
    "email_primary.email": string;
    "address_primary.street_address": string;
    "address_primary.postal_code": string;
    "phone_primary.phone_numeric": string;
    gender_id: number;
    first_name: string;
    last_name: string;
    [key: string]: any;
}

export class Contact implements ContactProps {
    private entity: string = "contact";
    public "id": number;
    public "email_primary.email": string;
    public "address_primary.street_address": string;
    public "address_primary.postal_code": string;
    public "phone_primary.phone_numeric": string;
    public "gender_id": number;
    public "first_name": string;
    public "last_name": string;
    [key: string]: any;
    
    constructor(props: ContactProps) {
        for (const key in props) this[key] = props[key];
    }

    async update(props: Partial<ContactProps>) {
        for (const key in props) this[key] = props[key];
        await CRM(this.entity, "update", {
            where: [["id", "=", this.id]],
            values: Object.keys(props).map((p) => ([p, props[p]]))
        });
        return this;
    }
}

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
                `${config.customFieldSets.contactDetails}.*`
            ],
            where: [["email_primary.email", "=", this.email]]
        })!;
        return new Contact(response!.data[0]);
    }

    async update(props: Partial<ContactProps>) {
        const contact = await this.fetch();
        await contact.update(props);
        return contact;
    }
}