interface MandatoryCustomEventDetailProps {
    "Volunteer_Event_Details.Category:name": string;
    "Volunteer_Event_Details.Thumbnail": number;
    [key: string]: any;
}

export interface EventDetails extends MandatoryCustomEventDetailProps {
    id: number;
    activity_date_time: string;
    subject: string;
    duration: number;
    details: string;
    location: string;
    thumbnail: string;
    "status_id:name": "Scheduled" | "Canceled";
}
