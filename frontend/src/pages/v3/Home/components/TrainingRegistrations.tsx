import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Contact } from "../../../../../utils/classes/Contact";
import { TrainingRegistration } from "../../../../../utils/classes/TrainingRegistration";
import Table from "../../../../components/Table";
import Body from "../../../../components/Table/Body";
import Cell from "../../../../components/Table/Cell";
import Header from "../../../../components/Table/Header";
import { useNavigate } from "react-router-dom";
import { TrainingStatus } from "../../../../../utils/classes/Training";
import moment from "moment";
import { AiOutlineStop } from "react-icons/ai";
import Status from "../../../../components/Table/Status";
import Swal from "sweetalert2";
import CancelEvent from "../../../../../assets/undraw_cancel_re_pkdm.svg";
import TrainingRegistrationManager from "../../../../../utils/managers/TrainingRegistrationManager";
import { inflect } from "inflection";
import PageNavigation from "../../../../components/PageNavigation";

interface TrainingRegistrationsProps {
    contact: Contact;
    registrations: TrainingRegistration[];
    setRegistrations: Dispatch<SetStateAction<TrainingRegistration[] | undefined>>;
}

const limit = 5;

const order = ["Upcoming", "No Show", "Cancelled", "Cancelled By Organiser", "Completed"];

const statusColor: { [key: string]: string } = {
    "Upcoming": "bg-[#FFB656]",
    "No Show": "bg-gray-400",
    "Cancelled": "bg-[#f26a6a]",
    "Completed": "bg-[#7bcf72]",
    "Cancelled By Organiser": "bg-gray-200 text-[#f26a6a]"
};


export default function TrainingRegistrations(props: TrainingRegistrationsProps) {
    const [currRegistrations, setCurrRegistrations] = useState<TrainingRegistration[]>();

    const navigate = useNavigate();
    const [page, setPage] = useState(0);
    const pages = Math.ceil(props.registrations.length / limit) - 1;
    const previousPage = () => {
        if (page - 1 <= 0) setPage(0);
        else setPage(page - 1);
    }
    const nextPage = () => {
        if (page >= pages) setPage(pages);
        else setPage(page + 1);
    }

    useEffect(() => {
        const currRegistrations = props.registrations.map(registration => {
            const { trainingSchedule } = registration;

            registration.status = "Logic Incorrect";
            const start = new Date(trainingSchedule.activity_date_time!);
            const end = new Date(start.getTime() + trainingSchedule.duration!);
            const now = new Date();

            if (registration["status_id:name"] == "Cancelled") registration.status = "Cancelled";
            else if ([trainingSchedule["status_id:name"], trainingSchedule.training["status_id:name"]].includes(TrainingStatus.Cancelled)) registration.status = "Cancelled By Organiser";
            else if (now < start) registration.status = "Upcoming";
            else if (now > end) {
                if (registration["status_id:name"] == "Completed") registration.status = "Completed";
                else registration.status = "No Show";
            }

            return registration;
        });

        currRegistrations.sort((a, b) => {
            if (order.indexOf(a.status) - order.indexOf(b.status) != 0) return order.indexOf(a.status) - order.indexOf(b.status);

            if (a.status == "Upcoming" && b.status == "Upcoming") return new Date(a.trainingSchedule.activity_date_time!).getTime() - new Date(b.trainingSchedule.activity_date_time!).getTime();

            return new Date(b.trainingSchedule.activity_date_time!).getTime() - new Date(a.trainingSchedule.activity_date_time!).getTime();
        });

        setCurrRegistrations(currRegistrations);
    }, [props.registrations]);

    const openModal = async (registration: TrainingRegistration) => {
        const result = await Swal.fire({
            imageUrl: CancelEvent,
            imageHeight: 200,
            imageWidth: 320,
            width: 350,
            text: "Are you sure you want to cancel this registration?",
            showCancelButton: true,
            showCloseButton: true,
            confirmButtonText: "Confirm",
            confirmButtonColor: "#5a71b4"
        });

        if (result.isConfirmed) {
            await TrainingRegistrationManager.cancelTraining(registration.id);
            props.setRegistrations(await props.contact.fetchTrainingRegistrations());

            Swal.fire({
                title: "Your registration has been successfully cancelled.",
                icon: "success",
                confirmButtonText: "OK",
                timer: 50000,
                timerProgressBar: true
            })
        }
    }

    return <div>
        <Table header="Training Status">
            <Header>
                <Cell className="text-lg font-semibold w-1/4">Subject</Cell>
                <Cell className="text-lg font-semibold w-1/4">Date & Time</Cell>
                <Cell className="text-lg font-semibold w-1/6">Status</Cell>
                <Cell className="text-lg font-semibold w-1/4 hidden lg:table-cell">Location</Cell>
                <Cell className="text-lg font-semibold w-1/6">Action</Cell>
            </Header>
            <Body>
                {!currRegistrations?.length ? <tr>
                    <Cell colSpan={5} className="text-center text-lg text-gray-500">No training history available</Cell>
                    {/* Slices and shows only 5 entities per page */}
                </tr> : currRegistrations.slice(page * limit, page + ((page + 1) * limit)).map((registration, index) => {
                    const { trainingSchedule } = registration;

                    // Checks whether the organisation has cancelled the event role or the event itself
                    const cancelledByOrganisation = [trainingSchedule.training["status_id:name"], trainingSchedule["status_id:name"]].some(e => e == "Cancelled");

                    // Checks whether the registration can be cancelled
                    const cancellable = registration.status == "Upcoming";

                    return <tr key={index} className={cancelledByOrganisation ? "bg-gray-200" : ""}>
                        {/* Subject */}
                        <Cell className={`whitespace-nowrap ${cancelledByOrganisation ? "text-gray-400" : ""}`}>
                            <button className={!cancelledByOrganisation ? "text-secondary hover:text-primary cursor-pointer" : ""} disabled={cancelledByOrganisation} onClick={() => navigate(`/trainings/${trainingSchedule.training.id}`)}>
                                {trainingSchedule.training.subject!.slice(0, 37)}{trainingSchedule.training.subject!.length > 37 ? "..." : ""}
                            </button>
                        </Cell>
                        {/* Date and Time */}
                        <Cell className={`whitespace-nowrap ${cancelledByOrganisation ? "text-gray-400" : ""}`}>
                            {moment(trainingSchedule.activity_date_time!).format("DD/MM/yyyy hh:mm A")}
                        </Cell>
                        {/* Status */}
                        <Cell>
                            <Status className={statusColor[registration.status]}>
                                {registration.status}
                            </Status>
                        </Cell>
                        {/* Location */}
                        <Cell className={`whitespace-nowrap hidden lg:table-cell ${cancelledByOrganisation ? "text-gray-400" : ""}`}>
                            {trainingSchedule.location}
                        </Cell>
                        {/* Action */}
                        <Cell>
                            <button className={`flex ${cancellable ? "text-red-700" : "text-gray-500"} items-center`} disabled={!cancellable} onClick={() => openModal(registration)}>
                                <AiOutlineStop className="mr-2" /> Cancel
                            </button>
                        </Cell>
                    </tr>
                })}
            </Body>
        </Table>
        <PageNavigation page={page} pages={pages} limit={limit} array={props.registrations} previousPage={previousPage} nextPage={nextPage} />
    </div>
}