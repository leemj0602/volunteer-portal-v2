import { useNavigate } from "react-router-dom";
import config from "../../../../config.json";
import { CiFileOff } from "react-icons/ci";
import { PropsWithChildren } from "react";

export interface CardProps extends PropsWithChildren {
    className?: string;
    thumbnail?: string | null;
    hideThumbnail?: boolean;
    url?: string;
    cancelled?: boolean;
    disableHover?: boolean;
    disableButton?: boolean;
    buttonText?: string;
    buttonTextColour?: string;
    buttonColour?: string;
}

export default function Card(props: CardProps) {
    const navigate = useNavigate();

    return <div className={props.className}>
        {props.cancelled && <div className="absolute inset-0 bg-gray-500/50 flex items-center justify-center z-10 rounded-md">
            <div className="text-red-500 text-4xl font-bold transform rotate-[-10deg] opacity-90 p-4 border-2 border-red-500 rounded-lg bg-white bg-opacity-75 shadow-lg">
                Cancelled
            </div>
        </div>}
        <div className={`bg-white w-full shadow-md rounded-md p-4 ${props.disableHover ? "" : "transform duration-300 transition-transform hover:scale-105"} flex flex-col justify-between relative`}>
            {/* Main body */}
            <div>
                {/* Image */}
                {!props.hideThumbnail && <div className={`mb-4 h-[160px] rounded-lg relative bg-gray-200 ${props.url ? "cursor-pointer" : ""}`} onClick={() => props.url ? navigate(props.url!) : null}>
                    {props.thumbnail && <img src={`${config.domain}/wp-content/uploads/civicrm/custom/${props.thumbnail}`} className="w-full h-full object-cover rounded-lg" />}
                    {!props.thumbnail && <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <CiFileOff size={64} className="text-80px text-gray-500" />
                    </div>}
                </div>}
                {/* Children */}
                {props.children}
            </div>
            {/* Button */}
            {props.url?.length && !props.disableButton && <button className={`${props.buttonTextColour ? `text-[${props.buttonTextColour}]` : "text-white"} ${props.buttonColour ? `bg-[${props.buttonColour}]` : 'bg-secondary'} text-center w-full rounded-md text-sm mt-6 py-2`} onClick={() => navigate(props.url!)}>
                {props.buttonText ?? "Read More"}
            </button>}
        </div>
    </div>
}