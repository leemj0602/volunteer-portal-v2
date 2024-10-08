import EventRegistrationManager from "../managers/EventRegistrationManager";
import TrainingRegistrationManager from "../managers/TrainingRegistrationManager";

interface MandatoryContactDetailProps {
    "Volunteer_Contact_Details.Skills_Interests": string[];
    [key: string]: any;
}

export interface ContactProps extends MandatoryContactDetailProps {
    id: number | null;
    "email_primary.email": string | null;
    "address_primary.street_address": string | null;
    "address_primary.postal_code": string | null;
    "phone_primary.phone_numeric": string | null;
    gender_id: number | null;
    first_name: string | null;
    last_name: string | null;
}

export class Contact implements ContactProps {
    public "id": number | null = null;
    public "email_primary.email": string | null = null;
    public "address_primary.street_address": string | null = null;
    public "address_primary.postal_code": string | null = null;
    public "phone_primary.phone_numeric": string | null = null;
    public "gender_id": number | null = null;
    public "first_name": string | null = null;
    public "last_name": string | null = null;

    public "Volunteer_Contact_Details.Skills_Interests": string[];
    [key: string]: any;

    constructor(props: Partial<ContactProps>) {
        // this.id = props.id;
        // this["email_primary.email"] = props["email_primary.email"];
        // this["address_primary.street_address"] = props["address_primary.street_address"];
        // this["address_primary.postal_code"] = props["address_primary.postal_code"];
        // this["phone_primary.phone_numeric"] = props["phone_primary.phone_numeric"];
        // this.gender_id = props.gender_id;
        // this.first_name = props.first_name;
        // this.last_name = props.last_name;

        for (const key in props) {
            if (key.startsWith("Volunteer_Contact_Details")) this[key] = props[key];
            else this[key as keyof ContactProps] = props[key];
        }
    }

    getMandatory<K extends keyof MandatoryContactDetailProps>(input: K): MandatoryContactDetailProps[K] {
        return this[input] as MandatoryContactDetailProps[K];
    }

    public getOptionalCustomFields() {
        const keys = Object.keys(this);
        const emptyEventDetails = new Contact({} as ContactProps);
        const defaultKeys = Object.keys(emptyEventDetails);
        const customKeys = keys.filter(k => !defaultKeys.includes(k));

        const result: { [key: string]: any } = {};
        for (const key of customKeys) result[key] = this[key as keyof ContactProps];
        return result;
    }


    async fetchEventRegistrations() {
        return EventRegistrationManager.fetch({ contactId: this.id! });
    }

    async fetchTrainingRegistrations() {
        return TrainingRegistrationManager.fetch({ contactId: this.id! });
    }
}