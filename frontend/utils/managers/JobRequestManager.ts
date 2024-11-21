import { JobRequest } from "../classes/JobRequest";
import CRM from "../crm";
import ContactManager from "./ContactManager";

const JobRequestManager = new class JobRequestManager {
    async create(creatorEmail: string, patientEmail: string, props: Partial<JobRequest>) {
        const creator = await ContactManager.fetch(creatorEmail);
        const patient = await ContactManager.fetch(patientEmail);

        const baseValues: [string, any][] = [
            ["activity_type_id:name", "Job Request"],
            ["target_contact_id", [patient.id]],
            ["source_contact_id", creator.id],
        ];

        const propsValues: [string, any][] = Object.entries(props).map(
            ([key, value]) => [key, value] as [string, any]
        );

        const combinedValues = [...baseValues, ...propsValues];

        await CRM("Activity", "create", {
            values: combinedValues,
        })
    }

}

export default JobRequestManager;