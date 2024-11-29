import { JobRequest, JobRequestProps, JobRequestStatus } from "../classes/JobRequest";
import CRM, { ComparisonOperator } from "../crm";
import ContactManager from "./ContactManager";
import OptionValueManager from "./OptionValueManager";

interface FetchOptions {
    where?: [string, ComparisonOperator, any?][];
    limit?: number;
    page?: number;
    select?: string[];
    order?: [string, 'ASC' | 'DESC'][]
}
const JobRequestManager = new class JobRequestManager {
    async create(creatorEmail: string, patientEmail: string, props: Partial<JobRequest>) {
        const creator = await ContactManager.fetch(creatorEmail);
        const patient = await ContactManager.fetch(patientEmail);

        let status = JobRequestStatus.Approved;

        const optionValue = await OptionValueManager.get("Job_Request_Details_Request_Type", Number(props["Job_Request_Details.Request_Type"]!));
        let subject = optionValue.name;
        if (optionValue.name === "Others") {
            status = JobRequestStatus.ApprovalRequired;
        }

        const baseValues: [string, any][] = [
            ["activity_type_id:name", "Job Request"],
            ["target_contact_id", [patient.id]],
            ["source_contact_id", creator.id],
            ["status_id:name", status],
            ["subject", subject],
        ];

        const propsValues: [string, any][] = Object.entries(props).map(
            ([key, value]) => [key, value] as [string, any]
        );

        const combinedValues = [...baseValues, ...propsValues];

        const response = await CRM("Activity", "create", {
            values: combinedValues,
        }).catch(() => null);

        if (response) return status
        else return null;
    }

    async fetch(props: { contactId: number }) {
        const response = await CRM("Activity", "get", {
            select: [
                'subject',
                'details',
                'Job_Request_Details.Request_Type',
                'Job_Request_Detail.Request_Type:label',
                'status_id:name',
                'activity_date_time',
                'location',
                'created_date',
                'Job_Request_Details.*',
                'Job_Request_Details.Request_Type:label',
                'contact.*',
                'contact.email_primary.*',
                'accepted_job.id',
                'accepted_job.source_contact_id',
                'accepted_job.status_id:name'
            ],
            join: [
                ['Contact AS contact', 'LEFT', ['target_contact_id', '=', 'contact.id']],
                ['Activity AS accepted_job', 'LEFT', ['accepted_job.Volunteer_Accepted_Job_Details.Job_Request', '=', 'id']]
            ],
            where: [
                ['activity_type_id:name', '=', 'Job Request'],
                ['contact.id', '=', props.contactId],
            ],
        }).catch(() => null);

        return ((response?.data ?? []) as JobRequestProps[]).map(j => new JobRequest(j));
    }

    async update(jobRequestId: number, props: Partial<JobRequest>) {
        console.log(props);
        let status = JobRequestStatus.Approved;

        const optionValue = await OptionValueManager.get("Job_Request_Details_Request_Type", Number(props["Job_Request_Details.Request_Type"]!));
        let subject = optionValue.label;
        if (optionValue.name === "Others") {
            status = JobRequestStatus.ApprovalRequired;
        }

        const baseValues: [string, any][] = [
            ["status_id:name", status],
            ["subject", subject],
        ];

        const propsValues: [string, any][] = Object.entries(props)
            .map(([key, value]) => [key, value] as [string, any]);

        const combinedValues = [...baseValues, ...propsValues];

        const response = await CRM("Activity", "update", {
            values: combinedValues,
            where: [
                ["id", "=", jobRequestId],
            ]
        }).catch(() => null);

        if (response) return status
        else return null;
    }

    async fetchAll(options?: FetchOptions) {
        const response = await CRM('Activity', 'get', {
            select: [
                'subject',
                'details',
                'Job_Request_Detail.Request_Type:label',
                'status_id:name',
                'activity_date_time',
                'location',
                'created_date',
                'Job_Request_Details.*',
                'Job_Request_Details.Request_Type:label',
                'contact.*',
                'contact.email_primary.*',
                'accepted_job.id',
                'accepted_job.source_contact_id',
                'accepted_job.status_id:name'
            ],
            join: [
                ['Contact AS contact', 'LEFT', ['target_contact_id', '=', 'contact.id']],
                ['Activity AS accepted_job', 'LEFT', ['accepted_job.Volunteer_Accepted_Job_Details.Job_Request', '=', 'id']]
            ],
            where: [
                ...options?.where ?? [],
                ['activity_type_id:name', '=', 'Job Request'],
            ],
            limit: options?.limit,
            offset: options?.page && options?.limit ? (options?.page - 1) * options.limit : 0,
            order: options?.order ?? []
        }).catch(console.log);

        return ((response?.data ?? []) as JobRequestProps[]).map(j => new JobRequest(j));

    }

    async cancelRequest(jobRequestId: number) {
        const cancel = await CRM("Activity", 'update', {
            values: [
                ['status_id:name', 'Cancelled'],
            ],
            where: [
                ['id', '=', jobRequestId],
            ]
        });

        return cancel?.data.length > 0;
    }
}

export default JobRequestManager;