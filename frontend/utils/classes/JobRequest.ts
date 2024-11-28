import CRM from "../crm";

export enum JobRequestStatus {
    Approved = "Approved",
    ApprovalRequired = "Approval Required",
    Unapproved = "Not Approved",
    Cancelled = "Cancelled",
}

export enum AcceptedJobStatus {
    Scheduled = "Scheduled",
    Completed = "Completed",
    Cancelled = "Cancelled"
}

interface AcceptedJob {
    id: number;
    "Volunteer_Accepted_Job_Details.Job_Request": number;
    'status_id:name': AcceptedJobStatus
}

export interface JobRequestProps {
    id: number;
    "Job_Request_Details.Request_Type": number;
    "Job_Request_Details.Request_Type:label": string;
    subject: string;
    details: string;
    "status_id:name": JobRequestStatus;
    activity_date_time: string;
    location: string;
    "contact.email_primary.email": string;
    "contact.id": string;
    "contact.first_name": string;
    "contact.last_name": string;
    "accepted_job.id": number | null;
    "accepted_job.source_contact_id": number | null;
    'accepted_job.status_id:name': AcceptedJobStatus;
    created_date: string;
    [key: string]: any;
}

export class JobRequest implements JobRequestProps {
    public id: number;
    public "Job_Request_Details.Request_Type": number;
    public "Job_Request_Details.Request_Type:label": string;
    public subject: string;
    public details: string;
    public "status_id:name": JobRequestStatus;
    public activity_date_time: string;
    public location: string;
    public created_date: string;
    public "contact.email_primary.email": string;
    public "contact.id": string;
    public "contact.first_name": string;
    public "contact.last_name": string;
    public "accepted_job.id": number | null;
    public "accepted_job.source_contact_id": number | null;
    public "accepted_job.status_id:name": AcceptedJobStatus;
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
        this.created_date = props.created_date;
        this["contact.email_primary.email"] = props["contact.email_primary.email"];
        this["contact.id"] = props["contact.id"];
        this["contact.first_name"] = props["contact.first_name"];
        this["contact.last_name"] = props["contact.last_name"];
        this["accepted_job.id"] = props["accepted_job.id"];
        this["accepted_job.source_contact_id"] = props["accepted_job.source_contact_id"];
        this["accepted_job.status_id:name"] = props["accepted_job.status_id:name"]
    }

    /**
     * Accepting the job (provided that the accepted_job is not null)
     * @param contactId The contact who accepted the job 
     */
    async accept(contactId: number) {
        if (this["accepted_job.id"]) return null;
        else {
            const response = await CRM("Activity", "create", {
                values: [
                    ["source_contact_id", contactId],
                    ["activity_type_id:name", "Volunteer Accepted Job"],
                    ["Volunteer_Accepted_Job_Details.Job_Request", this.id]
                ]
           }).catch(() => null);
           if (!response) return null;
           const data = response.data as AcceptedJob;
           this["accepted_job.id"] = data.id;
           this["accepted_job.id"] = data["Volunteer_Accepted_Job_Details.Job_Request"];
           return this;
        }
    }
}