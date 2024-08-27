import { TrainingRegistration, TrainingRegistrationProps } from "../classes/TrainingRegistration";
import CRM, { ComparisonOperator } from "../crm";

const TrainingRegistrationManager = new class TrainingRegistrationManager {
    async fetch(options?: { contactId?: number, scheduleId?: number }) {
        const where: [string, ComparisonOperator, any][] = [["activity_type_id:name", "=", "Volunteer Training Registration"]];
        if (options?.contactId) where.push(["contact.id", "=", options.contactId]);
        if (options?.scheduleId) where.push(["Volunteer_Training_Registration_Details.Training_Schedule", "=", options.scheduleId]);

        const response = await CRM('Activity', 'get', {
            select: [
                'status_id:name',

                'contact.email_primary.email',

                'schedule.id',
                'schedule.activity_date_time',
                'schedule.status_id:name',
                'schedule.location',
                'schedule.Volunteer_Training_Schedule_Details.Vacancy',
                'schedule.Volunteer_Training_Schedule_Details.Registration_Start_Date',
                'schedule.Volunteer_Training_Schedule_Details.Registration_End_Date',
                'schedule.Volunteer_Training_Schedule_Details.Expiration_Date',

                'training.id',
                'training.subject',
                'training.status_id:name',
            ],
            where,
            join: [
                ['Contact AS contact', 'LEFT', ['target_contact_id', '=', 'contact.id']],
                ['Activity AS schedule', 'LEFT', ['Volunteer_Training_Registration_Details.Training_Schedule', '=', 'schedule.id']],
                ['Activity AS training', 'LEFT', ['schedule.Volunteer_Training_Schedule_Details.Training', '=', 'training.id']],
            ],
        })

        return (response?.data as TrainingRegistrationProps[]).map(d => new TrainingRegistration(d));
    }

    async cancelEvent(registrationActivityId: number) {
        const cancel = await CRM("Activity", 'update', {
            values: [
                ['status_id:name', 'Cancelled'],
            ],
            where: [
                ['id', '=', registrationActivityId],
            ]
        });

        return cancel?.data.length > 0;
    }

}

export default TrainingRegistrationManager;