import { useEffect, useState } from "react";
import Wrapper from "../../../components/Wrapper";
import { Contact } from "../../../../utils/classes/Contact";
import ContactManager from "../../../../utils/managers/ContactManager";
import { JobRequest } from "../../../../utils/classes/JobRequest";
import Loading from "../../../components/Loading";

export default function Patient() {
    const email = (window as any).email;
    const [contact, setContact] = useState<Contact>();
    const [jobRequests, setJobRequests] = useState<JobRequest[]>();

    useEffect(() => {
        (async () => {
            const contact = await ContactManager.fetch(email);
            if (!contact) alert("Cannot fetch contact");

            const jobRequests = await contact.fetchJobRequests();
            setJobRequests(jobRequests)
        })();
    }, []);

    return (
        <Wrapper>
            {!jobRequests ? <Loading className="h-screen items-center" /> : <div className="p-4 mb-12">
                <div className="w-full px-0 md:px-6 max-w-[1200px] mx-auto">
                    <h1>Patient Dashboard</h1>
                    {jobRequests.map((jobRequest, index) => (
                        <div key={index}>
                            <p>{jobRequest.subject}</p>
                            <p>{jobRequest.details}</p>
                            <p>{jobRequest["Job_Request_Details.Category:label"]}</p>
                            <p>{jobRequest["status_id:name"]}</p>
                            <p>{jobRequest.activity_date_time}</p>
                        </div>
                    ))}
                </div>
            </div>}
        </Wrapper>
    );
}