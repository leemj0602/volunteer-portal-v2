import { useState } from "react";
import { Contribution } from "../../../../utils/v2/entities/Contribution"
import Table from "../../../components/Table";
import Body from "../../../components/Table/Body";
import Cell from "../../../components/Table/Cell";
import Header from "../../../components/Table/Header";
import numeral from "numeral";
import moment from "moment";
import PageNavigation from "../../../components/PageNavigation";
import { HiOutlineMail } from "react-icons/hi";
import CRM from "../../../../utils/crm";
import Swal from "sweetalert2";
import ContactManager from "../../../../utils/managers/ContactManager";

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

    const createRequest = async () => {
        const contact = await ContactManager.fetch(email);
        const response = await CRM("Activity", "create", { 
            values: [
                ["source_contact_id", contact.id],
                ["target_contact_id", contact.id],
                ["activity_type_id:name", "Contribution Receipt"]
            ]
        });
        console.log(response);

        if (response) await Swal.fire({ icon: "success", title: "A receipt has been sent to your email" });
        else await Swal.fire({ icon: "error", title: "An error occurred", text: "Please try again later." });
    }

    return <div className={props.className}>
        <Table header="History">
            <Header>
                <Cell className="text-lg font-semibold w-1/6">Type</Cell>
                <Cell className="text-lg font-semibold w-1/5">Amount {"(S$)"}</Cell>
                <Cell className="text-lg font-semibold">Date</Cell>
                <Cell className="text-lg font-semibold text-right">Receipt</Cell>
            </Header>
            <Body>
                {!props.donations.length ? <tr>
                    <Cell colSpan={2} className="text-center text-lg text-gray-500">No donations can be found</Cell>
                </tr> : props.donations.slice(page * limit, page + ((page + 1) * limit)).map((donation, index) => {
                    return <tr key={index}>
                        {/* Type */}
                        <Cell>{donation.data["financial_type_id:label"]}</Cell>
                        {/* Amount */}
                        <Cell>S$ {numeral(donation.data.total_amount).format('0,0.00')}</Cell>
                        {/* Date */}
                        <Cell>{moment(donation.data.receive_date!).format('DD/MM/yyyy hh:mm a')}</Cell>
                        {/* Receipt */}
                        <Cell className="text-right">
                            <button className="text-secondary hover:text-primary" onClick={createRequest}>
                                Send Receipt
                            </button>
                        </Cell>
                    </tr>
                })}
            </Body>
        </Table>
        <PageNavigation page={page} pages={pages} limit={limit} array={props.donations} previousPage={previousPage} nextPage={nextPage} />
    </div>
}