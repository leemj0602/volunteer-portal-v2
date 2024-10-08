import { useEffect, useState } from "react";
import Wrapper from "../../components/Wrapper";
import ContributionHandler from "../../../utils/v2/handlers/ContributionHandler";
import { Contribution } from "../../../utils/v2/entities/Contribution";
import Loading from "../../components/Loading";
import Summarisation from "./componenets/Summarisation";
import History from "./componenets/History";
import numeral from "numeral";

export default function Donations() {
    const email = (window as any).email;
    const [donations, setDonations] = useState<Contribution[]>();

    useEffect(() => {
        (async () => {
            const donations = await ContributionHandler.fetch(email, [["financial_type_id:label", "NOT IN", ["Campaign Contribtuion", "Event Fee", "Member Dues"]], ["contribution_status_id:name", "=", "Completed"]]);
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
                <History className="mt-12" donations={donations} />
            </div>
        </div>}
    </Wrapper>
}