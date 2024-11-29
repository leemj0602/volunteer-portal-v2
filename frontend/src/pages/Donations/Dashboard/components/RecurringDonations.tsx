import { useEffect, useState } from "react";
import Table from "../../../../components/Table";
import ContactManager from "../../../../../utils/managers/ContactManager";
import RecurringDonationHandler from "../../../../../utils/v2/handlers/RecurringDonationHandler";
import Header from "../../../../components/Table/Header";
import Body from "../../../../components/Table/Body";
import Cell from "../../../../components/Table/Cell";
import config from "../../../../../../config.json";
import numeral from "numeral";
import moment from "moment";
import axios from "axios";
import Swal from "sweetalert2";
import { FcCancel } from "react-icons/fc";
import { Contact } from "../../../../../utils/classes/Contact";

interface RecurringDonationsProps {
    className?: string;
}

export default function RecurringDonations(props: RecurringDonationsProps) {
    const email = (window as any).email;
    const [contact, setContact] = useState<Contact>();
    const [subscriptions, setSubscriptions] = useState<any[]>();

    useEffect(() => {
        (async () => {
            const contact = await ContactManager.fetch(email);
            setContact(contact);
            fetchSubscriptions(contact);
        })();
    }, []);

    const fetchSubscriptions = async (contact: Contact) => {
        const recurringDonations = await RecurringDonationHandler.fetch(contact.id!);
        const subscriptions = await Promise.all(recurringDonations.map(r => r.fetchStripe()));
        setSubscriptions(subscriptions.filter(s => !s?.canceled_at));
    }

    const cancelSubscription = async (subscriptionId: string) => {
        Swal.fire({
            icon: "question",
            title: "Are you sure you want to cancel your subscription?",
            showCancelButton: true,
            showCloseButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "Nevermind"
        }).then(async res => {
            if (res.isConfirmed) {
                Swal.fire({ title: "Cancelling...", showConfirmButton: false });
                const response = await axios.post(`${config.domain}/portal/api/stripe/cancel_subscription.php`, { subscriptionId }).catch(() => null);
                if (!response) Swal.fire({ icon: "error", title: "An error has occurred", text: "This subscription may have already been cancelled. Refresh your page and try again." })
                else Swal.fire({ icon: "success", title: "Susbcription successfully cancelled!", showCloseButton: true, timer: 3000 });
                
                return fetchSubscriptions(contact!);
            }
        })
    }

    return <div className={props.className}>
        <Table header="Recurring Donation">
            <Header>
                <Cell className="text-lg font-semibold w-1/5">Amount {"(S$)"}</Cell>
                <Cell className="text-lg font-semibold w-1/6">Start Date</Cell>
                <Cell className="text-lg font-semibold w-1/6">Billing Start</Cell>
                <Cell className="text-lg font-semibold w-1/6">Billing End</Cell>
                <Cell className="text-lg font-semibold text-right">Cancellation</Cell>
            </Header>
            <Body>
                {!subscriptions ? <Cell colSpan={5} className="text-center text-lg text-gray-500">Fetching information...</Cell> : !subscriptions.length ? <Cell colSpan={5} className="text-center text-lg text-gray-500">No active recurring donation</Cell> : subscriptions.map(sub => {
                    return <tr>
                        <Cell>S$ {numeral(sub.items.data[0].price.unit_amount / 100).format('0,0.00')}</Cell>
                        <Cell>{moment(sub.created * 1000).format("DD/MM/yyyy")}</Cell>
                        <Cell>{moment(sub.current_period_start * 1000).format("DD/MM/yyyy")}</Cell>
                        <Cell>{moment(sub.current_period_end * 1000).format("DD/MM/yyyy")}</Cell>
                        <Cell className="flex justify-end">
                            <button className="flex items-center text-red-700 hover:text-red-400 gap-x-2" onClick={() => cancelSubscription(sub.id)}>
                                <FcCancel /> Cancel
                            </button>
                        </Cell>
                    </tr>
                })}
            </Body>
        </Table>
    </div>
}