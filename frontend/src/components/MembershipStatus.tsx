import { useEffect, useState } from "react"
import { Contact } from "../../utils/classes/Contact";
import { MembershipPurchase } from "../../utils/classes/MembershipPurchase";

interface MembershipStatusProps {
    contact: Contact;
}
export default function MembershipStatus(props: MembershipStatusProps) {
    const [memberships, setMemberships] = useState<MembershipPurchase[]>();
    useEffect(() => {
        (async () => {
            if (props.contact) {
                const memberships = await props.contact.fetchMemberships();
                setMemberships(memberships ?? []);    
            }
        })();
    }, [props.contact]);


    return <div className="mt-6">
    <h2 className="text-3xl font-semibold mb-5">Membership History</h2>
    <div className="border-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-white">
                <th className="px-6 py-5 text-left text-xl font-semibold text-black w-1/3">Date</th>
                <th className="px-6 py-5 text-left text-xl font-semibold text-black w-1/3">Price</th>
                <th className="px-6 py-5 text-left text-xl font-semibold text-black w-1/3">Expiration Date</th>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {!memberships && <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-lg text-gray-500">Fetching information...</td>
                </tr>}
                {!!memberships && !memberships.length ? <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-lg text-gray-500">No membership purchase history found</td>
                </tr> : <tr>todo: go through each membership purchase history</tr>}
            </tbody>
        </table>
    </div>
</div>
}