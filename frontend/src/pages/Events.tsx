import { useEffect } from "react";
import Wrapper from "../components/Wrapper";
import EventRoleManager from "../../utils/managers/EventRoleManager";

export default function Events() {
    useEffect(() => {
        (async () => {
            console.log(await EventRoleManager.fetch());
        })();
    }, []);
    return <Wrapper>
        <h1>Hello World.</h1>
    </Wrapper>
}