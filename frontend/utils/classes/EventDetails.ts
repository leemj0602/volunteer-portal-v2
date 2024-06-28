interface MandatoryCustomEventDetailProps {
    "Volunteer_Event_Details.Category": any;
    "Volunteer_Event_Details.Category:name": string | null;
    "Volunteer_Event_Details.Thumbnail": number | null;
    [key: string]: any;
}

export interface EventDetailProps extends MandatoryCustomEventDetailProps {
    id: number | null;
    activity_date_time: string | null;
    subject: string | null;
    duration: number | null;
    details: string | null;
    location: string | null;
    thumbnail: string | null;
    "status_id:name": null | "Scheduled" | "Canceled";
}

export class EventDetails implements EventDetailProps {
    public id: number | null = null;
    public activity_date_time: string | null = null;
    public subject: string | null = null;
    public duration: number | null = null;
    public details: string | null = null;
    public location: string | null = null;
    public thumbnail: string | null = null;
    public "status_id:name": null | "Scheduled" | "Canceled" = null;

    public "Volunteer_Event_Details.Category": any = null;
    public "Volunteer_Event_Details.Category:name": string | null = null;
    public "Volunteer_Event_Details.Thumbnail": number | null = null;

    constructor(props: Partial<EventDetailProps>) {
        for (const key in props) this[key as keyof EventDetails] = props[key];
    }

    public getOptionalCustomFields() {
        const keys = Object.keys(this);
        const emptyEventDetails = new EventDetails({} as EventDetailProps);
        const defaultKeys = Object.keys(emptyEventDetails);
        const customKeys = keys.filter(k => !defaultKeys.includes(k));

        const result: { [key: string]: any } = {};
        for (const key of customKeys) result[key] = this[key as keyof EventDetails];
        return result;
    }
}