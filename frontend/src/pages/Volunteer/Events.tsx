import { KeyboardEvent, useEffect, useState } from "react";
import Loading from "../../components/Loading";
import Wrapper from "../../components/Wrapper";
import { createSearchParams, useSearchParams } from "react-router-dom";
import { EventRole } from "../../../utils/classes/EventRole";
import CustomFieldSetManager, { CustomField, CustomFieldOptions } from "../../../utils/managers/CustomFieldSetManager";
import ContactManager from "../../../utils/managers/ContactManager";
import DropdownButton from "../../components/DropdownButton";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ComparisonOperator } from "../../../utils/crm";
import moment from "moment";
import EventRoleManager from "../../../utils/managers/EventRoleManager";
import EventCard from "../../components/Card/EventCard";

const limit = 9;
export default function Events() {
    const [eventRoles, setEventRoles] = useState<EventRole[]>();
    const [totalPages, setTotalPages] = useState(1);
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();
    const [search, setSearch] = useState("");
    const [searchQuery, setSearchQuery] = useState<string>();
    const [searchParams, setSearchParams] = useSearchParams();
    const [customFields, setCustomFields] = useState<Map<string, CustomField>>();
    const email = (window as any).email;

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

    // The point of this effect is to update the page each time any of the provide arrays are updated
    // This includes the searchparams, the start date, and the end date
    useEffect(() => {
        updateEvents();
    }, [searchParams, searchQuery, startDate, endDate]);

    // Updating the events
    const updateEvents = async () => {
        setEventRoles(undefined);

        const where: [string, ComparisonOperator, any][] = [
            // Show all registrations that is still within the registration end date
            ["Volunteer_Event_Role_Details.Registration_Start_Date", "<=", moment(new Date()).format("YYYY-MM-DD HH:mm:ss")],
            ["Volunteer_Event_Role_Details.Registration_End_Date", ">=", moment(new Date()).format("YYYY-MM-DD HH:mm:ss")]
        ];
        // Getting any events where the subject includes the search query
        if (searchQuery) where.push(["event.subject", "CONTAINS", searchQuery]);
        // Filter for any events that may starthh after the provided start date or today
        where.push(["activity_date_time", ">=", moment(startDate ?? new Date()).format("YYYY-MM-DD HH:mm:ss")]);
        // If there is an end date filter, filter for events that may start before or during the provided end date
        if (endDate) where.push(["activity_date_time", "<=", moment(endDate).format("YYYY-MM-DD 23:59:59")]);

        // For each searchparam's custom fields
        searchParams.forEach((value, key) => {
            // So long as it doesn't include undefined, add it to the where
            if (!key.includes("undefined") && key.startsWith("Volunteer")) where.push([key.startsWith("Volunteer_Event_Details") ? `event.${key}` : key, "IN", JSON.parse(value ?? "[]")]);
        });

        // #region Getting the total number of documents
        const total = (await EventRoleManager.fetch({ where, select: ["id"], group: ["Volunteer_Event_Role_Details.Event", "Volunteer_Event_Role_Details.Role"] })).length;
        const pages = Math.ceil(total / limit);
        setTotalPages(pages);
        // #endregion

        // Handle page number is valid
        let page = parseInt(searchParams.get("page") ?? "1");
        if (isNaN(page)) page = 1;
        if (page > totalPages) page = totalPages;
        if (page < 1) page = 1;

        const eventRoles = await EventRoleManager.fetch({ 
            where, page, limit, 
            group: ["Volunteer_Event_Role_Details.Event", "Volunteer_Event_Role_Details.Role"],
            order: [["activity_date_time", "ASC"]] 
        });

        setEventRoles(eventRoles as EventRole[]);
    }

    // On search key function
    const onSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key == "Enter") {
            setSearchQuery(search.length ? search : undefined);
            setSearch("");
        }
    }

    // Clear filters
    const clearFilters = () => {
        setSearchParams(createSearchParams());
        setStartDate(undefined);
        setEndDate(undefined);
        setSearch("");
        setSearchQuery(undefined);
    }

    // Checkbox update sleection
    const updateSelection = (selection: string, option: CustomFieldOptions) => {
        const selected: string[] = JSON.parse(searchParams.get(selection) ?? "[]").map((v: any) => `${v}`);
        if (!selected.includes(option.value)) selected.push(option.value);
        else selected.splice(selected.indexOf(option.value), 1);

        if (!selected.length) searchParams.delete(selection);
        else searchParams.set(selection, JSON.stringify(selected));

        searchParams.set("page", "1");
        setSearchParams(searchParams);
    }

    return <Wrapper>
        {!customFields ? <Loading className="h-screen items-center" /> : <div className="p-4 mb-12">
            <div className="max-w-[1600px] px:0 md:px-6">
                <div className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-center gap-y-3 lg:gap-x-6">
                        {/* Search */}
                        <div className="relative flex items-center">
                            <input type="text" placeholder="Search" className="py-2 px-4 pr-12 rounded-lg w-full outline-none" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={onSearchKeyDown} />
                        </div>
                        <div className="col-span-2 flex flex-col md:grid md:grid-cols-2 lg:flex lg:flex-row justify-between lg:justify-normal gap-3">
                            {/* Date and Time */}
                            <DropdownButton label="Date">
                                <div className="absolute bg-white shadow-md rounded-md w-max min-w-full mt-2 p-4 z-20">
                                    <div className="flex flex-col md:flex-row gap-3 gap-x-4">
                                        <div>
                                            <label htmlFor="date" className="text-sm text-gray-600">Starting Date</label>
                                            <div className="flex flex-row items-center text-gray-600">
                                                <ReactDatePicker
                                                    id="date"
                                                    minDate={new Date()}
                                                    maxDate={endDate}
                                                    selected={startDate}
                                                    onChange={d => setStartDate(d ?? undefined)}
                                                    dateFormat="d MMMM, yyyy"
                                                    className="mt-1 block px-4 py-2 border border-gray-300 bg-gray-100 rounded-md shadow-sm focus:outline-none sm:text-sm w-[160px] text-center text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="endDate" className="text-sm text-gray-600">Ending Date</label>
                                            <div className="flex flex-row items-center text-gray-600">
                                                <ReactDatePicker
                                                    id="endDate"
                                                    minDate={startDate ?? new Date()}
                                                    selected={endDate}
                                                    onChange={d => setEndDate(d ?? undefined)}
                                                    dateFormat="d MMMM, yyyy"
                                                    className="mt-1 block px-4 py-2 border border-gray-300 bg-gray-100 rounded-md shadow-sm focus:outline-none sm:text-sm w-[160px] text-center text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Clearing start date and end date filters */}
                                    {(startDate || endDate) && <button className="text-sm text-secondary mt-3" onClick={() => { setStartDate(undefined); setEndDate(undefined); }}>Clear Date Filters </button>}

                                </div>
                            </DropdownButton>
                            {Array.from(customFields.keys()).map((key, i) => {
                                const field = customFields.get(key);
                                return !(!field) && <DropdownButton label={field.label}>
                                    <div className={`absolute bg-white shadow-md rounded-md w-full min-w-[200px] mt-2 z-20 ${i == customFields.size - 1 ? "right-0" : "left-0"}`}>
                                        {field.options!.map(opt => <div className="in-line px-4 py-2 items-center gap-x-3 cursor-pointer hover:bg-gray-100" onClick={() => updateSelection(key, opt)}>
                                            <input type="checkbox" id={`${opt.option_group_id}-${opt.name}`} className="pointer-events-none" checked={JSON.parse(searchParams.get(key) ?? "[]").includes(opt.value)} />
                                            <label htmlFor={`${opt.option_group_id}-${opt.name}`} className="text-sm w-full text-gray-600 ml-4 cursor-pointer pointer-events-none">{opt.label}</label>
                                        </div>)}
                                    </div>
                                </DropdownButton>
                            })}
                        </div>
                    </div>
                    {/* Clearing filters if there are any */}
                    {Array.from(searchParams.keys()).filter(s => s != "page").length > 0 && <button onClick={clearFilters} className="text-sm text-secondary text-left mt-2">Clear Filters</button>}
                </div>
                {/* Cards */}
                {!eventRoles ? <Loading className="items-center h-full mt-20" /> : <div className="flex flex-col justify-between h-full">
                    {/* Search query results */}
                    {searchQuery && <h1 className="text-xl font-semibold text-gray-600">Results for: {searchQuery}</h1>}
                    {/* No events */}
                    {!eventRoles.length && <p className="text-lg text-gray-500">Looks like there aren't any events{[...searchParams.entries()].length ? " with the provided filters" : ""}.</p>}
                    {/* If there are events, show them in cards */}
                    {eventRoles.length > 0 && <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 mt-6">
                        {eventRoles.map(eventRole => <EventCard className="flex justify-center" event={eventRole.event} roleId={eventRole["Volunteer_Event_Role_Details.Role"]?.toString()!} roleLabel={eventRole["Volunteer_Event_Role_Details.Role:label"]!}  />)}
                    </div>}
                    {/* Pagination */}
                    {totalPages > 1 && <div className="mt-8 items-center justify-center text-center w-full">
                        {Array.from({ length: totalPages }).map((_, n) => <button onClick={() => {
                            searchParams.set("page", `${n + 1}`);
                            setSearchParams(searchParams);
                        }} className="px-3 py-1 rounded-md hover:bg-secondary hover:text-white mx-1 font-semibold text-gray-600">{n + 1}</button>)}
                    </div>}
                </div>}
            </div>
        </div>}
    </Wrapper>
}