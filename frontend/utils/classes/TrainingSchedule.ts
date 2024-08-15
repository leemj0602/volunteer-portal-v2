import CRM from "../crm.ts";
import ContactManager from "../managers/ContactManager.ts";
import TrainingRegistrationManager from "../managers/TrainingRegistrationManager.ts";
import { Training, TrainingProps } from "./Training.ts";
import { TrainingRegistration, TrainingRegistrationProps } from "./TrainingRegistration.ts";

export enum TrainingScheduleStatus {
    Scheduled = "Scheduled",
    Cancelled = "Cancelled"
}

interface MandatoryCustomTrainingScheduleProps {
    'Volunteer_Training_Schedule_Details.Vacancy': number | null,
    'Volunteer_Training_Schedule_Details.Registration_Start_Date': string | null,
    'Volunteer_Training_Schedule_Details.Registration_End_Date': string | null,
    'Volunteer_Training_Schedule_Details.Expiration_Date': string | null,
    [key: string]: any;
}

export interface TrainingScheduleProps extends MandatoryCustomTrainingScheduleProps {
    id: number | null;
    activity_date_time: string | null;
    "status_id:name": TrainingScheduleStatus | null;
    subject: string | null;
    location: string | null;
    [key: string]: any;
}

export class TrainingSchedule implements TrainingScheduleProps {
    public id: number | null = null;
    public activity_date_time: string | null = null;
    public "status_id:name": TrainingScheduleStatus | null = null;
    public subject: string | null = null;
    public location: string | null = null;

    public 'Volunteer_Training_Schedule_Details.Vacancy': number | null;
    public 'Volunteer_Training_Schedule_Details.Registration_Start_Date': string | null;
    public 'Volunteer_Training_Schedule_Details.Registration_End_Date': string | null;
    public 'Volunteer_Training_Schedule_Details.Expiration_Date': string | null;

    public training: Training;

    public registrations: TrainingRegistration[] = [];

    [key: string]: any;

    constructor(props: TrainingScheduleProps) {
        this.id = props.id;
        this.activity_date_time = props.activity_date_time;
        this["status_id:name"] = props["status_id:name"];
        this.subject = props.subject;
        this.location = props.location;

        const trainingDetails: Partial<TrainingProps> = {};
        for (const key in props) {
            if (key.startsWith("Volunteer_Training_Schedule_Details"))
                this[key] = props[key];
            else if (key.startsWith("training"))
                trainingDetails[key.split("training.")[1]] = props[key];
        }
        this.training = new Training(trainingDetails);

        // Process the registrations if provided
        if (props.registrations) {
            this.registrations = props.registrations.map(
                (r: TrainingRegistrationProps) => new TrainingRegistration(r)
            );
        }
    }

    async register(email: string) {
        const contact = await ContactManager.fetch(email);

        await CRM("Activity", "create", {
            values: [
                ["activity_type_id:name", "Volunteer Training Registration"],
                ["target_contact_id", [contact.id]],
                ["source_contact_id", contact.id],
                ["subject", this.subject],
                ["status_id:name", "Scheduled"],
                ["Volunteer_Training_Registration_Details.Training_Schedule", this.id],
            ]
        }).catch(() => null);

        // console.log(this.training.fetchSchedules())
        return this.training.fetchSchedules();
    }
}