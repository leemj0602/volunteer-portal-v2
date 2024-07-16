import { useEffect, useState } from "react"
import ContactManager from "../../utils/managers/ContactManager";
import CustomFieldSetManager, { CustomField } from "../../utils/managers/CustomFieldSetManager";
import config from "../../../config";
import Wrapper from "../components/Wrapper";
import { Contact } from "../../utils/classes/Contact";

export default function Home() {
    const [contact, setContact] = useState<Contact>();
    const email = (window as any).email ?? config.email;
    
    useEffect(() => {
        (async () => {
            const contact = await ContactManager.fetch(email);
            setContact(contact);
            const registeredEventRoles = await contact.fetchRegisteredEventRoles();
            console.log(registeredEventRoles);
        })();
    }, []);

    return <Wrapper>
        <div>
            <h1>Testing 123.</h1>
        </div>
    </Wrapper>
}