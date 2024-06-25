import config from "../../../config";
import CRM from "../crm";

interface MandatoryCustomEventDetailProps {
    "Volunteer_Event_Details.Category:name": string;
    "Volunteer_Event_Details.Attendance_Code": string;
    "Volunteer_Event_Details.Thumbnail": number;
}

interface EventDetails extends MandatoryCustomEventDetailProps {
    id: number;
    activity_date_time: string;
    subject: string;
    duration: number;
    details: string;
    location: string;
    "status_id:name": "Scheduled" | "Canceled";
    [key: string]: any;
}

interface MandatoryCustomEventRoleProps {
    "Volunteer_Event_Role_Details.Role:name": string;
    "Volunteer_Event_Role_Details.Vacancy": number;
    "Volunteer_Event_Role_Details.Volunteer_Event_Details": number;
}

interface EventRoleProps extends MandatoryCustomEventRoleProps {
    id: number;
    activity_date_time: string;
    duration: number;
    [key: string]: any;
}

class EventRole implements EventRoleProps {
    public id: number;
    public activity_date_time: string;
    public duration: number;

    public "Volunteer_Event_Role_Details.Role:name": string;
    public "Volunteer_Event_Role_Details.Vacancy": number;
    public "Volunteer_Event_Role_Details.Volunteer_Event_Details": number;
    [key: string]: any;

    constructor(props: EventRoleProps) {
        this.id = props.id;
        this.activity_date_time = props.activity_date_time;
        this.duration = props.duration;
        for (const key in props) if (key.startsWith("Volunteer_Event_Role_Details")) this[key] = props[key];
    }

    async fetchEvent() {
        
    }
}

export class EventRoleManager {
    private entity = "Activity";
    
    async fetchEventRoles(options?: { limit?: number, page?: number }): Promise<EventRoleProps[]> {
        const response = await CRM(this.entity, "get", {
            where: [["activity_type_id:name", "=", "Volunteer Event Role"]],
            select: [
                "activity_date_time",
                "duration",
                `Volunteer_Event_Role_Details.Role:name`,
                `Volunteer_Event_Role_Details.Vacancy`,
                `Volunteer_Event_Role_Details.Volunteer_Event_Details`,
            ]
        });
        const result = response!.data as EventRoleProps[];
        return result.map(r => new EventRole(r));
    }
}