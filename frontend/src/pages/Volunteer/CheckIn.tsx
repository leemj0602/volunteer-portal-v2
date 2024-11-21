import { useEffect, useState } from "react";
import Wrapper from "../../components/Wrapper";
import Loading from "../../components/Loading";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import config from "../../../../config.json";
import EventRegistrationManager from "../../../utils/managers/EventRegistrationManager";
import moment from "moment";

export default function CheckIn() {
    const navigate = useNavigate();

    const { encrypted } = useParams();
    const [attendanceTaken, setAttendanceTaken] = useState<boolean>(false);
    const [attendanceAlreadyTaken, setAttendanceAlreadyTaken] = useState<boolean>(false); // New state to track if attendance is already taken
    const [volunteerName, setVolunteerName] = useState<string>();
    const [dateTime, setDateTime] = useState<string>();
    const roles = (window as any).roles;

    const decrypt = async (encrypted: string) => {
        const response = await axios.post(`${config.domain}/portal/api/decode.php`, { data: encrypted });
        return response.data as string;
    };

    useEffect(() => {
        const roleValues = Object.values(roles);
        if (['administrator', 'volunteer_portal_admin'].some(v => roleValues.includes(v))) {
            (async () => {
                const decryptedString = await decrypt(encrypted!);
                console.log(decryptedString);
                const splitString = decryptedString.split('/');
                const contactId = splitString[0];
                const registrationId = splitString[1];

                const registration = await EventRegistrationManager.fetchById(registrationId);

                if (registration?.["contact.id"].toString() === contactId) {
                    const eventRoleId = registration.eventRole.id;
                    const duration = registration.eventRole.duration;

                    const checkAttendance = await EventRegistrationManager.checkAttendance(parseInt(contactId), eventRoleId!).catch(() => null);
                    if (!checkAttendance) {
                        const takeAttendance = await EventRegistrationManager.createAttendance(parseInt(contactId), eventRoleId!, duration!).catch(() => null);
                        if (takeAttendance) {
                            setAttendanceTaken(true);
                            setVolunteerName(registration["contact.first_name"] + " " + registration["contact.last_name"]);
                            const formattedAttendanceDate = moment(takeAttendance, "YYYYMMDDHHmmss").format("DD/MM/YYYY HH:mm:ss");
                            setDateTime(formattedAttendanceDate);
                        } else {
                            Swal.fire({ icon: "error", title: "An error has occurred", text: "Please try again at a later time" });
                            navigate("/");
                        }
                    } else {
                        setAttendanceAlreadyTaken(true); // Update state if attendance was already taken
                    }
                }
                else {
                    Swal.fire({ icon: "error", title: "An error has occured", text: "Please try again at a later time" });
                    navigate("/");
                }
            })();
        } else {
            Swal.fire({
                icon: "error",
                title: "Access Denied",
                text: "You are not allowed to access this page.",
            });
            navigate("/");
        }
    }, [encrypted]);

    return (
        <Wrapper>
            {!attendanceTaken && !attendanceAlreadyTaken ? (
                <Loading className="h-screen flex items-center justify-center" />
            ) : attendanceAlreadyTaken ? ( // Handle case where attendance is already taken
                <div className="min-h-screen flex items-center justify-center">
                    <div className="bg-white shadow-lg rounded-lg p-8 max-w-sm text-center">
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">Attendance Already Taken</h1>
                        <p className="text-lg text-gray-600">Attendance has already been recorded for this volunteer.</p>
                        <p className="text-sm text-gray-500 mt-2">Please use another check-in QR code.</p>
                    </div>
                </div>
            ) : (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="bg-white shadow-lg rounded-lg p-8 max-w-sm text-center">
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">Attendance Taken</h1>
                        <p className="text-lg text-gray-600">for {volunteerName}</p>
                        <p className="text-sm text-gray-500 mt-2">at {dateTime}</p>
                    </div>
                </div>
            )}
        </Wrapper>
    );
}