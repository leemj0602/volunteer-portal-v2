import { EventRegistration, EventRegistrationProps } from "../classes/EventRegistration";
import CRM, { ComparisonOperator } from "../crm";

const EventRegistrationManager = new class EventRegistrationManager {
    async fetch(options?: { contactId?: number, eventRoleId?: number }) {
        const where: [string, ComparisonOperator, any][] = [["activity_type_id:name", "=", "Volunteer Event Registration"]];
        if (options?.contactId) where.push(["contact.id", "=", options.contactId]);
        if (options?.eventRoleId) where.push(["Volunteer_Event_Registration_Details.Event_Role", "=", options.eventRoleId]);

        const response = await CRM("Activity", "get", {
            select: [
                "contact.email_primary.email",
                "status_id:name",
                "eventRole.id",
                "eventRole.activity_date_time",
                "eventRole.duration",
                "eventRole.Volunteer_Event_Role_Details.*",
                "eventRole.Volunteer_Event_Role_Details.Role:label",

                "event.*",
                "event.status_id:name",
                "event.Volunteer_Event_Details.*",

                "attendance.id",
                "attendance.duration"
            ],
            join: [
                ["Contact AS contact", "LEFT", ["target_contact_id", "=", "contact.id"]],
                ["Activity AS eventRole", "LEFT", ["Volunteer_Event_Registration_Details.Event_Role", "=", "eventRole.id"]],
                ["Activity AS event", "LEFT", ["eventRole.Volunteer_Event_Role_Details.Event", "=", "event.id"]],
                ["Activity AS attendance", "LEFT", 
                    ["attendance.Volunteer_Event_Attendance_Details.Event_Role", "=", "eventRole.id"],
                    ["attendance.target_contact_id", "=", "contact.id"]
                ]
            ],
            where
        });

        return (response?.data as EventRegistrationProps[]).map(d => new EventRegistration(d));
    }
}

export default EventRegistrationManager;