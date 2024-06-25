import { useEffect } from "react";
import Wrapper from "../components/Wrapper";
import { EventRoleManager } from "../../utils/managers/EventRoleManager";

export default function Events() {
    useEffect(() => {
        const eventRoleManager = new EventRoleManager();
        (async () => {
            console.log(await eventRoleManager.fetchEventRoles());
        })();
    }, []);
    return <Wrapper>
        <h1>Hello World.</h1>
    </Wrapper>
}