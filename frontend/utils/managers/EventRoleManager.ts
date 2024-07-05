import moment from "moment";
import { EventRole, EventRoleProps } from "../classes/EventRole";
import CRM, { ComparisonOperator } from "../crm";

export interface FetchOptions {
    id?: string;
    search?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    page?: number;
    [key: string]: any;
}

const EventRoleManager = new class EventRoleManager {
    private entity = "Activity";

    async fetch(options?: FetchOptions): Promise<EventRole | EventRole[]> {
        const where: [string, ComparisonOperator, string][] = [["activity_type_id:name", "=", "Volunteer Event Role"]];
        if (options?.id) where.push(["id", "=", options.id]);
        else {
            if (options?.search) where.push(["Event.subject", "CONTAINS", options.search]);
            if (options?.startDate) {
                where.push(
                    ["event.activity_date_time", ">=", `${moment(options.startDate).format("YYYY-MM-DD")} 00:00:00`],
                    ["event_activity_date_time", "<=", `${moment(options.endDate ?? options.startDate).format("YYYY-MM-DD")} 23:59:59`]
                );
            }
            else if (options?.endDate) where.push(["event.activity_date_time", "<=", `${moment(options.endDate).format("YYYY-MM-DD")} 23:59:59`]);
        }

        for (const key in options) {
            if (key.startsWith("Volunteer_Event_Details")) where.push([`event.${key}`, "IN", JSON.parse(options[key]) ?? "[]"]);
            else if (key.startsWith("Volunteer_Event_Role_Details")) where.push([key, "IN", JSON.parse(options[key]) ?? "[]"]);
        }

        const response = await CRM(this.entity, "get", {
            where,
            select: [
                "activity_date_time",
                "duration",

                "Volunteer_Event_Role_Details.*",
                "Volunteer_Event_Role_Details.Role:label",

                "Event.*",
                "Event.Role:label",

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
                ["Activity AS event", "LEFT", ["event.id", "=", "Volunteer_Event_Role_Details.Event"]],
                ["File AS thumbnail", "LEFT", ["thumbnail.id", "=", "event.Volunteer_Event_Details.Thumbnail"]]
            ]
        });

        if (options?.id) return new EventRole(response!.data[0]);
        return response!.data.map((r: EventRoleProps) => new EventRole(r));
    }
};

export default EventRoleManager;