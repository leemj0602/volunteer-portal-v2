import CRM, { ComparisonOperator } from "../crm";
import ContactManager from "../managers/ContactManager";
import EventRegistrationManager from "../managers/EventRegistrationManager";
import { EventDetailProps, EventDetails, EventStatus } from "./EventDetails";
import { EventRegistration, EventRegistrationProps, RegistrationStatus } from "./EventRegistration";

interface MandatoryCustomEventRoleProps {
    "Volunteer_Event_Role_Details.Role:label": string | null;
    "Volunteer_Event_Role_Details.Vacancy": number | null;
    "Volunteer_Event_Role_Details.Approval_Required": boolean | null;
    "Volunteer_Event_Role_Details.Registration_Start_Date": string | null;
    "Volunteer_Event_Role_Details.Registration_End_Date": string | null;
    "Volunteer_Event_Role_Details.Registration_Start_Days_Before": number | null;
    "Volunteer_Event_Role_Details.Registration_End_Days_Before": number | null;
    [key: string]: any;
}

export interface EventRoleProps extends MandatoryCustomEventRoleProps {
    id: number | null;
    activity_date_time: string | null;
    duration: number | null;
    "status_id:name": EventStatus | null;
}


export class EventRole implements EventRoleProps {
    public id: number | null;
    public activity_date_time: string | null;
    public duration: number | null;
    public event: EventDetails;
    public "status_id:name": EventStatus | null;

    public "Volunteer_Event_Role_Details.Role:label": string | null;
    public "Volunteer_Event_Role_Details.Vacancy": number | null;
    public "Volunteer_Event_Role_Details.Approval_Required": boolean;
    public "Volunteer_Event_Role_Details.Registration_Start_Date": string | null;
    public "Volunteer_Event_Role_Details.Registration_End_Date": string | null;
    public "Volunteer_Event_Role_Details.Registration_Start_Days_Before": number | null;
    public "Volunteer_Event_Role_Details.Registration_End_Days_Before": number | null;
    [key: string]: any;

    constructor(props: EventRoleProps) {
        this.id = props.id;
        this.activity_date_time = props.activity_date_time;
        this.duration = props.duration;
        this["status_id:name"] = props["status_id:name"];

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
        await CRM("Activity", "create", {
            values: [
                ["activity_type_id:name", "Volunteer Event Registration"],
                ["target_contact_id", [contact.id]],
                ["source_contact_id", contact.id],
                ["subject", `${this["Volunteer_Event_Role_Details.Role:label"]} - ${this.event.subject}`],
                ["status_id:name", this["Volunteer_Event_Role_Details.Approval_Required"] ? RegistrationStatus.ApprovalRequired : RegistrationStatus.Approved],
                ["Volunteer_Event_Registration_Details.Event_Role", this.id]
            ]
        }).catch(() => null);

        return this.fetchRegistrations();
    }

    async fetchRegistrations() {
        return EventRegistrationManager.fetch({ eventRoleId: this.id! });
    }
}