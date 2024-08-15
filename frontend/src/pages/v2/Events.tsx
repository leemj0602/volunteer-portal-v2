import { useState } from "react";
import Loading from "../../components/Loading";
import Wrapper from "../../components/Wrapper";
import { useSearchParams } from "react-router-dom";
import { EventRole } from "../../../utils/classes/EventRole";
import { CustomField } from "../../../utils/managers/CustomFieldSetManager";
import config from "../../../../config";

export default function Events() {
    const [eventRoles, setEventRoles] = useState<EventRole[]>();
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [searchParams, setSearchParams] = useSearchParams();
    const [customFields, setCustomFields] = useState<Map<string, CustomField>>();
    const email = (window as any).email ?? config.email;

    return <Wrapper>
        {!customFields ? <Loading className="h-screen items-center" /> : <div className="p-4 mb-12"></div>}
    </Wrapper>
}