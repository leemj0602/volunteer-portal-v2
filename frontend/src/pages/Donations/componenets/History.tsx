import { useState } from "react";
import { Contribution } from "../../../../utils/v2/entities/Contribution"
import Table from "../../../components/Table";
import Body from "../../../components/Table/Body";
import Cell from "../../../components/Table/Cell";
import Header from "../../../components/Table/Header";
import numeral from "numeral";
import moment from "moment";
import PageNavigation from "../../../components/PageNavigation";
import CRM from "../../../../utils/crm";
import Swal from "sweetalert2";
import ContactManager from "../../../../utils/managers/ContactManager";
import config from "../../../../../config";
import axios from "axios";
import { MdOutlineMail } from "react-icons/md";

interface HistoryProps {
    donations: Contribution[];
    className?: string;
}

const limit = 10;

export default function History(props: HistoryProps) {
    const email = (window as any).email;
    const [page, setPage] = useState(0);
    const pages = Math.ceil(props.donations.length / limit) - 1;
    const previousPage = () => {
        if (page - 1 < 0) setPage(0);
        else setPage(page - 1);
    }
    const nextPage = () => {
        if (page >= pages) setPage(pages);
        else setPage(page + 1);
    }

    const createRequest = async (contribution: Contribution) => {
        const contact = await ContactManager.fetch(email);
        const response = await CRM("MessageTemplate", "get", { select: ["id"], where: [["msg_title", "=", "Contributions - Receipt (on-line)"]], limit: 1 }).catch(() => null);
        if (!response) return Swal.fire({ icon: "error", title: "An error occurred", text: "I wasn't able to fetch the receipt. Please contact an Administrator for further help." });
        const template = response.data[0];

        Swal.fire({ title: "Sending receipt...", timerProgressBar: true, timer: 5000, showConfirmButton: false });
        const result = await axios.post(`${config.domain}/portal/api/send_email.php`, { contactId: contact.id, templateId: template.id, contributionId: contribution.data.id }).catch(() => null);
        if (!result) return Swal.fire({ icon: "error", title: "An error occurred", text: "I wasn't able to send you the receipt. Please contact an Administrator further help." });
        Swal.fire({ 
            icon: "success", 
            title: `A receipt has been sent to ${email}`, 
            text: "Thank you for your contributions!",
            timer: 3000,
            timerProgressBar: true
        });
    }

    return <div className={props.className}>
        <Table header="History">
            <Header>
                <Cell className="text-lg font-semibold w-1/5">Type</Cell>
                <Cell className="text-lg font-semibold w-1/6">Amount {"(S$)"}</Cell>
                <Cell className="text-lg font-semibold">Date</Cell>
                <Cell className="text-lg font-semibold w-2/5">Source</Cell>
                <Cell className="text-lg font-semibold">Payment</Cell>
                <Cell className="text-lg font-semibold text-right">Receipt</Cell>
            </Header>
            <Body>
                {!props.donations.length ? <tr>
                    <Cell colSpan={6} className="text-center text-lg text-gray-500">No donations can be found</Cell>
                </tr> : props.donations.slice(page * limit, page + ((page + 1) * limit)).map((donation, index) => {
                    return <tr key={index}>
                        {/* Type */}
                        <Cell>{donation.data["financial_type_id:label"]}</Cell>
                        {/* Amount */}
                        <Cell>S$ {numeral(donation.data.total_amount).format('0,0.00')}</Cell>
                        {/* Date */}
                        <Cell>{moment(donation.data.receive_date!).format('DD/MM/yyyy hh:mm a')}</Cell>
                        {/* Source */}
                        <Cell>{donation.data.source}</Cell>
                        {/* Payment */}
                        <Cell>{donation.data["payment_instrument_id:label"]}</Cell>
                        {/* Receipt */}
                        <Cell className="text-right">
                            <button className="text-secondary hover:text-primary" onClick={() => createRequest(donation)}>
                                <MdOutlineMail />
                            </button>
                        </Cell>
                    </tr>
                })}
            </Body>
        </Table>
        <PageNavigation page={page} pages={pages} limit={limit} array={props.donations} previousPage={previousPage} nextPage={nextPage} />
    </div>
}