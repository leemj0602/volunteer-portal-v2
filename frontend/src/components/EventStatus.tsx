import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BsThreeDotsVertical } from "react-icons/bs";
import { GrView } from "react-icons/gr";
import { AiOutlineStop } from "react-icons/ai";
import ConfirmationModal from "./ConfirmationModal";
import config from "../../../config";
import swal from "sweetalert";
import EventRegistrationManager from "../../utils/managers/EventRegistrationManager";
import ContactManager from "../../utils/managers/ContactManager";

interface EventRegistration {
  id: number;
  name: string;
  formattedDateTime: string;
  status: string;
  location: string;
  eventRoleId: number;
  duration: number;
  eventId: number;
}

interface EventStatusProps {
  eventRegistrations: EventRegistration[];
  openCancelModal: (registrationId: number) => void;
}

// Function to check attendance code
// async function checkAttendanceCode(eventId: number, attendanceCode: string) {
//   const eventDetail = await CRM('Activity', 'get', {
//     select: [
//       'subject',
//       `${config.EventCustomFieldSetName}.attendance_code`
//     ],
//     where: [
//       ['id', '=', eventId],
//       [`${config.EventCustomFieldSetName}.attendance_code`, '=', attendanceCode]
//     ],
//   });

//   return eventDetail.data;
// }

