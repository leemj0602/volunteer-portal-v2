import { useEffect, useState } from "react";
import Wrapper from "../../components/Wrapper";
import ContributionHandler from "../../../utils/v2/handlers/ContributionHandler";
import { Contribution } from "../../../utils/v2/entities/Contribution";
import Loading from "../../components/Loading";
import numeral from "numeral";
import Swal from "sweetalert2";
import SystemHandler from "../../../utils/v2/handlers/SystemHandler";
import { useNavigate, useParams } from "react-router-dom";

export default function QRCheckIn() {
    const navigate = useNavigate();

    const { eventRoleId, contactId, duration } = useParams();
    const [donations, setDonations] = useState<Contribution[]>();
    const email = (window as any).email;
    const roles = (window as any).roles;

    useEffect(() => {
        if (roles.includes('administrator')) {
            
        } else {
            Swal.fire({
                icon: "error",
                title: "Access Denied",
                text: "You are not allowed to access this page.",
            })
            navigate("/");
        }

        (async () => {
            const system = await SystemHandler.fetch()!;
            if (!system?.data.civi?.components.includes("CiviContribute")) navigate("/");

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
                </div>
            </div>
        </div>}
    </Wrapper>
}