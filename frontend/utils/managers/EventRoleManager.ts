import moment from "moment";
import { EventRole, EventRoleProps } from "../classes/EventRole";
import CRM, { ComparisonOperator, WhereClause } from "../crm";
import { format } from "date-fns";

export interface FetchOptions {
    id?: string;
    limit?: number;
    page?: number;
    select?: string[];
    where?: WhereClause;
    group?: string[];
    order?: [string, "ASC" | "DESC"][];
}

const EventRoleManager = new class EventRoleManager {
    private entity = "Activity";

    async fetch(options?: FetchOptions): Promise<EventRole | EventRole[]> {
        const where: WhereClause = [
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

    async fetchUnregistered(eventRegistrationIds: number[], limit?: number) {
        const formattedNow = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");
        return await this.fetch({
            limit,
            where: [
                ['OR', [
                    // Case 1: Both start and end dates are set and the current time is within the range
                    ['AND', [
                        ['Volunteer_Event_Role_Details.Registration_Start_Date', '<=', formattedNow],
                        ['Volunteer_Event_Role_Details.Registration_End_Date', '>=', formattedNow]
                    ]],
                    // Case 2: Start date is NULL (always open) and the end date is in the future
                    ['AND', [
                        ['Volunteer_Event_Role_Details.Registration_Start_Date', 'IS NULL'],
                        ['Volunteer_Event_Role_Details.Registration_End_Date', '>=', formattedNow]
                    ]],
                    // Case 3: Start date is in the past, end date is NULL (open indefinitely), and activity date is in the future
                    ['AND', [
                        ['Volunteer_Event_Role_Details.Registration_Start_Date', '<=', formattedNow],
                        ['Volunteer_Event_Role_Details.Registration_End_Date', 'IS NULL'],
                        ['activity_date_time', '>=', formattedNow]
                    ]],
                    // Case 4: Registration has ended but the activity is still in the future
                    ['AND', [
                        ['Volunteer_Event_Role_Details.Registration_End_Date', '<', formattedNow],
                        ['activity_date_time', '>=', formattedNow]
                    ]],
                    // Case 5: Both start and end dates are NULL (completely open) and activity date is in the future
                    ['AND', [
                        ['Volunteer_Event_Role_Details.Registration_Start_Date', 'IS NULL'],
                        ['Volunteer_Event_Role_Details.Registration_End_Date', 'IS NULL'],
                        ['activity_date_time', '>=', formattedNow]
                    ]]
                ]],
                ["activity_date_time", ">", formattedNow],
                ["id", "NOT IN", eventRegistrationIds],
            ],
        }) as EventRole[];
    }

};

export default EventRoleManager;