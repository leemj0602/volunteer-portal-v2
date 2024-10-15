import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { EventRegistration } from "../../../../utils/classes/EventRegistration";
import Table from "../../../components/Table";
import Body from "../../../components/Table/Body";
import Cell from "../../../components/Table/Cell";
import Header from "../../../components/Table/Header";
import moment from "moment";
import Status from "../../../components/Table/Status";
import { useNavigate } from "react-router-dom";
import { AiOutlineStop } from "react-icons/ai";
import CancelEvent from "../../../../assets/undraw_cancel_re_pkdm.svg";
import Swal from "sweetalert2";
import EventRegistrationManager from "../../../../utils/managers/EventRegistrationManager";
import { Contact } from "../../../../utils/classes/Contact";
import PageNavigation from "../../../components/PageNavigation";
import QRCode from 'qrcode';
import axios from "axios";
import config from "../../../../../config.json";

/**
 * THINGS TO CONSIDER
 * Is it possible to fetch registrations per page rather than fetching every registration?
 */

interface EventRegistrationsProps {
    contact: Contact;
    registrations: EventRegistration[];
    setRegistrations: Dispatch<SetStateAction<EventRegistration[] | undefined>>;
}

const limit = 5;

const order = ["Check In", "Checked In", "Upcoming", "Pending", "Unapproved", "No Show", "Cancelled", "Cancelled By Organiser", "Completed"];

const statusColor: { [key: string]: string } = {
    "Upcoming": "bg-[#FFB656]",
    "Pending": "bg-[#F0D202]",
    "Check In": "bg-[#57D5FF]",
    "No Show": "bg-gray-400",
    "Cancelled": "bg-[#f26a6a]",
    "Completed": "bg-[#7bcf72]",
    "Cancelled By Organiser": "bg-gray-200 text-[#f26a6a]",
    "Checked In": "bg-[#5a71b4]",
    "Unapproved": "bg-[#efb7c0]"
};


