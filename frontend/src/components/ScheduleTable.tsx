import React, { useState, MouseEvent, useEffect } from "react";
import moment from "moment";
import { Spinner } from "flowbite-react";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/solid";

interface Schedule {
    id: number;
    startDate: string;
    endDate: moment.Moment | string;
    participants: string;
    registrationEndDate: string;
    registerStatus: string;
    disabled: boolean;
    onClick: (e: MouseEvent<HTMLButtonElement>) => void;
    location: string;
    validThrough: string;
}

interface ScheduleTableProps {
    schedules: Schedule[];
    type: "Training" | "Event";
    isLoading: boolean;
}

export default function ScheduleTable({ schedules, type, isLoading }: ScheduleTableProps) {
    const [expandedRowIds, setExpandedRowIds] = useState<Set<number>>(new Set());

    const statusStyles: { [key: string]: string } = {
        "Register": "bg-green-500 text-white",
        "Registering": "bg-green-500 text-white cursor-not-allowed",
        "Registered": "bg-blue-500 text-white cursor-not-allowed",
        "Pending": "bg-amber-500 text-white cursor-not-allowed",
        "Closed": "bg-gray-300 text-gray-800 cursor-not-allowed",
        "Full": "bg-gray-300 text-gray-800 cursor-not-allowed",
    };

    const toggleRowExpansion = (id: number) => {
        setExpandedRowIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const renderSchedulesTable = () => {
        if (schedules.length === 0) {
            return (
                <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        No schedules available
                    </td>
                </tr>
            );
        }

        return (
            <tbody className="bg-white divide-y divide-gray-200">
                {schedules.map((schedule, index) => {
                    const isExpanded = expandedRowIds.has(schedule.id);
                    return (
                        <React.Fragment key={index}>
                            <tr
                                className="hover:bg-gray-100 transition ease-in-out cursor-pointer"
                                onClick={() => toggleRowExpansion(schedule.id)}
                            >
                                <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-800">
                                    {moment(schedule.startDate).format('D MMM YYYY, LT')} - {moment(schedule.endDate).format(moment(schedule.startDate).format('D MMM') === moment(schedule.endDate).format('D MMM') ? 'LT' : 'D MMM YYYY, LT')}
                                </td>

                                <td className="hidden md:table-cell px-2 py-3 whitespace-nowrap text-sm text-gray-800">
                                    {schedule.participants}
                                </td>

                                <td className="hidden lg:table-cell px-2 py-3 whitespace-nowrap text-sm text-gray-800">
                                    {schedule.registrationEndDate === "N/A" ? moment(schedule.startDate).format('D MMM YYYY, LT') : moment(schedule.registrationEndDate).format('D MMM YYYY, LT')}
                                </td>

                                <td className="px-2 py-3 whitespace-nowrap">
                                    <button
                                        disabled={schedule.disabled}
                                        className={`w-[150px] px-2 py-2 rounded font-semibold flex items-center justify-center ${statusStyles[schedule.registerStatus]}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            schedule.onClick(e)
                                        }}
                                    >
                                        {schedule.registerStatus}
                                    </button>
                                </td>

                                <td className="px-2 py-3 whitespace-nowrap">
                                    {isExpanded ? (
                                        <ChevronUpIcon className="w-5 h-5 text-gray-800" />
                                    ) : (
                                        <ChevronDownIcon className="w-5 h-5 text-gray-800" />
                                    )}
                                </td>
                            </tr>

                            {isExpanded && (
                                <tr>
                                    <td colSpan={5} className="px-2 py-4 bg-gray-50 text-sm text-gray-700">
                                        <div><strong>Location:</strong> {schedule.location}</div>
                                        {schedule.validThrough ? <div><strong>Valid Through:</strong> {schedule.validThrough}</div> : null}

                                        <div className="lg:hidden">
                                            <div><strong>Registration End:</strong> <br />{moment(schedule.registrationEndDate).format('D MMM YYYY, LT')}</div>
                                        </div>
                                        <div className="md:hidden">
                                            <div><strong>Participants:</strong> <br />{schedule.participants}</div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    );
                })}
            </tbody>
        );
    };

    return (
        <div>
            <h3 className="text-xl text-black/90 font-semibold">{type === "Training" ? "Training" : "Event"} Schedule</h3>
            <br />
            <div className="overflow-x-auto w-full">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-2 py-3 text-left text-sm font-medium text-black-500 uppercase tracking-wider"><strong>{type === "Training" ? "Training" : "Event"} Date</strong></th>
                            <th className="hidden md:table-cell px-2 py-3 text-left text-sm font-medium text-black-500 uppercase tracking-wider"><strong>Participants</strong></th>
                            <th className="hidden lg:table-cell px-2 py-3 text-left text-sm font-medium text-black-500 uppercase tracking-wider"><strong>Registration End</strong></th>
                            <th className="px-2 py-3 text-left text-sm font-medium text-black-500 uppercase tracking-wider"><strong>Register</strong></th>
                            <th className="px-2 py-3 text-left text-sm font-medium text-black-500 uppercase tracking-wider"></th>
                        </tr>
                    </thead>
                    {isLoading ? (
                        <tbody>
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-black-500">
                                    <Spinner className="w-[25px] h-[25px] fill-secondary" />
                                </td>
                            </tr>
                        </tbody>
                    ) : (
                        renderSchedulesTable()
                    )}
                </table>
            </div>
        </div>
    );
}