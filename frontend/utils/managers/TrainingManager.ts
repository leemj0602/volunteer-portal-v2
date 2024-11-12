import { Training, TrainingProps } from "../classes/Training";
import CRM, { ComparisonOperator } from "../crm";

export interface FetchOptions {
    id?: string;
    limit?: number;
    page?: number;
}

const TrainingManager = new class TrainingManager {
    private entity = "Activity";

    async fetch(options?: FetchOptions): Promise<Training | Training[]> {
        const where: [string, ComparisonOperator, string][] = [
            ["activity_type_id:name", "=", "Volunteer Training Details"],
            ["status_id:name", "=", "Available"],
        ];
        if (options?.id) where.push(["id", "=", options.id]);

        const response = await CRM(this.entity, "get", {
            where,
            select: [
                "subject",
                "details",
                "status_id:name",
                "activity_date_time",
                "duration",
                "location",

                "Volunteer_Training_Details.*",
                "thumbnail.uri",

                'contact.first_name',
                'contact.last_name',
                'contact.email_primary.email',
                'contact.phone_primary.phone_numeric',
            ],
            join: [
                ["File AS thumbnail", "LEFT", ["thumbnail.id", "=", "Volunteer_Training_Details.Thumbnail"]],
                ['Contact AS contact', 'LEFT', ['target_contact_id', '=', 'contact.id']],
            ],
            limit: options?.limit,
            offset: options?.page && options?.limit ? (options.page - 1) * options.limit : 0
        });

        if (options?.id) return new Training(response!.data[0]);
        return response?.data.map((t: TrainingProps) => new Training(t));
    }
}

export default TrainingManager;