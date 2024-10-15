import { EventRole, EventRoleProps } from "./EventRole";

interface EventAttendanceProps {
    id: number;
    duration: number | null;
    [key: string]: any;
}
class EventAttendance implements EventAttendanceProps {
    public id: number;
    public duration: number | null = null;
    constructor(props: EventAttendanceProps) {
        this.id = props.id;
        this.duration = props.duration;
    }
}

export enum RegistrationStatus {
    Approved = "Completed",
    ApprovalRequired = "Approval Required",
    Unapproved = "Not Approved",
    Cancelled = "Cancelled"
}

export interface EventRegistrationProps {
    id: number;
    "status_id:name": RegistrationStatus;
    "contact.email_primary.email": string;
    "contact.id": string;
    "contact.first_name": string;
    "contact.last_name": string;
    [key: string]: any;
}

export class EventRegistration implements EventRegistrationProps {
    public id: number;
    public attendance: EventAttendance | null = null;
    public eventRole: EventRole;
    public "status_id:name": RegistrationStatus;
    public "contact.email_primary.email": string;
    public "contact.id": string;
    public "contact.first_name": string;
    public "contact.last_name": string;
    [key: string]: any;

    constructor(props: EventRegistrationProps) {
        this.id = props.id;
        this["status_id:name"] = props["status_id:name"];
        this["contact.email_primary.email"] = props["contact.email_primary.email"];
        this["contact.id"] = props["contact.id"];
        this["contact.first_name"] = props["contact.first_name"];
        this["contact.last_name"] = props["contact.last_name"];

        const eventAttendanceDetails: Partial<EventAttendanceProps> = {};
        const eventRoleDetails: Partial<EventRoleProps> = {};
        for (const key in props) {
            if (key.startsWith("attendance.")) eventAttendanceDetails[key.split("attendance.")[1]] = props[key];
            if (key.startsWith("eventRole.")) eventRoleDetails[key.split("eventRole.")[1]] = props[key];
            if (key.startsWith("event.")) eventRoleDetails[key] = props[key];
        }

        this.attendance = eventAttendanceDetails.id ? new EventAttendance(eventAttendanceDetails as EventAttendanceProps) : null;
        this.eventRole = new EventRole(eventRoleDetails as EventRoleProps);
    }
}