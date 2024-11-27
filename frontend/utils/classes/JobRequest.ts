export enum JobRequestStatus {
    Approved = "Approved",
    ApprovalRequired = "Approval Required",
    Unapproved = "Not Approved",
    Cancelled = "Cancelled",
}

export interface JobRequestProps {
    id: number | null;
    "Job_Request_Details.Request_Type": number | null;
    "Job_Request_Details.Request_Type:label": string | null;
    subject: string | null;
    details: string | null;
    "status_id:name": JobRequestStatus | null;
    activity_date_time: string | null;
    location: string | null;
    "contact.email_primary.email": string;
    "contact.id": string;
    "contact.first_name": string;
    "contact.last_name": string;
    [key: string]: any;
}

export class JobRequest implements JobRequestProps {
    public id: number | null;
    public "Job_Request_Details.Request_Type": number | null;
    public "Job_Request_Details.Request_Type:label": string | null;
    public subject: string | null;
    public details: string | null;
    public "status_id:name": JobRequestStatus | null;
    public activity_date_time: string | null;
    public location: string | null;
    public "contact.email_primary.email": string;
    public "contact.id": string;
    public "contact.first_name": string;
    public "contact.last_name": string;
    [key: string]: any;

    constructor(props: JobRequestProps) {
        this.id = props.id;
        this["Job_Request_Details.Request_Type"] = props["Job_Request_Details.Request_Type"];
        this["Job_Request_Details.Request_Type:label"] = props["Job_Request_Details.Request_Type:label"];
        this.subject = props.subject;
        this.details = props.details;
        this["status_id:name"] = props["status_id:name"];
        this.activity_date_time = props.activity_date_time;
        this.location = props.location;
        this["contact.email_primary.email"] = props["contact.email_primary.email"];
        this["contact.id"] = props["contact.id"];
        this["contact.first_name"] = props["contact.first_name"];
        this["contact.last_name"] = props["contact.last_name"];
    }
}