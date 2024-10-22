import { EventRegistration } from "../../../../utils/classes/EventRegistration"

/**
 * THINGS TO CONSIDER
 * Is there a way to calculate all of this without fetching every registration?
 * If not, is there a way to only fetch the necessary details only?
 */

interface StatsProps {
    registrations: EventRegistration[];
}

export default function Statistics(props: StatsProps) {
    let hours = 0;
    let participated = 0;
    props.registrations.forEach(registration => {
        const { eventRole, attendance } = registration;
        const start = new Date(eventRole.activity_date_time!);
        const duration = eventRole.duration! * 60 * 1000; // Convert to milliseconds because getTime() returns time in milliseconds
        const end = new Date(start.getTime() + duration);
        const now = new Date();

        if (now > end && attendance) {
            hours += attendance?.duration ?? eventRole.duration!;
            participated++;
        }
    });
    hours = parseFloat((hours / 60).toFixed(1));

    return <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="bg-white p-3 rounded-lg shadow-md flex flex-col border-l-[12px] border-l-primary">
            <h3 className="text-xl font-semibold text-black-700 mb-2 mt-2 pl-4">No. of Hours Volunteered</h3>
            <p className="text-4xl font-semibold flex items-center justify-center flex-grow text-secondary">{hours}</p>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-md flex flex-col border-l-[12px] border-l-primary">
            <h3 className="text-xl font-semibold text-black-700 mb-2 mt-2 pl-4">Volunteering Events Attended</h3>
            <p className="text-4xl font-semibold flex items-center justify-center flex-grow text-secondary">{participated}</p>
        </div>
    </div>
}