import { MouseEvent, useEffect, useState } from "react";
import { Contact } from "../../utils/classes/Contact";
import { Membership, MembershipStatus } from "../../utils/classes/Membership";
import moment from "moment";
import { Spinner } from "flowbite-react";
import swal from "sweetalert";
import CRM from "../../utils/crm";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../../../config";

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
                const memberships = await contact.fetchMemberships();
                setMemberships(memberships!);
            }
        })();
    }, []);

    const renewMembership = async (e: MouseEvent<HTMLButtonElement>, membership: Membership) => {
        e.preventDefault();
        setIsLoading(true);

        console.log("Update the Membership");
        await membership.update([
            ["start_date", moment(Date.now()).format("YYYY-MM-DD")],
            ["end_date", moment(Date.now() + 6.312e+10).format("YYYY-MM-DD")]
        ]);

        console.log("Create an activity called Membership Renewal");
        await CRM("Activity", "create", {
            values: [
                ["source_record_id", membership.id],
                ["source_contact_id", contact.id],
                ["target_contact_id", contact.id],
                ["activity_type_id:name", "Membership Renewal"],

            ]
        });

        const response = await axios.post(`${config.domain}/portal/api/create.php`,
            { items: [{ email: contact["email_primary.email"], amount: 10 * 100 }] },
            { headers: { "Content-Type": "application/json" } }
        );
        const { clientSecret } = response.data;
        navigate(`/checkout/${clientSecret}`);
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
                    <th></th>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {!memberships && <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-lg text-gray-500">Fetching information...</td>
                    </tr>}
                    {!!memberships && !memberships.length ? <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-lg text-gray-500">No membership history found</td>
                    </tr> : memberships && memberships.map(membership => {
                        return <tr>
                            <td className="px-3 text-lg py-4 whitespace-nowrap pl-6">{membership["membership_type_id:name"]}</td>
                            <td className="px-3 text-lg py-4 whitespace-nowrap pl-6">{moment(membership.start_date).format("DD MMM YYYY")} - {moment(membership.end_date).format("DD MMM YYYY")}</td>
                            <td className="px-3 text-lg py-4 whitespace-nowrap pl-6">
                                {membership.status_id != MembershipStatus.Expired ? "Ongoing" : "Expired"}
                            </td>
                            <td className="text-end pr-4">
                                <button onClick={e => renewMembership(e, membership)} className="bg-secondary py-1 w-[150px] text-white rounded-md disabled:bg-primary disabled:cursor-not-allowed" disabled={isLoading || ![MembershipStatus.Current, MembershipStatus.New, MembershipStatus.Expired].includes(membership.status_id) || Date.now() < new Date(membership.end_date).getTime() - 6.048e+8}>
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

{/* renew memberships */ }
{/* {(!!memberships && !!latest) && <butto n onClick={renewMembership} className="bg-secondary py-1 w-[150px] text-white rounded-md disabled:bg-primary disabled:cursor-not-allowed" disabled={isLoading || (Date.now() < (new Date(latest["Membership_Purchase_Details.Expiration_Date"]!).getTime() - 6.048e+8))}>{isLoading ? <Spinner className="fill-secondary text-primary w-5 h-5" /> : "Renew Membership"}</butto>} */ }

/**
 *     const renewMembership = async () => {
setIsLoading(true);
const amount = props.contact["Membership_Contact_Details.Membership"];

await props.contact.renewMembership(amount);
const response = await axios.post(`${config.domain}/portal/api/create.php`,
{ items: [{ email: props.contact["email_primary.email"], amount: amount * 100 }] },
{ headers: { "Content-Type": "application/json" } }
);
const { clientSecret } = response.data;

navigate(`/checkout/${clientSecret}`);
}

 */