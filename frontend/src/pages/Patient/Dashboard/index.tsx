import { useEffect, useState } from "react";
import Wrapper from "../../../components/Wrapper";
import { Contact } from "../../../../utils/classes/Contact";
import ContactManager from "../../../../utils/managers/ContactManager";
import { JobRequest } from "../../../../utils/classes/JobRequest";
import Loading from "../../../components/Loading";
import JobRequests from "./components/JobRequests";
import Header from "../../Volunteer/Dashboard/components/Header";

export default function Patient() {
    const email = (window as any).email;
    const [contact, setContact] = useState<Contact>();
    const [jobRequests, setJobRequests] = useState<JobRequest[]>();

    useEffect(() => {
        (async () => {
            const contact = await ContactManager.fetch(email);
            if (!contact) alert("Cannot fetch contact");

            const jobRequests = await contact.fetchJobRequests();
            setJobRequests(jobRequests);
            setContact(contact);
        })();
    }, []);

    return (
        <Wrapper>
            {!contact ? <Loading className="h-screen items-center" /> : <div className="p-4 mb-12">
                <div className="w-full px-0 md:px-6 max-w-[1200px] mx-auto">
                    <Header contact={contact} />
                    <JobRequests contact={contact} requests={jobRequests!} setRequests={setJobRequests} />
                </div>
            </div>}
        </Wrapper>
    );
}