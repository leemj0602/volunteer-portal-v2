import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Contact } from "../../../../../utils/classes/Contact";
import { JobRequest } from "../../../../../utils/classes/JobRequest";
import Table from "../../../../components/Table";
import Body from "../../../../components/Table/Body";
import Cell from "../../../../components/Table/Cell";
import Header from "../../../../components/Table/Header";
import PageNavigation from "../../../../components/PageNavigation";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import Status from "../../../../components/Table/Status";
import { AiOutlineStop } from "react-icons/ai";

interface JobRequestsProps {
    contact: Contact;
    requests: JobRequest[];
    setRequests: Dispatch<SetStateAction<JobRequest[] | undefined>>;
}

const limit = 5;

const order = ["Requested", "Pending", "Unapproved"];

const statusColor: { [key: string]: string } = {
    "Requested": "bg-[#FFB656]",
    "Pending": "bg-[#F0D202]",
    "Unapproved": "bg-[#efb7c0]",
}

export default function JobRequests(props: JobRequestsProps) {
    const [currRequests, setCurrRequests] = useState<JobRequest[]>();

    const navigate = useNavigate();
    const [page, setPage] = useState(0);
    const pages = Math.ceil(props.requests.length / limit) - 1;
    const previousPage = () => {
        if (page - 1 <= 0) setPage(0);
        else setPage(page - 1);
    }
    const nextPage = () => {
        if (page >= pages) setPage(pages);
        else setPage(page + 1);
    }

    useEffect(() => {
        // #region Status
        const currRequests = props.requests.map(request => {
            request.status = "Logic Incorrect";
            switch (request["status_id:name"]) {
                case "Completed": request.status = "Requested";
                    break;
                case "Approval Required": request.status = "Pending";
                    break;
                case "Not Approved": request.status = "Unapproved";
                    break;
            }

            return request;
        });
        // #endregion

        // #region Sort Status
        currRequests.sort((a, b) => {
            if (order.indexOf(a.status) - order.indexOf(b.status) != 0) return order.indexOf(a.status) - order.indexOf(b.status);

            if (a.status == "Requested" && b.status == "Requested") return new Date(a.activity_date_time!).getTime() - new Date(b.activity_date_time!).getTime();
            return new Date(b.activity_date_time!).getTime() - new Date(a.activity_date_time!).getTime();
        });
        // #endregion

        setCurrRequests(currRequests);
    }, [props.requests]);

    return <div>
        <Table header="Job Requests">
            <Header>
                <Cell className="text-lg font-semibold w-1/4">Subject</Cell>
                <Cell className="text-lg font-semibold w-1/4">Date & Time</Cell>
                <Cell className="text-lg font-semibold w-1/6">Status</Cell>
                <Cell className="text-lg font-semibold w-1/6">Action</Cell>
            </Header>
            <Body>
                {!currRequests?.length ? <tr>
                    <Cell colSpan={5} className="text-center text-lg text-gray-500">No job request history available</Cell>
                    {/* Slices and shows only 5 entities per page */}
                </tr> : currRequests.slice(page * limit, page + ((page + 1) * limit)).map((request, index) => {
                    let subject = `${request["Job_Request_Details.Category:label"] ? `${request["Job_Request_Details.Category:label"]} - ` : ""} ${request.subject}`;
                    if (subject.length > 37) subject = `${subject.slice(0, 37)}...`;

                    return <tr key={index}>
                        {/* Subject */}
                        <Cell>
                            <button onClick={() => navigate("requests")}>
                                {subject}
                            </button>
                        </Cell>
                        {/* Date & Time */}
                        <Cell>
                            {moment(request.activity_date_time!).format("DD/MM/yyyy hh:mm A")}
                        </Cell>
                        {/* Status */}
                        <Cell>
                            <Status className={statusColor[request.status]}>
                                {request.status}
                            </Status>
                        </Cell>
                        {/* Action */}
                        <Cell>
                            <button className="flex items-center" onClick={() => navigate("requests")}>
                                <AiOutlineStop className="mr-2" /> Cancel
                            </button>
                        </Cell>
                    </tr>
                })}
            </Body>
        </Table>
        <PageNavigation page={page} pages={pages} limit={limit} array={props.requests} previousPage={previousPage} nextPage={nextPage} />
    </div>
}
