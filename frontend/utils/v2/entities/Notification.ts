import Entity from "./Entity";

export class Notification extends Entity {
    data: {
        id?: number;
        subject?: string;
        details?: string;
        registration?: {
            id?: number;
            "activity_type_id:name"?: string;
        }
        eventRole?: {
            id?: number;
            Volunteer_Event_Role_Details?: {
                Role?: string;
                "Role:label"?: string;
                Event?: {
                    id?: number;
                    subject?: string
                }
            }

        }
        trainingSchedule?: {
            id: number;
            Volunteer_Training_Schedule_Details?: {
                Training?: {
                    id?: number;
                    subject?: string;
                };
            }
        }
        training?: {
            id: number;
            subject: string;
        }
    } = {}

    constructor(data: Record<string, any>) {
        super(data);
        for (const key in data)
            this.setNestedValue(this.data, key, data[key]);
    }
}