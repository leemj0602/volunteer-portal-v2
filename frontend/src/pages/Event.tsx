import { useNavigate, useParams } from "react-router-dom";
import Wrapper from "../components/Wrapper";
import { useEffect, useState } from "react";
import { EventRole } from "../../utils/classes/EventRole";
import EventRoleManager from "../../utils/managers/EventRoleManager";

export default function Event() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [eventRole, setEventRole] = useState<EventRole>();

    useEffect(() => {
        (async function() {
            const eventRole = await EventRoleManager.fetch({ id }) as EventRole;
            console.log(eventRole);
        })();
    }, []);

    return <Wrapper>

    </Wrapper>
}