import CRM from "../crm";

interface MandatoryContactDetailProps {
    "Volunteer_Contact_Details.Skills_Interests": string[];
}

export interface ContactProps extends MandatoryContactDetailProps {
    id: number;
    "email_primary.email": string;
    "address_primary.street_address": string;
    "address_primary.postal_code": string;
    "phone_primary.phone_numeric": string
    gender_id: number;
    first_name: string;
    last_name: string;
    [key: string]: any;
}

export class Contact implements ContactProps {
    private entity = "contact";

    public "id": number;
    public "email_primary.email": string;
    public "address_primary.street_address": string;
    public "address_primary.postal_code": string;
    public "phone_primary.phone_numeric": string;
    public "gender_id": number;
    public "first_name": string;
    public "last_name": string;

    public "Volunteer_Contact_Details.Skills_Interests": string[];
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

    getMandatory<K extends keyof MandatoryContactDetailProps>(input: K): MandatoryContactDetailProps[K] {
        return this[input] as MandatoryContactDetailProps[K];
    }
}