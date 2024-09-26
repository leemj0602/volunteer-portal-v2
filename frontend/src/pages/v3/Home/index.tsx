import { useEffect, useState } from "react";
import Wrapper from "../../../components/Wrapper";
import { Contact } from "../../../../utils/classes/Contact";
import ContactManager from "../../../../utils/managers/ContactManager";
import Loading from "../../../components/Loading";
import Header from "./componenets/Header";
import Statistics from "./componenets/Statistics";
import { EventRegistration } from "../../../../utils/classes/EventRegistration";
import EventRegistrations from "./componenets/EventRegistrations";
import TrainingRegistrations from "./componenets/TrainingRegistrations";
import UpcomingEvents from "./componenets/UpcomingEvents";
import { TrainingRegistration } from "../../../../utils/classes/TrainingRegistration";

export default function Home3() {
    const email = (window as any).email;
    const [contact, setContact] = useState<Contact>();
    const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>();
    const [trainingRegistrations, setTrainingRegistrations] = useState<TrainingRegistration[]>();

    useEffect(() => {
        (async () => {
            const contact = await ContactManager.fetch(email);
            if (!contact) alert("Cannot fetch contact");

            const eventRegistrations = await contact.fetchEventRegistrations();
            setEventRegistrations(eventRegistrations);
            setTrainingRegistrations(await contact.fetchTrainingRegistrations());
            setContact(contact);
        })();
    }, []);

    return <Wrapper>
        {!contact ? <Loading className="h-screen items-center" /> : <div className="p-4 mb-12">
            <div className="w-full px-0 md:px-6 max-w-[1200px] mx-auto">
                {/* Displays their name and email */}
                <Header contact={contact} />
                {/* Displays their hours and attended events */}
                <Statistics registrations={eventRegistrations!} />
                {/* Displays all their event registrations */}
                <EventRegistrations contact={contact} registrations={eventRegistrations!} setRegistrations={setEventRegistrations} />
                {/* Shows upcoming events */}
                <UpcomingEvents registrations={eventRegistrations!} />
                {/* Displays all their training registrations */}
                <TrainingRegistrations contact={contact} registrations={trainingRegistrations!} setRegistrations={setTrainingRegistrations} />
            </div>
        </div>}
    </Wrapper>
}