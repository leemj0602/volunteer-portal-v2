import { KeyboardEvent, useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import EventRoleManager from "../../utils/managers/EventRoleManager";
import CustomFieldSetManager, { CustomField, CustomFieldOptions } from "../../utils/managers/CustomFieldSetManager";
import { EventRole } from "../../utils/classes/EventRole";
import config from "../../../config";
import ContactManager from "../../utils/managers/ContactManager";
import { createSearchParams, useSearchParams } from "react-router-dom";
import Loading from "../components/Loading";
import EventRoleCard from "../components/Card/EventRoleCard";
import DropdownButton from "../components/DropdownButton";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ComparisonOperator } from "../../utils/crm";
import moment from "moment";

const limit = 9;
export default function Events() {
    const [eventRoles, setEventRoles] = useState<EventRole[] | null>(null);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [searchParams, setSearchParams] = useSearchParams();
    const [customFields, setCustomFields] = useState<Map<string, CustomField>>();
    const email = (window as any).email ?? config.email;

    // Initial phase
    // This is responsible for mapping the Cuontact's custom fields that shares the same mapped options as an event role's or the specified event details
    useEffect(() => {
        (async () => {
            const contact = await ContactManager.fetch(email);
            const contactDetailCustomFieldSet = await CustomFieldSetManager.get("Volunteer_Contact_Details");

            // const eventRoleCustomFieldSet = await CustomFieldSetManager.get("Volunteer_Event_Role_Details");
            // const eventRoleFieldNames = new Map([...eventRoleCustomFieldSet.values()]
            //     .filter(f => f.option_group_id)
            //     .map(f => [f.option_group_id!, f.name]));
            const eventDetailCustomFieldSet = await CustomFieldSetManager.get("Volunteer_Event_Details");
            const eventDetailFieldNames = new Map([...eventDetailCustomFieldSet.values()]
                .filter(f => f.option_group_id)
                .map(f => [f.option_group_id!, f.name]));

            const filters = new Map<string, CustomField>();
            // eventRoleFieldNames.forEach(name => {
            //     filters.set(`Volunteer_Event_Role_Details.${name}`, eventRoleCustomFieldSet.get(`Volunteer_Event_Role_Details.${name}`)!)
            // });
            eventDetailFieldNames.forEach(name => {
                filters.set(`Volunteer_Event_Details.${name}`, eventDetailCustomFieldSet.get(`Volunteer_Event_Details.${name}`)!)
            });

            let updateSearchParams = false;
            contactDetailCustomFieldSet.forEach(field => {
                // If the option group id of the role field is used in the contact custom field set
                // const roleFieldName = eventRoleFieldNames.get(field.option_group_id!);
                // if (roleFieldName) {
                //     // If there isn't already a search query, or if there's a value and the specified query has no value
                //     const value = contact[`Volunteer_Contact_Details.${field.name}`] as any[];
                //     if (value.length && (!searchParams.size || !searchParams.get(`Volunteer_Event_Role_Details.${roleFieldName}`)) && roleFieldName) {
                //         updateSearchParams = true;
                //         searchParams.set(`Volunteer_Event_Role_Details.${roleFieldName}`, JSON.stringify(value));
                //     }
                // }
                // If the option group id of the event details field is used in the contact custom fiel dset
                const detailFieldName = eventDetailFieldNames.get(field.option_group_id!);
                if (!searchParams.size || detailFieldName) {
                    // If there isn't alreayd a search query, or if there's a value and the specific query has no value
                    const value = contact[`Volunteer_Contact_Details.${field.name}`] as any[];
                    if (value?.length && !searchParams.get(`Volunteer_Contact_Details.${detailFieldName}`) && detailFieldName) {
                        updateSearchParams = true;
                        searchParams.set(`Volunteer_Event_Details.${detailFieldName}`, JSON.stringify(value));
                    }
                }
            });
            if (updateSearchParams) setSearchParams(searchParams);
            setCustomFields(filters);
        })();
    }, []);

    // This updates the event roles whenever the search params changes
    useEffect(() => {
        updateEvents();
    }, [searchParams]);

    const updateEvents = async () => {
        setEventRoles(null);

        // This is converting URLSearchParams to a readable object
        const customFields: { [key: string]: any } = {};
        searchParams.forEach((v, k) => customFields[k] = v);

        // Fetching the total number of event role documents that matches the where query
        const where: [string, ComparisonOperator, any][] = [];
        if (searchParams.get("search")) where.push(["event.subject", "CONTAINS", searchParams.get("search")]);
        if (searchParams.get("startDate")) where.push(["activity_date_time", ">=", moment(JSON.parse(searchParams.get("startDate")!)).format("YYYY-MM-DD 00:00:00")]);
        else where.push(["activity_date_time", ">=", moment(new Date()).format("YYYY-MM-DD 00:00:00")]);
        if (searchParams.get("endDate")) where.push(["activity_date_time", "<=", moment(JSON.parse(searchParams.get("endDate")!)).format("YYYY-MM-DD 23:59:59")]);

        for (const key in customFields) {
            if (!key.includes("undefined")){
                if (key.startsWith("Volunteer_Event_Details")) where.push([`event.${key}`, "IN", JSON.parse(customFields[key] ?? "[]")]);
                else if (key.startsWith("Volunteer_Event_Role_Details")) where.push([key, "IN", JSON.parse(customFields[key] ?? "[]")]);    
            }
        }

        const total = (await EventRoleManager.fetch({ where, select: ["id"] })).length;

        // Get the total number of pages based on the total documents / limit
        const pages = Math.round(total / limit);
        setTotalPages(pages);
        // Handle page number is valid
        let page = parseInt(searchParams.get("page") ?? "1");
        if (isNaN(page)) page = 1;
        if (page > totalPages) page = totalPages;
        if (page < 1) page = 1;

        // Get event roles for the specific page and where query
        const eventRoles = await EventRoleManager.fetch({ where, page, limit });

        setEventRoles(eventRoles as EventRole[]);
    }

    // Updating params
    const updateParams = (key: string, value: string) => {
        searchParams.set(key, value);
        setSearchParams(searchParams);
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


    // Clear filters
    const clearFilters = (keys?: string[]) => {
        if (keys?.length) {
            for (const key of keys) searchParams.delete(key);
            setSearchParams(searchParams);
        }
        else setSearchParams(createSearchParams());
    }

    // On search key down function
    const onSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key == "Enter") {
            setSearch("");
            if (search.length) searchParams.set("search", search);
            else searchParams.delete("search");
            setSearchParams(searchParams);
        }
    }

    return <Wrapper>
        {!customFields ? <Loading className="h-screen items-center" /> : <div className="p-4 mb-12">
            <div className="max-w-[1400px] px-0 md:px-6">
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
                                                    selected={searchParams.get("startDate") ? new Date(JSON.parse(searchParams.get("startDate") as string)) : undefined}
                                                    onChange={d => updateParams("startDate", JSON.stringify(d))}
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
                                                    selected={searchParams.get("endDate") ? new Date(JSON.parse(searchParams.get("endDate") as string)) : undefined}
                                                    onChange={d => updateParams("endDate", JSON.stringify(d))}
                                                    dateFormat="d MMMM, yyyy"
                                                    className="mt-1 block px-4 py-2 border border-gray-300 bg-gray-100 rounded-md shadow-sm focus:outline-none sm:text-sm w-[160px] text-center text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {(searchParams.has("date") || searchParams.has("endDate")) &&
                                        <button className="text-sm text-secondary mt-3" onClick={() => clearFilters(["startDate", "endDate"])}>Clear Date Filters </button>}

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
                    {Array.from(searchParams.keys()).filter(s => s != "page").length > 0 &&
                        <button onClick={() => clearFilters()} className="text-sm text-secondary text-left mt-2">Clear Filters</button>}
                </div>
                {/* Event role cards */}
                {!eventRoles ? <Loading className="items-center h-full mt-20" /> : <div className="flex flex-col justify-between h-full">
                    {/* Search results */}
                    {searchParams.get("search") && <h1 className="text-xl font-semibold text-gray-600">Results for: {searchParams.get("search")}</h1>}
                    {/* No events */}
                    {!eventRoles.length && <p className="text-lg text-gray-500">Looks like there aren't any events{[...searchParams.entries()].length ? " with the provided filters" : ""}.</p>}
                    {/* If there are events, display */}
                    {eventRoles.length > 0 && <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 mt-6">
                        {eventRoles.map(eventRole => <EventRoleCard className="flex justify-center" eventRole={eventRole} />)}
                    </div>}
                    {/* If there is more than 1 page */}
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