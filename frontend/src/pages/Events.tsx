import { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import EventRoleManager from "../../utils/managers/EventRoleManager";
import CustomFieldSetManager, { CustomField, CustomFieldOptions } from "../../utils/managers/CustomFieldSetManager";
import { EventRole } from "../../utils/classes/EventRole";
import config from "../../../config";
import ContactManager from "../../utils/managers/ContactManager";
import { useSearchParams } from "react-router-dom";

export default function Events() {
    const [eventRoles, setEventRoles] = useState<EventRole[]>([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const email = (window as any).email ?? config.email;

    useEffect(() => {
        (async () => {
            const eventDetailCustomFieldSet = await CustomFieldSetManager.get("Volunteer_Event_Role_Details");
            const eventDetailFieldNames: Map<number, string> = new Map([...eventDetailCustomFieldSet.values()]
                .filter(f => f.option_group_id)
                .map(f => [f.option_group_id!, f.name]));

            const contact = await ContactManager.fetch(email);
            const contactDetailCustomFieldSet = await CustomFieldSetManager.get("Volunteer_Contact_Details");
            
            let updateSearchParams = false;
            for (const field of contactDetailCustomFieldSet.values()) {
                // If the field's option group id in the contact is included in the event detail groups
                const eventDetailFieldName = eventDetailFieldNames.get(field.option_group_id!);
                if (eventDetailFieldName) {
                    const value = contact[`Volunteer_Contact_Details.${field.name}`] as any[];
                    if (value.length && !searchParams.get(`Volunteer_Event_Role_Details.${eventDetailFieldName}`)) {
                        updateSearchParams = true;
                        searchParams.set(`Volunteer_Event_Role_Details.${eventDetailFieldName}`, JSON.stringify(value));
                    }
                }
            }
            if (updateSearchParams) setSearchParams(searchParams);

            const eventRoles = await EventRoleManager.fetch();
            // TODO: After updating the search params, I need to have an updateEvents manager which helps me set the event roles on the page

            // I will need to display each eventRole
            console.log(eventRoles);
        })();
    }, []);

    return <Wrapper>
        <h1>Hello World.</h1>
    </Wrapper>
}