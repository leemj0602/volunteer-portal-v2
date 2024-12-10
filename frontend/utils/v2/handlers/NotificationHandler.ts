import CRM from "../../crm";
import { Notification } from "../entities/Notification";

class NotificationHandler {
    private entity: string = "Activity";

    /** Get all notifications belonging to this email */
    async fetch(options?: { contactId?: number }): Promise<Notification[]> {
        const response = await CRM(this.entity, "get", {
            select: [
                'activity_date_time',
                'subject',
                'details',

                'registration.id',
                'registration.activity_date_time',
                'registration.activity_type_id:name',

                'eventRole.id',
                'eventRole.activity_date_time',
                'eventRole.Volunteer_Event_Role_Details.Role',
                'eventRole.Volunteer_Event_Role_Details.Role:label',
                'eventRole.Volunteer_Event_Role_Details.Event.id',
                'eventRole.Volunteer_Event_Role_Details.Event.location',
                'eventRole.Volunteer_Event_Role_Details.Event.subject',

                'trainingSchedule.id',
                'trainingSchedule.activity_date_time',
                'trainingSchedule.location',
                'trainingSchedule.Volunteer_Training_Schedule_Details.Training.id',
                'trainingSchedule.Volunteer_Training_Schedule_Details.Training.subject',
            ],
            join: [
                ['Activity AS registration', 'LEFT', ['source_record_id', '=', 'registration.id']],
                ['Activity AS eventRole', 'LEFT', ['registration.Volunteer_Event_Registration_Details.Event_Role', '=', 'eventRole.id']],
                ['Activity AS event', 'LEFT', ['eventRole.Volunteer_Event_Role_Details.Event', '=', 'event.id']],
                ['Activity AS trainingSchedule', 'LEFT', ['registration.Volunteer_Training_Registration_Details.Training_Schedule', '=', 'trainingSchedule.id']],
                ['Activity AS training', 'LEFT', ['trainingSchedule.Volunteer_Training_Schedule_Details.Training', '=', 'training.id']],
            ],
            where: [
                ['activity_type_id:name', '=', 'Reminder Sent'],
                ["target_contact_id", "=", options?.contactId],
            ],
            order: [
                ['registration.activity_date_time', 'DESC'],
            ]
        }).catch(console.log);

        if (!response) return [];
        return response.data.map((d: any) => new Notification(d));
    }
}

export default new NotificationHandler;