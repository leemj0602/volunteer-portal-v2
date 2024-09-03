import { TrainingSchedule, TrainingScheduleProps } from "./TrainingSchedule";
import CRM from "../crm";
import { format } from "date-fns";
import { Contact, ContactProps } from "./Contact";

interface TrainingScheduleFetchOptions {
    select?: string[];
}

export enum TrainingStatus {
    Scheduled = "Scheduled",
    Cancelled = "Cancelled"
}

interface MandatoryCustomTrainingProps {
    "Volunteer_Training_Details.Thumbnail": number | null;
    "Volunteer_Training_Details.Expiration_Date": string | null;
    "Volunteer_Training_Details.Validity_Period": number | null;
    [key: string]: any;
}

export interface TrainingProps extends MandatoryCustomTrainingProps {
    id: number | null;
    activity_date_time: string | null;
    subject: string | null;
    duration: number | null;
    details: string | null;
    location: string | null;
    thumbnail: string | null;
    "status_id:name": TrainingStatus | null;
}

export class Training implements TrainingProps {
    public id: number | null = null;
    public activity_date_time: string | null = null;
    public subject: string | null = null;
    public duration: number | null = null;
    public details: string | null = null;
    public location: string | null = null;
    public thumbnail: string | null = null;
    public "status_id:name": TrainingStatus | null = null;

    public "Volunteer_Training_Details.Thumbnail": number | null = null;
    public "Volunteer_Training_Details.Expiration_Date": string | null = null;
    public "Volunteer_Training_Details.Validity_Period": number | null = null;

    public contact: Contact | null = null;
    [key: string]: any;

    constructor(props: Partial<TrainingProps>) {
        const contactDetails: Partial<ContactProps> = {};

        for (const key in props) {
            if (key.startsWith("thumbnail")) this.thumbnail = props[key];
            else if (key.startsWith("contact")) contactDetails[key.split("contact.")[1]] = props[key];
            else this[key as keyof Training] = props[key];
        }
        this.contact = new Contact(contactDetails);
    }

    async fetchSchedules(props?: TrainingScheduleFetchOptions) {
        const now = new Date();
        const formattedNow = format(now, "yyyy-MM-dd HH:mm:ss");

        const response = await CRM('Activity', 'get', {
            select: props?.select ?? [
                'activity_date_time',
                'status_id:name',
                'subject',
                'location',

                'Volunteer_Training_Schedule_Details.Vacancy',
                'Volunteer_Training_Schedule_Details.Registration_Start_Date',
                'Volunteer_Training_Schedule_Details.Registration_End_Date',
                'Volunteer_Training_Schedule_Details.Expiration_Date',

                'training.id',
                'training.subject',
                'training.status_id:name',
                'training.duration'
            ],
            where: [
                ['activity_type_id:name', '=', 'Volunteer Training Schedule'],
                ['Volunteer_Training_Schedule_Details.Training', '=', this.id],
                ['activity_date_time', '>=', formattedNow],
                ["status_id:name", "!=", "Cancelled"],
                ['OR', [
                    // Case 1: Both start and end dates are set and the current time is within the range
                    ['AND', [
                        ['Volunteer_Training_Schedule_Details.Registration_Start_Date', '<=', formattedNow],
                        ['Volunteer_Training_Schedule_Details.Registration_End_Date', '>=', formattedNow]
                    ]],
                    // Case 2: Start date is NULL (always open) and the end date is in the future
                    ['AND', [
                        ['Volunteer_Training_Schedule_Details.Registration_Start_Date', 'IS NULL'],
                        ['Volunteer_Training_Schedule_Details.Registration_End_Date', '>=', formattedNow]
                    ]],
                    // Case 3: Start date is in the past, end date is NULL (open indefinitely), and activity date is in the future
                    ['AND', [
                        ['Volunteer_Training_Schedule_Details.Registration_Start_Date', '<=', formattedNow],
                        ['Volunteer_Training_Schedule_Details.Registration_End_Date', 'IS NULL'],
                        ['activity_date_time', '>=', formattedNow]
                    ]],
                    // Case 4: Registration has ended but the activity is still in the future
                    ['AND', [
                        ['Volunteer_Training_Schedule_Details.Registration_End_Date', '<', formattedNow],
                        ['activity_date_time', '>=', formattedNow]
                    ]],
                    // Case 5: Both start and end dates are NULL (completely open) and activity date is in the future
                    ['AND', [
                        ['Volunteer_Training_Schedule_Details.Registration_Start_Date', 'IS NULL'],
                        ['Volunteer_Training_Schedule_Details.Registration_End_Date', 'IS NULL'],
                        ['activity_date_time', '>=', formattedNow]
                    ]]
                ]]
            ],
            join: [
                ['Activity AS training', 'LEFT', ['training.id', '=', 'Volunteer_Training_Schedule_Details.Training']],
            ],
            order: [
                ['activity_date_time', 'ASC']
            ],
            chain: {
                'registrations': ['Activity', 'get', {
                    select: [
                        'id',
                        'status_id:name',
                        'contact.email_primary.email',
                    ],
                    where: [
                        ['Volunteer_Training_Registration_Details.Training_Schedule', '=', '$id']
                    ],
                    join: [
                        ['Contact AS contact', 'LEFT', ['target_contact_id', '=', 'contact.id']],
                    ],
                }]
            }
            // limit?
        });

        return response?.data.map((ts: TrainingScheduleProps) => new TrainingSchedule(ts));
    }
}