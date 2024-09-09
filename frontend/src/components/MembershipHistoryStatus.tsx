import { useEffect, useState } from "react"
import { Contact } from "../../utils/classes/Contact";
import moment from "moment";
import { MembershipHistory } from "../../utils/classes/MembershipHistory";

interface MembershipHistoryStatus {
    contact: Contact;
}
export default function MembershipHistoryStatus(props: MembershipHistoryStatus) {
    const [membershipHistories, setMembershipHistories] = useState<MembershipHistory[]>();

    useEffect(() => {
        (async () => {
            if (props.contact) {
                const membershipHistories = await props.contact.fetchMembershipHistory();
                setMembershipHistories(membershipHistories ?? []);
            }
        })();
    }, []);

    return <div className="my-6">
        <div className="flex justify-between mb-5">
            <h2 className="text-3xl font-semibold">Membership Purchase History</h2>
        </div>
        <div className="border-white rounded-lg shadow-md overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
                <thead className="bg-white">
                    <th className="px-6 py-5 text-left text-xl font-semibold text-black w-1/5">Date</th>
                    <th className="px-6 py-5 text-left text-xl font-semibold text-black w-1/5">Membership</th>
                    <th className="px-6 py-5 text-left text-xl font-semibold text-black w-3/5">Activity</th>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {!membershipHistories && <tr>
                        <td colSpan={3} className="px-6 py-4 text-center text-lg text-gray-500">Fetching information...</td>
                    </tr>}
                    {!!membershipHistories && !membershipHistories.length ? <tr>
                        <td colSpan={3} className="px-6 py-4 text-center text-lg text-gray-500">No membership purchase history found</td>
                    </tr> : membershipHistories && membershipHistories.map((membership, i) => {
                        return <tr>
                            <td className="px-3 text-lg py-4 whitespace-nowrap pl-6">{moment(membership.activity_date_time).format("LLL")}</td>
                            <td className="px-3 text-lg py-4 whitespace-nowrap pl-6">{membership["membership.membership_type_id:label"]}</td>
                            <td className="px-3 text-lg py-4 whitespace-nowrap pl-6">{membership["activity_type_id:name"]}</td>
                        </tr>
                    })}
                </tbody>
            </table>
        </div>
    </div>
}