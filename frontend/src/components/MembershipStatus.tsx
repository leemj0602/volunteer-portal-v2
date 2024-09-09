import { MouseEvent, useEffect, useState } from "react";
import { Contact } from "../../utils/classes/Contact";
import { Membership, MembershipStatus } from "../../utils/classes/Membership";
import moment from "moment";
import { Spinner } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../../../config";
import swal from "sweetalert";

interface MembershipStatusSectionProps {
    contact: Contact;
}

export default function MembershipStatusSection({ contact }: MembershipStatusSectionProps) {
    const [memberships, setMemberships] = useState<Membership[]>();
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            if (contact) {
                const memberships = await contact.fetchMemberships() ?? [];
                setMemberships(memberships!);
            }
        })();
    }, []);

    const renewMembership = async (e: MouseEvent<HTMLButtonElement>, membership: Membership) => {
        e.preventDefault();
        setIsLoading(true);

        await contact.renewMembership(membership);

        if (membership["membership_type_id.minimum_fee"]) {
            const response = await axios.post(`${config.domain}/portal/api/create.php`,
                { items: [{ email: contact["email_primary.email"], amount: membership["membership_type_id.minimum_fee"]! * 100 }] },
                { headers: { "Content-Type": "application/json" } }
            );
            const { clientSecret } = response.data;
            navigate(`/checkout/${clientSecret}`);
        }
        else {
            setIsLoading(false);
            setMemberships(await contact.fetchMemberships() ?? []);
            swal("You have renewed your subscription!", { icon: "success" })
        }
    }

    return <div className="my-6">
        <div className="flex justify-between mb-5">
            <h2 className="text-3xl font-semibold">Membership Status</h2>
        </div>
        <div className="border-white roudned-lg shadow-md overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
                <thead className="bg-white">
                    <th className="px-6 py-5 text-left text-xl font-semibold text-black w-1/5">Membership</th>
                    <th className="px-6 py-5 text-left text-xl font-semibold text-black w-1/5">Date</th>
                    <th className="px-6 py-5 text-left text-xl font-semibold text-black w-1/5">Status</th>
                    <th className="px-6 py-5 text-left text-xl font-semibold text-black w-1/5">Fee</th>
                    <th></th>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {!memberships && <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-lg text-gray-500">Fetching information...</td>
                    </tr>}
                    {memberships?.length == 0 ? <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-lg text-gray-500">No membership history found</td>
                    </tr> : memberships && memberships.map(membership => {
                        return <tr>
                            <td className="px-3 text-lg py-4 whitespace-nowrap pl-6">{membership["membership_type_id:name"]}</td>
                            <td className="px-3 text-lg py-4 whitespace-nowrap pl-6">{moment(membership.start_date).format("DD MMM YYYY")} - {moment(membership.end_date).format("YYYY")}</td>
                            <td className="px-3 text-lg py-4 whitespace-nowrap pl-6">
                                {membership.status_id != MembershipStatus.Expired ? "Ongoing" : "Expired"}
                            </td>
                            <td className="px-3 text-lg py-4 whitespace-nowrap pl-6">
                                SGD {membership["membership_type_id.minimum_fee"]?.toFixed(2) ?? "-"}
                            </td>
                            <td className="text-end pr-4">
                                <button onClick={e => renewMembership(e, membership)} className="bg-secondary py-1 w-[150px] text-white rounded-md disabled:bg-primary disabled:cursor-not-allowed" disabled={isLoading || ![MembershipStatus.Current, MembershipStatus.New, MembershipStatus.Expired, MembershipStatus.Grace].includes(membership.status_id) || Date.now() < new Date(membership.end_date).getTime() - 6.048e+8}>
                                    {isLoading ? <Spinner className="fill-secondary text-primary w-5 h-5" /> : "Renew Membership"}
                                </button>
                            </td>
                        </tr>
                    })}
                </tbody>
            </table>
        </div>
    </div>
}