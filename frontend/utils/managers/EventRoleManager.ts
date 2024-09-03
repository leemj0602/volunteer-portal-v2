import moment from "moment";
import { EventRole, EventRoleProps } from "../classes/EventRole";
import CRM, { ComparisonOperator } from "../crm";
import { format } from "date-fns";

export interface FetchOptions {
    id?: string;
    limit?: number;
    page?: number;
    select?: string[];
    where?: [string, ComparisonOperator, any][];
    group?: string[];
    order?: [string, "ASC" | "DESC"][];
}

const EventRoleManager = new class EventRoleManager {
    private entity = "Activity";

    async fetch(options?: FetchOptions): Promise<EventRole | EventRole[]> {
        const where: [string, ComparisonOperator, any][] = [
            ["activity_type_id:name", "=", "Volunteer Event Role"],
            ["event.status_id:name", "=", "Available"],
            ["status_id:name", "!=", "Cancelled"]
        ];
        if (options?.id) where.push(["id", "=", options.id]);
        else if (options?.where) where.push(...options.where);

        const response = await CRM(this.entity, "get", {
            where,
            select: options?.select ?? [
                "id",
                "activity_date_time",
                "duration",
                "status_id:name",

                "Volunteer_Event_Role_Details.*",
                "Volunteer_Event_Role_Details.Role:label",

                "event.id",
                "event.activity_date_time",
                "event.subject",
                "event.duration",
                "event.details",
                "event.location",
                "event.status_id:name",
                "event.Volunteer_Event_Details.*",

                "thumbnail.uri"
            ],
            join: [
                ["Activity AS event", "LEFT", ["event.id", "=", "Volunteer_Event_Role_Details.Event"]],
                ["File AS thumbnail", "LEFT", ["thumbnail.id", "=", "event.Volunteer_Event_Details.Thumbnail"]]
            ],
            limit: options?.limit,
            offset: options?.page && options?.limit ? (options?.page - 1) * options?.limit : 0,
            group: options?.group ?? [],
            order: options?.order ?? []
        });

        if (options?.id) return new EventRole(response!.data[0]);
        if (!response?.data?.map) return [] as EventRole[];
        return response.data.map((r: EventRoleProps) => new EventRole(r));
    }

    async fetchUnregistered(registeredEventRoles: number[]) {
        const now = new Date();
        const formattedNow = format(now, "yyyy-MM-dd HH:mm:ss");
        return await this.fetch({
            where: [
                ["activity_date_time", ">", formattedNow],
                ["id", "NOT IN", registeredEventRoles]
            ]
        }) as EventRole[];
    }

};

export default EventRoleManager;