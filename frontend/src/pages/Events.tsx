import { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import EventRoleManager from "../../utils/managers/EventRoleManager";
import CustomFieldSetManager from "../../utils/managers/CustomFieldSetManager";
import { EventRole } from "../../utils/classes/EventRole";
import config from "../../../config";
import ContactManager from "../../utils/managers/ContactManager";
import { useSearchParams } from "react-router-dom";
import Loading from "../components/Loading";
import EventRoleCard from "../components/EventRoleCard";

const limit = 9;
export default function Events() {
    const [eventRoles, setEventRoles] = useState<EventRole[] | null>(null);
    const [totalPages, setTotalPages] = useState(1);
    const [searchParams, setSearchParams] = useSearchParams();
    const email = (window as any).email ?? config.email;

    // Initial phase
    // This is responsible for mapping the Cuontact's custom fields that shares the same mapped options as an event role's or the specified event details
    useEffect(() => {
        (async () => {
            const contact = await ContactManager.fetch(email);
            const contactDetailCustomFieldSet = await CustomFieldSetManager.get("Volunteer_Contact_Details");

            const eventRoleCustomFieldSet = await CustomFieldSetManager.get("Volunteer_Event_Role_Details");
            const eventRoleFieldNames = new Map([...eventRoleCustomFieldSet.values()]
                .filter(f => f.option_group_id)
                .map(f => [f.option_group_id!, f.name]));
            const eventDetailCustomFieldSet = await CustomFieldSetManager.get("Volunteer_Event_Details");
            const eventDetailFieldNames = new Map([...eventDetailCustomFieldSet.values()]
                .filter(f => f.option_group_id)
                .map(f => [f.option_group_id!, f.name]));
            
            let updateSearchParams = false;
            contactDetailCustomFieldSet.forEach(field => {
                const roleFieldName = eventRoleFieldNames.get(field.option_group_id!);
                if (roleFieldName) {
                    const value = contact[`Volunteer_Contact_Details.${field.name}`] as any[];
                    if (value?.length && !searchParams.get(`Volunteer_Event_Role_Details.${roleFieldName}`)) {
                        updateSearchParams = true;
                        searchParams.set(`Volunteer_Event_Role_Details.${roleFieldName}`, JSON.stringify(value));
                    }
                }
                const detailFieldName = eventDetailFieldNames.get(field.option_group_id!);
                if (detailFieldName) {
                    const value = contact[`Volunteer_Contact_Details.${field.name}`] as any[];
                    if (value?.length && !searchParams.get(`Volunteer_Contact_Details.${detailFieldName}`)) {
                        updateSearchParams = true;
                        searchParams.set(`Volunteer_Event_Details.${detailFieldName}`, JSON.stringify(value));
                    }
                }
            })
            if (updateSearchParams) setSearchParams(searchParams);
        })();
    }, []);

    // This updates the event roles whenever the search params changes
    useEffect(() => {
        updateEvents();
    }, [searchParams]);
    
    const updateEvents = async () => {
        console.log("hi");
        setEventRoles(null);

        // This is converting URLSearchParams to a readable object
        const customFields: { [key: string]: any } = {};
        searchParams.forEach((v, k) => customFields[k] = v);

        // Fetching the total number of event role documents that matches the where query
        const total = (await EventRoleManager.fetch({
            ...customFields,
            search: searchParams.get("search"),
            startDate: searchParams.get("startDate"),
            endDate: searchParams.get("endDate"),
            select: ["id"]
        })).length;
        
        // Get the total number of pages based on the total documents / limit
        const pages = Math.round(total / limit);
        setTotalPages(pages);
        // Handle page number is valid
        let page = parseInt(searchParams.get("page") ?? "1");
        if (isNaN(page)) page = 1;
        if (page > totalPages) page = totalPages;
        if (page < 1) page = 1;

        // Get event roles for the specific page and where query
        const eventRoles = await EventRoleManager.fetch({
            ...customFields,
            search: searchParams.get("search"),
            startDate: searchParams.get("startDate"),
            endDate: searchParams.get("endDate"),
            page, limit,
        });

        console.log(eventRoles);
        setEventRoles(eventRoles as EventRole[]);
    }

    return <Wrapper>
        <div className="p-4 mb-12">
            <div className="max-w-[1400px] px-0 md:px-6">
                {!eventRoles ? <Loading className="items-center h-full mt-20" /> : <>
                    {!eventRoles.length && <p className="text-lg text-gray-500">Looks like there aren't any events</p>}
                    {eventRoles.length && <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
                        {eventRoles.map(eventRole => <EventRoleCard className="flex justify-center" eventRole={eventRole} />)}
                    </div>}
                </>}
            </div>
        </div>
    </Wrapper>
}