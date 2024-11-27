import { JobRequest, JobRequestProps, JobRequestStatus } from "../classes/JobRequest";
import CRM from "../crm";
import ContactManager from "./ContactManager";
import OptionValueManager from "./OptionValueManager";

const JobRequestManager = new class JobRequestManager {
    async create(creatorEmail: string, patientEmail: string, props: Partial<JobRequest>) {
        const creator = await ContactManager.fetch(creatorEmail);
        const patient = await ContactManager.fetch(patientEmail);

        let status = JobRequestStatus.Approved;

        const optionValue = await OptionValueManager.get("Job_Request_Details_Category", Number(props["Job_Request_Details.Category"]!));
        if (optionValue.name === "Others") {
            status = JobRequestStatus.ApprovalRequired;
        }

        const baseValues: [string, any][] = [
            ["activity_type_id:name", "Job Request"],
            ["target_contact_id", [patient.id]],
            ["source_contact_id", creator.id],
            ["status_id:name", status],
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
                'Job_Request_Details.Category:label',
                'status_id:name',
                'activity_date_time',
                
                "contact.email_primary.email",
            ],
            join: [
                ['Contact AS contact', 'LEFT', ['target_contact_id', '=', 'contact.id']],
            ],
            where: [
                ['activity_type_id:name', '=', 'Job Request'],
                ['contact.id', '=', props.contactId],
            ],
        }).catch(() => null);

        return ((response?.data ?? []) as JobRequestProps[]).map(j => new JobRequest(j));
    }
}

export default JobRequestManager;