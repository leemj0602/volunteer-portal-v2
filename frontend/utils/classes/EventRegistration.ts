export enum RegistrationStatus {
    Approved = "Completed",
    ApprovalRequired = "Approval Required",
    Unapproved = "Unapproved"
}

export interface EventRegistrationProps {
    id: number;
    "status_id:name": RegistrationStatus;
    "contact.email_primary.email": string;
}

export class EventRegistration implements EventRegistrationProps {
    public id: number;
    public "status_id:name": RegistrationStatus;
    public "contact.email_primary.email": string;
    
    constructor(props: EventRegistrationProps) {
        this.id = props.id;
        this["status_id:name"] = props["status_id:name"];
        this["contact.email_primary.email"] = props["contact.email_primary.email"];
    }
}