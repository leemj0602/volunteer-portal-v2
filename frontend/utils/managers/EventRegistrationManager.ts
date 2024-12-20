import { EventRegistration, EventRegistrationProps } from "../classes/EventRegistration";
import CRM, { ComparisonOperator } from "../crm";
import moment from "moment";

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
                "eventRole.status_id:name",
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

        return ((response?.data ?? []) as EventRegistrationProps[]).map(d => new EventRegistration(d));
    }

    async fetchById(id: string) {
        const response = await CRM("Activity", "get", {
            select: [
                "contact.id",
                "contact.first_name",
                "contact.last_name",
                "contact.email_primary.email",
                "status_id:name",
                "eventRole.id",
                "eventRole.activity_date_time",
                "eventRole.duration",
                "eventRole.status_id:name",
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
            limit: 1,
            where: [["id", "=", id]]
        });

        if (!response?.data.length) return null;
        return new EventRegistration(response.data[0]);
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

    async checkAttendanceCode(eventId: number, attendanceCode: string) {
        const check = await CRM('Activity', 'get', {
            select: [
                'subject',
            ],
            where: [
                ['id', '=', eventId],
                ['Volunteer_Event_Details.Attendance_Code', '=', attendanceCode]
            ],
        });

        return check?.data;
    }

    async checkAttendance(contactId: number, eventRoleId: number) {
        const response = await CRM('Activity', 'get', {
            'where': [
                ['activity_type_id:name', '=', "Volunteer Event Attendance"],
                ['Volunteer_Event_Attendance_Details.Event_Role', '=', eventRoleId],
                ['target_contact_id', '=', contactId],
            ]
        });

        return (response?.data.length > 0);
    }

    async createAttendance(contactId: number, eventRoleId: number, duration: number) {
        const currentDateTime = moment(new Date).format("YYYY-MM-DD HH:mm:ss");

        const response = await CRM("Activity", "create", {
            values: [
                ["activity_type_id:name", "Volunteer Event Attendance"],
                ["target_contact_id", [contactId]],
                ["source_contact_id", contactId],
                ["duration", duration],
                ["Volunteer_Event_Attendance_Details.Event_Role", eventRoleId],
                ["activity_date_time", currentDateTime],
            ]
        });

        if (response?.data.length > 0) return response?.data[0].activity_date_time;
    }

    // async createAttendance(targetContactId: number, sourceContactId: number, eventRoleId: number, duration: number) {
    //     const response = await CRM("Activity", "create", {
    //         values: [
    //             ["activity_type_id:name", "Volunteer Event Attendance"],
    //             ["target_contact_id", [targetContactId]],
    //             ["source_contact_id", sourceContactId],
    //             ["duration", duration],
    //             ["Volunteer_Event_Attendance_Details.Event_Role", eventRoleId],
    //         ]
    //     });

    //     return response?.data.length > 0;
    // }

}

export default EventRegistrationManager;