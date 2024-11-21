export enum JobRequestStatus {
    Approved = "Completed",
    ApprovalRequired = "Approval Required",
    Unapproved = "Not Approved"
}

export interface JobRequestProps {
    id: number | null;
    "Job_Request.Category": number | null;
    subject: string | null;
    details: string | null;
    "status_id:name": JobRequestStatus | null;
}

export class JobRequest implements JobRequestProps {
    public id: number | null;
    public "Job_Request.Category": number | null;
    public subject: string | null;
    public details: string | null;
    public "status_id:name": JobRequestStatus | null;
    [key: string]: any;

    constructor(props: JobRequestProps) {
        this.id = props.id;
        this["Job_Request.Category"] = props["Job_Request.Category"];
        this.subject = props.subject;
        this.details = props.details;
        this["status_id:name"] = props["status_id:name"]
    }
}