export default function EventStatus({ eventRegistrations, openCancelModal }: EventStatusProps) {
  const email = (window as any).email as string ?? config.email;

  const statusStyles: { [key: string]: string } = {
    "Upcoming": "bg-[#FFB656] text-white",
    "Pending": "bg-[#F0D202] text-white",
    "Check In": "bg-[#57D5FF] text-white",
    "No Show": "bg-gray-400 text-white",
    "Cancelled": "bg-[#F26A6A] text-white",
    "Completed": "bg-[#7BCF72] text-white",
    "Cancelled By Organiser": "bg-gray-200 text-[#F26A6A]",
    "Checked In": "bg-[#5A71B4] text-white",
    "Unapproved": "bg-[#EFB7C0] text-white",
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [attendanceCode, setAttendanceCode] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [selectedEventRoleId, setSelectedEventRoleId] = useState<number | null>(null);
  const [selectedEventDuration, setSelectedEventDuration] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventList, setEventList] = useState<EventRegistration[]>(eventRegistrations);
  const eventsPerPage = 5;

  const dropdownRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Update eventList when events prop changes
  useEffect(() => {
    setEventList(eventRegistrations);
  }, [eventRegistrations]);

  useEffect(() => {
    const handleScroll = () => {
      setOpenMenuIndex(null);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        openMenuIndex !== null &&
        dropdownRefs.current[openMenuIndex] &&
        !dropdownRefs.current[openMenuIndex]?.contains(e.target as Node)
      ) {
        setOpenMenuIndex(null);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuIndex]);

  // Calculate the total number of pages
  const totalPages = Math.ceil(eventList.length / eventsPerPage);

  // Get the events to display on the current page
  const currentEventRegistrations = eventList.slice(
    (currentPage - 1) * eventsPerPage,
    currentPage * eventsPerPage
  );

  // Handler for the previous button
  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Handler for the next button
  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Toggle menu visibility
  const toggleMenu = (index: number) => {
    if (openMenuIndex === index) {
      setOpenMenuIndex(null); // Close the menu if it's already open
    } else {
      setOpenMenuIndex(index); // Open the menu if it's not open
    }
  };

  const navigate = useNavigate();

  const handleCheckInClick = (eventRegistration: EventRegistration) => {
    setSelectedEventId(eventRegistration.eventId);
    setSelectedEventRoleId(eventRegistration.eventRoleId);
    setSelectedEventDuration(eventRegistration.duration);
    setIsPopupOpen(true);
  };

  const handlePopupSubmit = async () => {
    if (selectedEventId !== null) {
      setAttendanceCode("");
      setIsSubmitting(true);
      console.log("Attendance code submitted:", attendanceCode, "for event ID:", selectedEventId);
      const checkAttendanceCodeResult = await EventRegistrationManager.checkAttendanceCode(selectedEventId, attendanceCode);
      if (checkAttendanceCodeResult.length > 0) {
        let contact = await ContactManager.fetch(email);

        if (selectedEventRoleId !== null && selectedEventDuration !== null) {
          // Creating the Event Attendance Activity
          const createEventAttendance = await EventRegistrationManager.createAttendance(contact.id, selectedEventRoleId, selectedEventDuration);

          if (createEventAttendance) {
            // Close the popup
            setIsPopupOpen(false);

            swal("Attendance taken successfully", {
              icon: "success",
            });

            // Update the status of the event to "Checked In"
            setEventList((prevEvents) =>
              prevEvents.map((event) =>
                event.eventId === selectedEventId ? { ...event, status: "Checked In" } : event
              )
            );
            setIsSubmitting(false);
          } else {
            // Close the popup
            setIsPopupOpen(false);

            swal("Attendance taken unsuccessfully", {
              icon: "error",
            });
            setIsSubmitting(false);
          }
        }
      }
      else {
        swal("Wrong code, please try again", {
          icon: "error",
        });
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="mt-5 rounded-lg">
      <h2 className="text-3xl font-semibold text-black mt-5 mb-5">Volunteering Event Status</h2>
      <div className="border-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 table-fixed">
          <thead className="bg-white">
            <tr>
              <th className="px-6 py-5 text-left text-xl font-semibold text-black w-1/4">Event Name</th>
              <th className="px-6 py-5 text-left text-xl font-semibold text-black w-1/4">Date & Time</th>
              <th className="px-6 py-5 text-left text-xl font-semibold text-black w-1/6">Status</th>
              <th className="px-6 py-5 text-left text-xl font-semibold text-black w-1/4 hidden lg:table-cell">Location</th>
              <th className="px-6 py-5 text-left text-xl font-semibold text-black w-1/6">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentEventRegistrations.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-lg text-gray-500">
                  No event history available
                </td>
              </tr>
            ) : (
              currentEventRegistrations.map((eventRegistration, index) => (
                <tr key={index} className={`${eventRegistration.status === "Cancelled By Organiser" ? 'bg-gray-200' : ''}`}>
                  <td className={`px-3 text-lg py-4 whitespace-nowrap pl-6 ${eventRegistration.status === "Cancelled By Organiser" ? 'text-gray-400' : ''}`}>{eventRegistration.name}</td>
                  <td className={`px-3 text-lg py-4 whitespace-nowrap pl-6 ${eventRegistration.status === "Cancelled By Organiser" ? 'text-gray-400' : ''}`}>{eventRegistration.formattedDateTime}</td>
                  <td className={`px-3 text-lg py-4 whitespace-nowrap pl-6 ${eventRegistration.status === "Cancelled By Organiser" ? 'font-black' : ''}`}>
                    {eventRegistration.status === "Check In" ? (
                      <button
                        className={`flex items-center justify-center px-4 text-lg leading-8 font-semibold rounded-md w-[120px] ${statusStyles[eventRegistration.status]}`}
                        onClick={() => handleCheckInClick(eventRegistration)}
                      >
                        {eventRegistration.status}
                      </button>
                    ) : (
                      <span className={`flex items-center justify-center px-4 text-lg leading-8 font-semibold rounded-md w-[120px] ${statusStyles[eventRegistration.status]}`}>
                        {eventRegistration.status === "Cancelled By Organiser" ? "Event\nCancelled" : eventRegistration.status}
                      </span>
                    )}
                  </td>
                  <td className={`px-3 text-lg py-4 whitespace-nowrap pl-6 ${eventRegistration.status === "Cancelled By Organiser" ? 'text-gray-400 hidden lg:table-cell' : 'hidden lg:table-cell'}`}>{eventRegistration.location}</td>
                  <td className="px-3 text-lg py-4 whitespace-nowrap relative">
                    <div ref={(el) => dropdownRefs.current[index] = el}>
                      <button
                        className={`text-gray-500 hover:text-gray-900 transition-transform transform ${openMenuIndex === index ? 'rotate-[-45deg] translate-y-3' : ''}`}
                        style={{ transformOrigin: 'center' }}
                        onClick={() => toggleMenu(index)}
                      >
                        <BsThreeDotsVertical className="h-8 w-8 ml-8 mt-2" />
                      </button>
                      {openMenuIndex === index && (
                        <div
                          className={`absolute right-0 w-40 bg-white shadow-lg rounded-md z-50 ${index >= currentEventRegistrations.length - 2 ? 'bottom-full mb-2' : 'top-full mt-2'
                            }`}
                        >
                          <ul>
                            <li
                              className={`px-4 py-2 flex items-center ${eventRegistration.status === "Cancelled By Organiser"
                                ? "text-gray-400 cursor-not-allowed"
                                : "hover:bg-gray-100 cursor-pointer"
                                }`}
                              onClick={() => navigate(`/events/${eventRegistration.eventRoleId}`)}>
                              <GrView className="mr-2" /> View
                            </li>
                            <li
                              className={`px-4 py-2 flex items-center ${eventRegistration.status === "Completed" || eventRegistration.status === "Cancelled" || eventRegistration.status === "Cancelled By Organiser"
                                ? "text-gray-400 cursor-not-allowed"
                                : "hover:bg-gray-100 cursor-pointer"
                                }`}
                              onClick={() => {
                                if (eventRegistration.status !== "Completed" && eventRegistration.status !== "Cancelled" && eventRegistration.status !== "Cancelled By Organiser") {
                                  openCancelModal(eventRegistration.id);
                                }
                              }}
                            >
                              <AiOutlineStop className="mr-2" /> Cancel
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-4">
        <span className="text-lg text-gray-500">
          Showing {eventList.length > 0 ? (((currentPage - 1) * eventsPerPage) + 1) : ((currentPage - 1) * eventsPerPage)} to {Math.min(currentPage * eventsPerPage, eventList.length)} of {eventList.length} entries
        </span>
        <div className="flex items-center space-x-2">
          <button
            className={`px-2 py-4 text-3xl font-medium rounded ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:text-black'}`}
            onClick={handlePrevious}
            disabled={currentPage === 1}
          >
            &laquo;
          </button>
          <span className="text-lg font-medium mt-1 text-gray-700">{currentPage}</span>
          <button
            className={`px-2 py-4 text-3xl font-medium rounded ${currentPage >= totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:text-black'}`}
            onClick={handleNext}
            disabled={currentPage >= totalPages}
          >
            &raquo;
          </button>
        </div>
      </div>
      <ConfirmationModal
        showModal={isPopupOpen}
        closeModal={() => setIsPopupOpen(false)}
        boxWidth="max-w-[400px]"
      >
        <h3 className="text-2xl font-semibold text-center mb-4 text-gray-700">
          Enter Attendance Code
        </h3>
        <input
          type="text"
          value={attendanceCode}
          onChange={(e) => setAttendanceCode(e.target.value)}
          className="w-full px-4 py-2 border border-solid border-black rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter code here"
        />
        <div className="flex justify-center space-x-4">
          <button
            onClick={handlePopupSubmit}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
          <button
            onClick={() => setIsPopupOpen(false)}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </ConfirmationModal>
    </div>
  );
}