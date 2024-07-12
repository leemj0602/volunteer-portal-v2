import CRM, { ComparisonOperator } from "../crm";
import ContactManager from "../managers/ContactManager";
import { EventDetailProps, EventDetails } from "./EventDetails";
import { EventRegistration, EventRegistrationProps, RegistrationStatus } from "./EventRegistration";

interface MandatoryCustomEventRoleProps {
    "Volunteer_Event_Role_Details.Role:label": string;
    "Volunteer_Event_Role_Details.Vacancy": number;
    "Volunteer_Event_Role_Details.Approval_Required": boolean;
    "Volunteer_Event_Role_Details.Registration_Start_Date": string | null;
    "Volunteer_Event_Role_Details.Registration_End_Date": string | null;
    "Volunteer_Event_Role_Details.Registration_Start_Days_Before": number;
    "Volunteer_Event_Role_Details.Registration_End_Days_Before": number;
    [key: string]: any;
}

export interface EventRoleProps extends MandatoryCustomEventRoleProps {
    id: number;
    activity_date_time: string;
    duration: number;
}


export class EventRole implements EventRoleProps {
    public id: number;
    public activity_date_time: string;
    public duration: number;
    public event: EventDetails;

    public "Volunteer_Event_Role_Details.Role:label": string;
    public "Volunteer_Event_Role_Details.Vacancy": number;
    public "Volunteer_Event_Role_Details.Approval_Required": boolean;
    public "Volunteer_Event_Role_Details.Registration_Start_Date": string | null;
    public "Volunteer_Event_Role_Details.Registration_End_Date": string | null;
    public "Volunteer_Event_Role_Details.Registration_Start_Days_Before": number;
    public "Volunteer_Event_Role_Details.Registration_End_Days_Before": number;
    [key: string]: any;

    constructor(props: EventRoleProps) {
        this.id = props.id;
        this.activity_date_time = props.activity_date_time;
        this.duration = props.duration;

        const eventDetails: Partial<EventDetailProps> = {};
        for (const key in props)
            if (key.startsWith("Volunteer_Event_Role_Details"))
                this[key] = props[key];
            else if (key.startsWith("event"))
                eventDetails[key.split("event.")[1]] = props[key];
            else if (key.startsWith("thumbnail"))
                eventDetails.thumbnail = props[key];
        this.event = new EventDetails(eventDetails);
    }

    async register(email: string) {
        const contact = await ContactManager.fetch(email);
        console.log(contact.id);
        const response = await CRM("Activity", "create", {
            values: [
                ["activity_type_id:name", "Volunteer Event Registration"],
                ["target_contact_id", [contact.id]],
                ["source_contact_id", contact.id],
                ["subject", `${this["Volunteer_Event_Role_Details.Role:label"]} - ${this.event.subject}`],
                ["status_id:name", this["Volunteer_Event_Role_Details.Approval_Required"] ? RegistrationStatus.ApprovalRequired : RegistrationStatus.Approved],
                ["Volunteer_Event_Registration_Details.Event_Role", this.id]
            ]
        }).catch(() => null);

        return response?.data?.length ? true : false;
    }

    async fetchRegistrations() {
        const response = await CRM("Activity", "get", {
            select: ["contact.email_primary.email", "status_id:name"],
            join: [["Contact AS contact", "LEFT", ["target_contact_id", "=", "contact.id"]]],
            where: [
                ["activity_type_id:name", "=", "Volunteer Event Registration"],
                ["Volunteer_Event_Registration_Details.Event_Role", "=", this.id]                    
            ],
        });

        return (response?.data as EventRegistrationProps[]).map(d => new EventRegistration(d));
    }
}