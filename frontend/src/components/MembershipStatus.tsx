import { useEffect, useState } from "react"
import { Contact } from "../../utils/classes/Contact";
import { MembershipPurchase } from "../../utils/classes/MembershipPurchase";
import moment from "moment";
import Loading from "./Loading";
import { Spinner } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../../../config";

interface MembershipStatusProps {
    contact: Contact;
}
export default function MembershipStatus(props: MembershipStatusProps) {
    const navigate = useNavigate();
    const [latest, setLatest] = useState<MembershipPurchase>();
    const [memberships, setMemberships] = useState<MembershipPurchase[]>();
    const [isLoading, setIsLoading] = useState(false);
    
    useEffect(() => {
        (async () => {
            if (props.contact) {
                const latest = await props.contact.fetchMemberships({ limit: 1 });
                const memberships = await props.contact.fetchMemberships();
                setLatest(latest?.length ? latest[0] : undefined);
                setMemberships(memberships ?? []);
            }
        })();
    }, []);

    const renewMembership = async () => {
        setIsLoading(true);
        const amount = props.contact["Membership_Contact_Details.Membership"];

        await props.contact.renewMembership(amount);
        const response = await axios.post(`${config.domain}/portal/api/create.php`, 
            { items: [{ email: props.contact["email_primary.email"], amount: amount * 100 }]},
            { headers: { "Content-Type": "application/json" }}
        );
        const { clientSecret } = response.data;
        
        navigate(`/checkout/${clientSecret}`);
    }

    return <div className="mt-6">
        <div className="flex justify-between mb-5">
            <h2 className="text-3xl font-semibold">Membership History</h2>
            {/* renew memberships */}
            {(!!memberships && !!latest) && <button onClick={renewMembership} className="bg-secondary py-1 w-[150px] text-white rounded-md disabled:bg-primary disabled:cursor-not-allowed" disabled={isLoading || (Date.now() < (new Date(latest["Membership_Purchase_Details.Expiration_Date"]!).getTime() - 6.048e+8))}>{isLoading ? <Spinner className="fill-secondary text-primary w-5 h-5" /> : "Renew Membership"}</button>}
        </div>
        <div className="border-white rounded-lg shadow-md overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
                <thead className="bg-white">
                    <th className="px-6 py-5 text-left text-xl font-semibold text-black w-1/4">Date</th>
                    <th className="px-6 py-5 text-left text-xl font-semibold text-black w-1/4">Price</th>
                    <th className="px-6 py-5 text-left text-xl font-semibold text-black w-1/2">Expiration</th>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {!memberships && <tr>
                        <td colSpan={3} className="px-6 py-4 text-center text-lg text-gray-500">Fetching information...</td>
                    </tr>}
                    {!!memberships && !memberships.length ? <tr>
                        <td colSpan={3} className="px-6 py-4 text-center text-lg text-gray-500">No membership purchase history found</td>
                    </tr> : memberships && <>
                        {/* Go through each membership */}
                        {memberships.map(membership => <tr>
                            <td className="px-3 text-lg py-4 whitespace-nowrap pl-6">{moment(membership.activity_date_time!).format("DD/MM/YYYY")}</td>
                            <td className="px-3 text-lg py-4 whitespace-nowrap pl-6">SGD {membership["Membership_Purchase_Details.Pricing"]?.toFixed(2)}</td>
                            <td className="px-3 text-lg py-4 whitespace-nowrap pl-6">{moment(membership["Membership_Purchase_Details.Expiration_Date"] ?? moment(membership.activity_date_time!).add(2, "years")).format("DD/MM/YYYY")}</td>
                        </tr>)}
                    </>}
                </tbody>
            </table>
        </div>
    </div>
}