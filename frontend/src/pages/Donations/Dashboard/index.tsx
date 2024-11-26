import { useEffect, useState } from "react";
import Wrapper from "../../../components/Wrapper";
import ContributionHandler from "../../../../utils/v2/handlers/ContributionHandler";
import { Contribution } from "../../../../utils/v2/entities/Contribution";
import Loading from "../../../components/Loading";
import Summarisation from "./components/Summarisation";
import History from "./components/History";
import numeral from "numeral";
import { useNavigate } from "react-router-dom";
import RecurringDonations from "./components/RecurringDonations";
import ContactManager from "../../../../utils/managers/ContactManager";
import { useSubtypesContext } from "../../../contexts/Subtypes";

export default function Donations() {
    const [donations, setDonations] = useState<Contribution[]>();
    const { setSubTypes } = useSubtypesContext()!;
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            const email = (window as any).email;
            const contact = await ContactManager.fetch(email);
            if (!contact.contact_sub_type?.includes('Donator')) {
                setSubTypes(contact.contact_sub_type);
                return navigate("/");
            }

            const donations = await ContributionHandler.fetch(email, [
                ["financial_type_id:label", "NOT IN", ["Campaign Contribution", "Event Fee", "Member Dues"]], 
                ["contribution_status_id:name", "=", "Completed"]
            ]);
            setDonations(donations);
        })();
    }, []);

    return <Wrapper>
        {!donations ? <Loading className="h-screen items-center" /> : <div className="p-4 mb-12">
            <div className="w-full px-0 md:px-6 max-w-[1200px] mx-auto">
                <h1 className="text-lg font-semibold">My Donations</h1>
                <div className="mt-4 bg-white rounded-md p-4 shadow-md">
                    <div className="mb-4">
                        <h2 className="text-2xl font-semibold mb-1">Total Contributions</h2>
                        <p className="text-2xl text-secondary">S$ {numeral(donations.reduce((a, b) => a + b.data.total_amount!, 0)).format('0,0.00')}</p>
                    </div>
                    <Summarisation donations={donations} />
                </div>
                <RecurringDonations className="mt-12" />
                <History className="mt-12" donations={donations} />
            </div>
        </div>}
    </Wrapper>
}