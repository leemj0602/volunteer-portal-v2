import CRM from "../crm";
import EventRegistrationManager from "../managers/EventRegistrationManager";
import JobRequestManager from "../managers/JobRequestManager";
import TrainingRegistrationManager from "../managers/TrainingRegistrationManager";
import { Relationship, RelationshipProps } from "./Relationship";

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
    contact_sub_type: string[] | null;
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
    public "contact_sub_type": string[] | null = null;

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

    async fetchJobRequests() {
        return JobRequestManager.fetch({ contactId: this.id! });
    }

    /** Fetch patients under this contact */
    async fetchPatients() {
        const response = await CRM("Relationship", "get", {
            'select': [
                'contact_id_a.first_name',
                'contact_id_a.last_name',
                'contact_id_a.phone_primary.phone',
                'created_date',
                'contact_id_a.address_primary.street_address',
                'contact_id_a.address_primary.postal_code',
                'contact_id_a.gender_id:label',
            ],
            where: [
                ["relationship_type_id:name", "=", "Supervised by"],
                ["contact_id_b", "=", this.id!]
            ]
        }).catch(() => null);
        if (!response) return [] as Relationship[];
        return (response.data as RelationshipProps[]).map(r => new Relationship(r));
    }
}