import { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import Wrapper from "../../components/Wrapper";
import { useSearchParams } from "react-router-dom";
import { EventRole } from "../../../utils/classes/EventRole";
import CustomFieldSetManager, { CustomField } from "../../../utils/managers/CustomFieldSetManager";
import config from "../../../../config";
import ContactManager from "../../../utils/managers/ContactManager";

export default function Events() {
    const [eventRoles, setEventRoles] = useState<EventRole[]>();
    const [totalPages, setTotalPages] = useState(1);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState();
    const [search, setSearch] = useState("");
    const [searchParams, setSearchParams] = useSearchParams();
    const [customFields, setCustomFields] = useState<Map<string, CustomField>>();
    const email = (window as any).email ?? config.email;

    // #region Apply profile filters on page load
    useEffect(() => {
        (async () => {
            // Getting the contact
            const contact = await ContactManager.fetch(email);
            // #region Custom field sets
            // Volunteer_Contact_Details Custom Field Set
            const contactCustomSet = await CustomFieldSetManager.get("Volunteer_Contact_Details");
            // Voulnteer_Event_Role_Details Custom Field Set
            const eventRoleCustomSet = await CustomFieldSetManager.get("Volunteer_Event_Role_Details");
            // Volunteer_Event_Details Custom Field Set
            const eventCustomSet = await CustomFieldSetManager.get("Volunteer_Event_Details");
            // #endregion

            // Getting the field's name and option_group_id for Volunteer_Event_Role_Details
            const eventRoleFields = new Map([...eventRoleCustomSet.values()].filter(f => f.option_group_id).map(f => [f.option_group_id!, f.name]))
            // Getting the field's name and option_group_id for Volunteer_event_Details
            const eventFields = new Map([...eventCustomSet.values()].filter(f => f.option_group_id).map(f => [f.option_group_id!, f.name]));

            const filters = new Map<string, CustomField>();
            // Foreach fields for both sets, add it to the filter
            eventRoleFields.forEach(name => filters.set(`Volunteer_Event_Role_Details.${name}`, eventRoleCustomSet.get(`Volunteer_Event_Role_Details.${name}`)!))
           eventFields.forEach(name => filters.set(`Volunteer_Event_Details.${name}`, eventCustomSet.get(`Volunteer_Event_Details.${name}`)!));

            // Iterating through the contact's custom fields
            let updated = false;
            contactCustomSet.forEach(field => {
                let name = eventRoleFields.get(field.option_group_id!);
                if (name) {
                    const value = contact[`Volunteer_Contact_Details.${field.name}`] as any;
                    if (value?.length && name && !searchParams.get(`Volunteer_Event_Role_Details.${name}`)) {
                        updated = true;
                        searchParams.set(`Volunteer_Event_Role_Details.${name}`, JSON.stringify(value));
                    }
                }
                else {
                    name = eventFields.get(field.option_group_id!);
                    if (name) {
                        const value = contact[`Volunteer_Contact_Details.${field.name}`] as any;
                        if (value?.length && name && !searchParams.get(`Volunteer_Event_Details.${name}`)) {
                            updated = true;
                            searchParams.set(`Volunteer_Event_Details.${name}`, JSON.stringify(value));
                        }
                    }
                }
            });
            if (updated) setSearchParams(searchParams);
            setCustomFields(filters);
        })();
    }, []);
    // #endregion

    return <Wrapper>
        {!customFields ? <Loading className="h-screen items-center" /> : <div className="p-4 mb-12"></div>}
    </Wrapper>
}