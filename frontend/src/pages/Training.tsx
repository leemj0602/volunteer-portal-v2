import { useParams } from "react-router-dom";
import Wrapper from "../components/Wrapper";
import React, { useEffect, useState } from "react";
import { Training } from "../../utils/classes/Training";
import { TrainingSchedule } from "../../utils/classes/TrainingSchedule";
import TrainingManager from "../../utils/managers/TrainingManager";
import Loading from "../components/Loading";
import config from "../../../config";
import { CiFileOff } from "react-icons/ci";
import moment from "moment";
import swal from 'sweetalert';
import { UserIcon, PhoneIcon, EnvelopeOpenIcon } from '@heroicons/react/24/solid';
import ScheduleTable from "../components/ScheduleTable";

export default function TrainingPage() {
    const { id } = useParams();
    const [training, setTraining] = useState<Training>();
    const [schedules, setSchedules] = useState<any[]>([]);
    const [loadingScheduleId, setLoadingScheduleId] = useState<number | null>(null);
    const [vacancy, setVacancy] = useState<number | string>('N/A');
    const email = (window as any).email ?? config.email;

    useEffect(() => {
        (async () => {
            const training = await TrainingManager.fetch({ id }) as Training;
            setTraining(training);

            const trainingSchedules = await training?.fetchSchedules() as TrainingSchedule[];

            const trainingSchedulesTable = trainingSchedules.map((trainingSchedule: TrainingSchedule) => {
                const ID = trainingSchedule.id ?? null;
                const Start_Date_Time = trainingSchedule.activity_date_time ?? 'N/A';
                const Duration = trainingSchedule.training.duration ?? 0;
                const End_Date_Time = moment(Start_Date_Time).add(Duration, 'minutes');
                const Vacancy = trainingSchedule["Volunteer_Training_Schedule_Details.Vacancy"] ?? 'N/A';
                const NumRegistrations = trainingSchedule.registrations.length;
                const Registration_Start_Date = trainingSchedule["Volunteer_Training_Schedule_Details.Registration_Start_Date"] ?? 'N/A';
                let Registration_End_Date = trainingSchedule["Volunteer_Training_Schedule_Details.Registration_End_Date"] ?? 'N/A';
                const Expiration_Date = trainingSchedule["Volunteer_Training_Schedule_Details.Expiration_Date"] ?? 'N/A';
                const Location = trainingSchedule.location ?? 'N/A';
                const currentDate = moment();

                setVacancy(Vacancy)

                const userIsRegistered = isUserRegistered(trainingSchedule, email);
                const isRegistering = loadingScheduleId === trainingSchedule.id;

                if (Registration_End_Date === 'N/A') {
                    Registration_End_Date = Start_Date_Time;
                }

                let registerStatus;
                let disabled;

                if (userIsRegistered) {
                    registerStatus = 'Registered';
                    disabled = true;
                } else if (isRegistering) {
                    registerStatus = 'Registering';
                    disabled = true;
                } else if (
                    (Registration_Start_Date !== 'N/A' && currentDate.isBefore(moment(Registration_Start_Date))) ||
                    (Registration_End_Date !== 'N/A' && currentDate.isAfter(moment(Registration_End_Date)))
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

                return {
                    id: ID,
                    startDate: Start_Date_Time,
                    endDate: End_Date_Time,
                    participants: Vacancy === "N/A" ? NumRegistrations : NumRegistrations + "/" + Vacancy,
                    registrationEndDate: Registration_End_Date,
                    registerStatus: registerStatus,
                    disabled: disabled,
                    onClick: () => handleRegisterClick(trainingSchedule),
                    location: Location,
                    validThrough: Expiration_Date,
                }
            });
            setSchedules(trainingSchedulesTable);
        })();
    }, [id]);

    const isUserRegistered = (schedule: TrainingSchedule, email: string) => {
        return schedule.registrations.some(
            registration => registration["contact.email_primary.email"] === email
        );
    };

    const handleRegisterClick = async (schedule: TrainingSchedule) => {
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
                console.log(vacancy);
                setSchedules((prevSchedules) =>
                    prevSchedules.map((prevSchedule) =>
                        prevSchedule.id === schedule.id
                            ? {
                                ...prevSchedule,
                                registerStatus: "Registered",
                                disabled: true,
                                participants: vacancy === 'N/A' ? newScheduleRegistrations : newScheduleRegistrations + "/" + vacancy,
                            }
                            : prevSchedule
                    )
                );
                swal(`You have registered for ${schedule.subject}`, {
                    icon: "success",
                });
            }
        } catch (error) {
            console.error('Error during registration:', error);
            swal(`Registration failed`, {
                icon: "error"
            });

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
                        <ScheduleTable schedules={schedules} />
                    </div>
                </div>
            )}
        </Wrapper>
    );
}