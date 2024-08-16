import { Entity } from "./Entity";

enum CustomFieldSets {
    VolunteerEventDetails = "Volunteer_Event_Details"
}

export class Event extends Entity {
    data: {
        id?: number;
        subject?: string;
        duration?: number;
        location?: string;
        "status_id:name"?: "Scheduled" | "Cancelled";

        thumbnail?: {
            uri?: string;
        }

        Volunteer_Event_Details?: {
            Attendance_Code?: string;
            Thumbnail?: number;
            [key: string]: any;
        }
    } = {}

    constructor(data: { [key: string]: any }) {
        super();
        for (const key in data)
            this.setNestedValue(this.data, key, data[key]);
    }

    getCustomFields(set: CustomFieldSets) {
        return this.data[set];
    }
}