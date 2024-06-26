import config from "../../../config";
import { EventRole, EventRoleProps } from "../classes/EventRole";
import CRM, { ComparisonOperator } from "../crm";

const EventRoleManager = new class EventRoleManager {
    private entity = "Activity";

    async fetch(options?: { id?: string, limit?: number, page?: number }): Promise<EventRole | EventRole[]> {
        const where: [string, ComparisonOperator, string][] = [["activity_type_id:name", "=", "Volunteer Event Role"]];
        if (options?.id) where.push(["id", "=", options.id]);

        const response = await CRM(this.entity, "get", { 
            where,
            select: [
                "activity_date_time",
                "duration",

                "Volunteer_Event_Role_Details.Vacancy",
                "Volunteer_Event_Role_Details.Role:name",

                "event.id",
                "event.subject",
                "event.details",
                "event.activity_date_time",
                "event.duration",
                "event.details",
                "event.location",
                "event.status_id:name",
                
                "event.Volunteer_Event_Details.*",
                "event.Volunteer_Event_Details.Category:name",
                "thumbnail.uri"
            ],
            join: [
                ["Activity AS event", "LEFT", ["event.id", "=", "Volunteer_Event_Role_Details.Volunteer_Event_Details"]],
                ["File AS thumbnail", "LEFT", ["thumbnail.id", "=", "event.Volunteer_Event_Details.Thumbnail"]]
            ]
        });

        if (options?.id) return new EventRole(response!.data[0]);
        return response!.data.map((r: EventRoleProps) => new EventRole(r));
    }
}

export default EventRoleManager;