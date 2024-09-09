import moment from "moment";
import CRM from "../crm";
import EventRegistrationManager from "../managers/EventRegistrationManager";
import { EventRegistration, EventRegistrationProps } from "./EventRegistration";
import { iMembership, Membership } from "./Membership";
import { MembershipHistory } from "./MembershipHistory";

interface MandatoryContactDetailProps {
    "Volunteer_Contact_Details.Skills_Interests": string[];
    "Membership_Contact_Details.Membership": number;
    [key: string]: any;
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
}

export class Contact implements ContactProps {
    public "id": number;
    public "email_primary.email": string;
    public "address_primary.street_address": string;
    public "address_primary.postal_code": string;
    public "phone_primary.phone_numeric": string;
    public "gender_id": number;
    public "first_name": string;
    public "last_name": string;

    public "Volunteer_Contact_Details.Skills_Interests": string[];
    public "Membership_Contact_Details.Membership": number;
    [key: string]: any;

    constructor(props: ContactProps) {
        this.id = props.id;
        this["email_primary.email"] = props["email_primary.email"];
        this["address_primary.street_address"] = props["address_primary.street_address"];
        this["address_primary.postal_code"] = props["address_primary.postal_code"];
        this["phone_primary.phone_numeric"] = props["phone_primary.phone_numeric"];
        this.gender_id = props.gender_id;
        this.first_name = props.first_name;
        this.last_name = props.last_name;

        for (const key in props) if (key.startsWith("Volunteer_Contact_Details") || key.startsWith("Membership_Contact_Detail")) this[key] = props[key];
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


    async fetchRegistrations() {
        return EventRegistrationManager.fetch({ contactId: this.id });
    }

    async fetchMemberships(): Promise<Membership[] | null> {
        const response = await CRM("Membership", "get", {
            select: ["*", "status_id:name", "membership_type_id:name", "membership_type_id.minimum_fee"],
            where: [["contact_id", "=", this.id]]
         }).catch(() => null);
        if (!response) return null;
        return response.data.map((d: iMembership) => new Membership(d));
    }

    async fetchMembershipHistory() {
        const response = await CRM("Activity", "get", {
            select: [
                "activity_type_id:name",
                "activity_date_time",
                "membership.join_date",
                "membership.start_date",
                "membership.end_date",
                "membership.membership_type_id:label",
            ],
            join: [["Membership AS membership", "LEFT", ["source_record_id", "=", "membership.id"]]],
            where: [["activity_type_id:name", "IN", ["Membership Signup", "Membership Renewal"]], ["membership.id", "IS NOT NULL"]],
            order: [["activity_date_time", "DESC"]]
        }).catch(() => null);

        if (!response) return null;
        else return response.data as MembershipHistory[];
    }

    async renewMembership(membership: Membership) {
        await membership.update([
            ["start_date", moment(Date.now()).format("YYYY-MM-DD")],
            ["end_date", moment(Date.now() + 3.156e+10).format("YYYY-MM-DD")]
        ]);

        await CRM("Activity", "create", {
            values: [
                ["source_record_id", membership.id],
                ["source_contact_id", this.id],
                ["target_contact_id", this.id],
                ["activity_type_id:name", "Membership Renewal"],

            ]
        });
    }
}