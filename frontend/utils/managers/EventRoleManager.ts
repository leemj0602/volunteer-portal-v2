interface MandatoryCustomEventDetailProps {
    "Volunteer_Event_Details.Category:name": string;
    "Volunteer_Event_Details.Attendance_Code": string;
    "Volunteer_Event_Details.Thumbnail": number;
}

interface EventDetailProps extends MandatoryCustomEventDetailProps {
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
    "Volunteer_Event_Role_Details.Volunteer_Event_Details": number;
}

interface EventRoleProps extends MandatoryCustomEventRoleProps {
    id: number;
    activity_date_time: string;
    duration: number;
    [key: string]: any;
}

class EventRoleManager {
    
}