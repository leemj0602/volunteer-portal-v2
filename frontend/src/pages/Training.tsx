import { useParams } from "react-router-dom";
import Wrapper from "../components/Wrapper";
import { useEffect, useState } from "react";
import { Training } from "../../utils/classes/Training";
import { TrainingSchedule } from "../../utils/classes/TrainingSchedule";
import TrainingManager from "../../utils/managers/TrainingManager";
import Loading from "../components/Loading";
import config from "../../../config";
import { CiFileOff } from "react-icons/ci";
import moment from "moment";
import Swal from "sweetalert2";
import { UserIcon, PhoneIcon, EnvelopeOpenIcon } from '@heroicons/react/24/solid';
import ScheduleTable from "../components/ScheduleTable";

export default function TrainingPage() {
    const { id } = useParams();
    const [training, setTraining] = useState<Training>();
    const [schedules, setSchedules] = useState<any[]>([]);
    const [loadingScheduleId, setLoadingScheduleId] = useState<number | null>(null);
    const [dataFetched, setDataFetched] = useState<boolean>(false);
    const email = (window as any).email;
    
    useEffect(() => {
        (async () => {
            const training = await TrainingManager.fetch({ id }) as Training;
            setTraining(training);

            const trainingSchedules = await training?.fetchSchedules() as TrainingSchedule[];

            // #region Parsing data for event roles table
            const trainingSchedulesTable = trainingSchedules.map((trainingSchedule: TrainingSchedule) => {
                const ID = trainingSchedule.id ?? null;
                const StartDateTime = trainingSchedule.activity_date_time ?? 'N/A';
                const Duration = trainingSchedule.training.duration ?? 0;
                const EndDateTime = moment(StartDateTime).add(Duration, 'minutes');
                const Vacancy = trainingSchedule["Volunteer_Training_Schedule_Details.Vacancy"] ?? 'N/A';
                const NumRegistrations = trainingSchedule.registrations.filter((r) => r["status_id:name"] !== "Cancelled").length;
                const RegistrationStartDate = trainingSchedule["Volunteer_Training_Schedule_Details.Registration_Start_Date"] ?? 'N/A';
                let RegistrationEndDate = trainingSchedule["Volunteer_Training_Schedule_Details.Registration_End_Date"] ?? 'N/A';
                const ExpirationDate = trainingSchedule["Volunteer_Training_Schedule_Details.Expiration_Date"] ?? 'N/A';
                const Location = trainingSchedule.location ?? 'N/A';
                const currentDate = moment();

                const userIsRegistered = isUserRegistered(trainingSchedule, email);
                const cancelledRegistration = userIsRegistered ? trainingSchedule.registrations.find(r => r["contact.email_primary.email"] == email)?.["status_id:name"] == "Cancelled" ? true : false : false;
                const isRegistering = loadingScheduleId === trainingSchedule.id;

                if (RegistrationEndDate === 'N/A') {
                    RegistrationEndDate = StartDateTime;
                }

                let registerStatus;
                let disabled;

                // #region Determine button status
                if (userIsRegistered && cancelledRegistration) {
                    registerStatus = 'Cancelled';
                    disabled = true;
                } else if (userIsRegistered) {
                    registerStatus = 'Registered';
                    disabled = true;
                } else if (isRegistering) {
                    registerStatus = 'Registering';
                    disabled = true;
                } else if (
                    (RegistrationStartDate !== 'N/A' && currentDate.isBefore(moment(RegistrationStartDate))) ||
                    (RegistrationEndDate !== 'N/A' && currentDate.isAfter(moment(RegistrationEndDate)))
                ) {
                    registerStatus = 'Closed';
                    disabled = true;
                } else if (Vacancy !== 'N/A' && (Vacancy - NumRegistrations) <= 0) {
                    registerStatus = 'Full';
                    disabled = true;
                } else {
                    registerStatus = 'Register';
                    disabled = false;
                }
                // #endregion

                return {
                    id: ID,
                    startDate: StartDateTime,
                    endDate: EndDateTime,
                    participants: Vacancy === "N/A" ? NumRegistrations : NumRegistrations + "/" + Vacancy,
                    registrationEndDate: RegistrationEndDate,
                    registerStatus: registerStatus,
                    disabled: disabled,
                    onClick: () => handleRegisterClick(trainingSchedule, Vacancy),
                    location: Location,
                    validThrough: ExpirationDate,
                }
            });
            // #endregion

            setSchedules(trainingSchedulesTable);
            setDataFetched(true);
        })();
    }, [id]);

    const isUserRegistered = (schedule: TrainingSchedule, email: string) => {
        return schedule.registrations.some(
            registration => registration["contact.email_primary.email"] === email
        );
    };

    // #region Registration
    const handleRegisterClick = async (schedule: TrainingSchedule, currentVacancy: number | string) => {
        setLoadingScheduleId(schedule.id);
        setSchedules((prevSchedules) =>
            prevSchedules.map((prevSchedule) =>
                prevSchedule.id === schedule.id
                    ? { ...prevSchedule, registerStatus: "Registering", disabled: true }
                    : prevSchedule
            )
        );

        try {
            const register = await schedule.register(email);
            if (register) {
                const newScheduleRegistrations = await schedule.fetchScheduleRegistrationCount(schedule.id!);
                setSchedules((prevSchedules) =>
                    prevSchedules.map((prevSchedule) =>
                        prevSchedule.id === schedule.id
                            ? {
                                ...prevSchedule,
                                registerStatus: "Registered",
                                disabled: true,
                                participants: currentVacancy === 'N/A' ? newScheduleRegistrations : newScheduleRegistrations + "/" + currentVacancy,
                            }
                            : prevSchedule
                    )
                );

                Swal.fire({
                    icon: "success",
                    title: "You have successfully registered"
                });
            }
        } catch (error) {
            console.error('Error during registration:', error);

            Swal.fire({
                icon: "error",
                title: "Registration Failed"
            })

            setSchedules((prevSchedules) =>
                prevSchedules.map((prevSchedule) =>
                    prevSchedule.id === schedule.id
                        ? { ...prevSchedule, registerStatus: "Register", disabled: false }
                        : prevSchedule
                )
            );

        } finally {
            setLoadingScheduleId(null);
        }
    };
    // #endregion

    return (
        <Wrapper>
            {!training ? (
                <Loading className="h-screen items-center" />
            ) : (
                <div className="p-4">
                    <div className="bg-white rounded-md mt-4 py-6 px-2 max-w-[1400px]">
                        {/* Image */}
                        <div className="mb-8 h-[200px] rounded-lg relative border border-gray-50 bg-gray-200">
                            {training.thumbnail ? (
                                <img
                                    src={`${config.domain}/wp-content/uploads/civicrm/custom/${training.thumbnail}`}
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            ) : (
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                    <CiFileOff className="text-[80px] text-gray-500" />
                                </div>
                            )}
                        </div>
                        {/* Header */}
                        <header className="w-full">
                            <h2 className="text-2xl text-black font-bold">{training.subject}</h2>
                            {training.details && (
                                <div className="flex flex-col lg:flex-row lg:space-x-[10%] mt-4">
                                    <div
                                        className="flex-grow lg:max-w-[60%] text-black/70"
                                        dangerouslySetInnerHTML={{ __html: training.details }}
                                    />
                                    <div className="flex-shrink lg:max-w-[30%] mt-4 lg:mt-0">
                                        <h3 className="text-xl text-black/90 font-semibold">Point Of Contact</h3>
                                        <div className="flex flex-col space-y-4 mt-4">
                                            <div className="flex items-center">
                                                <UserIcon className="w-5 h-5 mr-2 text-black/80" />
                                                <p className="text-black/70">{training.contact?.first_name + " " + training.contact?.last_name}</p>
                                            </div>
                                            <div className="flex items-center">
                                                <PhoneIcon className="w-5 h-5 mr-2 text-black/80" />
                                                <p className="text-black/70">{training.contact?.["phone_primary.phone_numeric"]}</p>
                                            </div>
                                            <div className="flex items-center">
                                                <EnvelopeOpenIcon className="w-5 h-5 mr-2 text-black/80" />
                                                <p className="text-black/70">{training.contact?.["email_primary.email"]}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </header>
                        <br />
                        {/* Schedules */}
                        <ScheduleTable schedules={schedules} type="Training" isLoading={!schedules || schedules.length === 0 && !dataFetched} />
                    </div>
                </div>
            )}
        </Wrapper>
    );
}