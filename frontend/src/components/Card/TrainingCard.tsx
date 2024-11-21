import { RiCalendarScheduleLine } from "react-icons/ri";
import { Training, TrainingStatus } from "../../../utils/classes/Training";
import Card from "./";
import { useEffect, useState } from "react";
import { Spinner } from "flowbite-react";
import pluralize from "pluralize";

interface TrainingCardProps {
    training: Training;
    className?: string;
}

export default function TrainingCard(props: TrainingCardProps) {
    const [schedules, setSchedules] = useState<any[]>();
    const removeHTMLTags = (html: string) => {
        const temp = document.createElement("div");
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || "";
    }

    useEffect(() => {
        (async () => {
            const schedules = await props.training.fetchSchedules({ select: ["id"] });
            setSchedules(schedules);
        })();
    }, []);


    return <Card
        className={props.className}
        url={`/volunteer/trainings/${props.training.id}`}
        thumbnail={props.training.thumbnail}
        cancelled={props.training["status_id:name"] == TrainingStatus.Cancelled}
    >
        <div className="px-3 pb-3">
            <h1 className="font-semibold mb-2">{props.training.subject}</h1>
            <div className="text-xs text-black/80">{removeHTMLTags(props.training.details ?? "").slice(0, 100)}{(removeHTMLTags(props.training.details ?? "").length ?? 0) > 100 ? "..." : ""}</div>
            <div className="flex gap-x-3 items-center mt-4">
                <RiCalendarScheduleLine className="text-secondary" />
                <span className="text-sm font-semibold items-center">
                    {schedules ? `${schedules.length}` : <Spinner className="w-[14px] h-[14px] fill-secondary mr-1" />} Upcoming {pluralize("Schedule", schedules?.length ?? 2)}
                </span>
            </div>
        </div>
    </Card>
}