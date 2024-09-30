import { useState } from "react";
import { Contribution } from "../../../../utils/v2/entities/Contribution"
import Table from "../../../components/Table";
import Body from "../../../components/Table/Body";
import Cell from "../../../components/Table/Cell";
import Header from "../../../components/Table/Header";
import numeral from "numeral";
import moment from "moment";
import { inflect } from "inflection";
import PageNavigation from "../../../components/PageNavigation";

interface HistoryProps {
    donations: Contribution[];
    className?: string;
}

const limit = 10;

export default function History(props: HistoryProps) {
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

    return <div className={props.className}>
        <Table header="History">
            <Header>
                <Cell className="text-lg font-semibold w-1/6">Type</Cell>
                <Cell className="text-lg font-semibold w-1/5">Amount {"(S$)"}</Cell>
                <Cell className="text-lg font-semibold">Date</Cell>
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
                    </tr>
                })}
            </Body>
        </Table>
        <PageNavigation page={page} pages={pages} limit={limit} array={props.donations} previousPage={previousPage} nextPage={nextPage} />
    </div>
}