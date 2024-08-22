import { EventDetails } from "../classes/EventDetails";
import CRM from "../crm";


const EventDetailManager = new class EventDetailManager {
    private entity = "Activity";
    
    public async fetch(id: string) {
        const response = await CRM(this.entity, "get", {
            select: [
                "id",
                "activity_date_time",
                "subject",
                "duration",
                "details",
                "location",
                "status_id:name",
                "Volunteer_Event_Details.*",
                "thumbnail.uri"
            ],
            join: [
                ["File AS thumbnail", "LEFT", ["thumbnail.id", "=", "Volunteer_Event_Details.Thumbnail"]]
            ],
            where: [
                ["activity_type_id:name", "=", "Volunteer Event Details"],
                ["id", "=", id]
            ]
        }).catch(() => null);
        if (!response) return null;
        return new EventDetails(response!.data[0]);
    }
}

export default EventDetailManager;