import { useNavigate } from "react-router-dom";
import config from "../../../config";
import { EventStatus } from "../../utils/classes/EventDetails";
import { EventRole } from "../../utils/classes/EventRole";

interface EventRoleCardProps {
    eventRole: EventRole;
    className?: string;
}

export default function EventRoleCard(props: EventRoleCardProps) {
    const navigate = useNavigate();

    return <div className={props.className}>
        <div className="bg-white w-full shadow-md rounded-md p-4 transition-transform duration-300 transform hover:scale-105 flex flex-col justify-between relative">
            {/* If the event is cancelled */}
            {props.eventRole.event["status_id:name"] == EventStatus.Cancelled && <div className="absolute inset-0 bg-gray-500/50 flex items-center justify-center z-10 rounded-md">
                <div className="text-red-500 text-4xl font-bold transform rotate-[-10deg] opacity-90 p-4 border-2 border-red-500 rounded-lg bg-white bg-opacity-75 shadow-lg">
                    Event Cancelled
                </div>
            </div>}
            <div>
                {/* Image */}
                <div className={`mb-4 h-[160px] rounded-lg relative bg-gray-200 cursor-pointer`} onClick={() => navigate(`/events/${props.eventRole.id}`)}>
                    {props.eventRole.event.thumbnail && <img src={`${config.domain}/wp-content/uploads/civicrm/custom/${props.eventRole.event.thumbnail}`} className="w-full h-full object-cover rounded-lg" />}
                </div>
            </div>
        </div>
    </div>
}