export default function EventRegistrations(props: EventRegistrationsProps) {
    const [currRegistrations, setCurrRegistrations] = useState<EventRegistration[]>();

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

    // #region Mapping the registrations everytime it's updated
    useEffect(() => {
        // #region Adding "status" per registration based on conditions
        const currRegistrations = props.registrations.map(registration => {
            registration.status = "Logic Incorrect";
            const start = new Date(registration.eventRole.activity_date_time!);
            const end = new Date(start.getTime() + (registration.eventRole.duration! * 60_000));
            const now = new Date();

            // If the reigstration is cancelled
            if (registration["status_id:name"] == "Cancelled") registration.status = "Cancelled";
            // If either the event role or the event is cancelled by the organisation
            else if (registration.eventRole["status_id:name"] == "Cancelled" || registration.eventRole.event["status_id:name"] == "Cancelled") registration.status == "Cancelled by Organiser";
            // If the event hasn't started yet
            else if (now < start) {
                // If the user hasn't been approved yet
                if (registration["status_id:name"] == "Approval Required") registration.status == "Pending";
                // or the user has been unapproved
                else if (registration["status_id:name"] == "Not Approved") registration.status == "Unapproved";
                else registration.status = "Upcoming";
            }
            // IF the event has started
            else if (now >= start) {
                console.log(`Now: ${now}`);
                console.log(`End: ${end}`);
                if (now > end) {
                    console.log("long ended");
                    if (!registration.attendance) registration.status = "No Show";
                    else registration.status = "Completed";
                }
                else {
                    console.log("hasn't ended");
                    if (!registration.attendance) {
                        // If the user hasn't been approved yet, they can't check in
                        if (["Approval Required", "Not Approved"].includes(registration["status_id:name"])) registration.status == "Unapproved";
                        // otherwise, allow them to
                        else registration.status = "Check In";
                    }
                    else registration.status = "Checked In";
                }
            }

            return registration;
        });
        // #endregion
        // #region Sorting each registration based on "status"
        currRegistrations.sort((a, b) => {
            if (order.indexOf(a.status) - order.indexOf(b.status) != 0) return order.indexOf(a.status) - order.indexOf(b.status);

            if (a.status == "Upcoming" && b.status == "Upcoming" || a.status == "Check In" && b.status == "Check In" || a.status == "Checked In" && b.status == "Checked In") return new Date(a.eventRole.activity_date_time!).getTime() - new Date(b.eventRole.activity_date_time!).getTime();

            return new Date(b.eventRole.activity_date_time!).getTime() - new Date(a.eventRole.activity_date_time!).getTime();
        });
        // #endregion
        setCurrRegistrations(currRegistrations);
    }, [props.registrations]);
    // #endregion

    // #region Cancel Modal
    const promptCancelModal = async (registration: EventRegistration) => {
        if (registration.eventRole["Volunteer_Event_Role_Details.Cancellation_Date"]) {
            // If it's past the cancellation period, the admin needs to approve
            const date = new Date(registration.eventRole["Volunteer_Event_Role_Details.Cancellation_Date"]);
            if (new Date() > date) {
                const result = await Swal.fire({
                    icon: "question",
                    imageHeight: 200,
                    imageWidth: 320,
                    width: 400,
                    title: "Are you sure?",
                    text: "An administrator will have to manually approve your cancellation request.",
                    showCancelButton: true,
                    showCloseButton: true,
                    confirmButtonText: "Confirm",
                    confirmButtonColor: "#5a71b4"
                });

                if (result.isConfirmed) {
                    Swal.fire({
                        icon: "success",
                        title: "Your request has been sent",
                        text: "You will receive an email when your cancellation requestion has been approved.",
                        showCloseButton: true,
                        confirmButtonText: "OK",
                        confirmButtonColor: "#5a71b4",
                        showCancelButton: false,
                        timer: 5000,
                        timerProgressBar: true
                    })
                }

                return;
            }
        }

        const result = await Swal.fire({
            imageUrl: CancelEvent,
            imageHeight: 200,
            imageWidth: 320,
            width: 350,
            text: "Are you sure you want to cancel this registration?",
            showCancelButton: true,
            showCloseButton: true,
            confirmButtonText: "Confirm",
            confirmButtonColor: "#5a71b4",
        });

        if (result.isConfirmed) {
            await EventRegistrationManager.cancelEvent(registration.id);
            props.setRegistrations(await props.contact.fetchEventRegistrations());

            Swal.fire({
                title: "Your registration has been successfully cancelled.",
                icon: "success",
                confirmButtonText: "OK",
                timer: 5000,
                timerProgressBar: true
            });
        }
    }
    // #endregion

    // #region Responsible for taking their attendance
    // const promptCheckInModal = async (registration: EventRegistration) => {
    //     const result = await Swal.fire({
    //         icon: "question",
    //         input: "text",
    //         title: "Enter the Attendance Code",
    //         confirmButtonColor: "#5a71b4",
    //         confirmButtonText: "Verify",
    //         showCloseButton: true,
    //         inputValidator: (value) => {
    //             if (value != registration.eventRole.event["Volunteer_Event_Details.Attendance_Code"]) return "Invalid code. Please try again.";
    //         }
    //     });

    //     if (result.isConfirmed) {
    //         const attendance = await EventRegistrationManager.createAttendance(props.contact.id!, registration.eventRole.id!, registration.eventRole.event.duration!).catch(() => null);
    //         if (attendance) {
    //             props.setRegistrations(await props.contact.fetchEventRegistrations());

    //             Swal.fire({
    //                 icon: "success",
    //                 title: "Attendance successfully taken",
    //                 timer: 3000,
    //                 timerProgressBar: true
    //             });
    //         }
    //         else Swal.fire({ icon: "error", title: "An error has occurred", text: "Please try again at a later time" });
    //     }
    // }
    // #endregion

    const encrypt = async (value: string) => {
        const response = await axios.post(`${config.domain}/portal/api/encode.php`, { data: value });
        return response.data as string;
    }

    // Now using QR code to check in
    const generateCheckInQR = async (registration: EventRegistration) => {
        const contactId = props.contact.id!;
        const registrationId = registration.id!;

        const string = `${contactId}/${registrationId}`;

        const encryptedString = await encrypt(string);

        // Generate the URL for the QR code with encrypted values
        const checkInUrl = `${window.location.href}${window.location.href.includes("#") ? "" : "#/"}checkin/${encryptedString}`;

        // Generate QR code
        const qrCodeDataUrl = await QRCode.toDataURL(checkInUrl);

        // Display the QR code in a SweetAlert2 box
        Swal.fire({
            title: 'Check-In',
            html: `
            <div style="display: flex; flex-direction: column; align-items: center;">
                <p>Show this QR code to a staff:</p>
                <img src="${qrCodeDataUrl}" alt="QR Code" style="width: 250px; height: 250px;" />
            </div>
            `,
            width: 350,
            padding: '1em',
            confirmButtonText: 'Close',
        });
    }

    // #endregion

    return <div>
        <Table header="Volunteering Event Status">
            <Header>
                <Cell className="text-lg font-semibold w-1/4">Subject</Cell>
                <Cell className="text-lg font-semibold w-1/4">Date & Time</Cell>
                <Cell className="text-lg font-semibold w-1/6">Status</Cell>
                <Cell className="text-lg font-semibold w-1/4 hidden lg:table-cell">Location</Cell>
                <Cell className="text-lg font-semibold w-1/6">Action</Cell>
            </Header>
            <Body>
                {!currRegistrations?.length ? <tr>
                    <Cell colSpan={5} className="text-center text-lg text-gray-500">No event history available</Cell>
                    {/* Slices and shows only 5 entities per page */}
                </tr> : currRegistrations.slice(page * limit, page + ((page + 1) * limit)).map((registration, index) => {
                    const { eventRole } = registration;

                    // Setting the subject
                    let subject = `${eventRole["Volunteer_Event_Role_Details.Role:label"] ? `${eventRole["Volunteer_Event_Role_Details.Role:label"]} - ` : ""}${eventRole.event.subject}`;
                    if (subject.length > 37) subject = `${subject.slice(0, 37)}...`;

                    // Checks whether the organisation has cancelled the event role or the event itself
                    const cancelledByOrganisation = [eventRole.event["status_id:name"], eventRole["status_id:name"]].some(e => e == "Cancelled");

                    // Checks whether the registration can be cancelled
                    const cancellable = ["Upcoming", "Pending"].includes(registration.status);

                    return <tr key={index} className={cancelledByOrganisation ? "bg-gray-200" : ""}>
                        {/* Subject */}
                        <Cell className={cancelledByOrganisation ? "text-gray-400" : ""}>
                            <button className={!cancelledByOrganisation ? "text-secondary hover:text-primary cursor-pointer" : ""} disabled={cancelledByOrganisation} onClick={() => navigate(`/events/${eventRole.event.id}/${registration.eventRole["Volunteer_Event_Role_Details.Role"]}`)}>
                                {subject}
                            </button>
                        </Cell>
                        {/* Date and Time */}
                        <Cell className={cancelledByOrganisation ? "text-gray-400" : ""}>
                            {moment(eventRole.activity_date_time!).format("DD/MM/yyyy hh:mm A")}
                        </Cell>
                        {/* Status */}
                        <Cell>
                            <Status className={statusColor[registration.status]} onClick={registration.status == "Check In" ? () => generateCheckInQR(registration) : undefined}>
                                {registration.status}
                            </Status>
                        </Cell>
                        {/* Location */}
                        <Cell className={cancelledByOrganisation ? "text-gray-400" : ""}>
                            {eventRole.event.location}
                        </Cell>
                        {/* Action */}
                        <Cell>
                            <button className={`flex ${cancellable ? "text-red-700" : "text-gray-500"} items-center`} disabled={!cancellable} onClick={() => promptCancelModal(registration)}>
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