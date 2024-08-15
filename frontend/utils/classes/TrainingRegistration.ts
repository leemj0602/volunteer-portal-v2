import { TrainingSchedule, TrainingScheduleProps } from "./TrainingSchedule";

export enum RegistrationStatus {
    Scheduled = "Scheduled",
    Cancelled = "Cancelled"
}

export interface TrainingRegistrationProps {
    id: number;
    "status_id:name": RegistrationStatus;
    "contact.email_primary.email": string;
    [key: string]: any;
}

export class TrainingRegistration implements TrainingRegistrationProps {
    public id: number;
    public "status_id:name": RegistrationStatus;
    public "contact.email_primary.email": string;

    // public trainingSchedule: TrainingSchedule;

    [key: string]: any;

    constructor(props: TrainingRegistrationProps) {
        this.id = props.id;
        this["status_id:name"] = props["status_id:name"];
        this["contact.email_primary.email"] = props["contact.email_primary.email"];

        // const trainingScheduleDetails: Partial<TrainingScheduleProps> = {}

        // for (const key in props) {
        //     if (key.startsWith("schedule."))
        //         trainingScheduleDetails[key.split("schedule.")[1]] = props[key];
        //     else if (key.startsWith("training."))
        //         trainingScheduleDetails[key] = props[key];
        // }

        // this.trainingSchedule = new TrainingSchedule(trainingScheduleDetails as TrainingScheduleProps);
    }
}

