import { useEffect, useState } from "react";
import { Contact } from "../../../../../utils/classes/Contact";
import Table from "../../../../components/Table";
import Body from "../../../../components/Table/Body";
import Cell from "../../../../components/Table/Cell";
import Header from "../../../../components/Table/Header";
import { AcceptedJobStatus, JobRequest, JobRequestStatus } from "../../../../../utils/classes/JobRequest";
import JobRequestManager from "../../../../../utils/managers/JobRequestManager";
import moment from "moment";
import PageNavigation from "../../../../components/PageNavigation";
import Status from "../../../../components/Table/Status";
import Swal from "sweetalert2";

interface AcceptedJobProps {
  contact: Contact;
}

const limit = 5;
const statusColor: { [key: string]: string } = {
  "Pending": "bg-[#F0D202]",
  "Cancelled": "bg-[#f26a6a]",
  "Completed": "bg-[#7bcf72]",
  "Cancelled By Client": "bg-gray-200 text-[#f26a6a]",
};


export default function AcceptedJobs(props: AcceptedJobProps) {
  const [page, setPage] = useState(0);
  const [jobs, setJobs] = useState<JobRequest[]>();
  const [pages, setPages] = useState(0);

  const previousPage = () => {
    if (page - 1 <= 0) setPage(0);
    else setPage(page - 1);
  }

  const nextPage = () => {
    if (page >= pages) setPage(pages);
    else setPage(page + 1);
  }

  const handleView = (job: JobRequest) => {
    Swal.fire({
      html: `<b>Request Type:</b><br/>${job["Job_Request_Details.Request_Type:label"]}<br/><br/><b>Date & Time:</b><br/>${moment(job.activity_date_time!).format("DD/MM/yyyy hh:mm A")}<br/><br/><b>Location:</b><br/>${job.location}<br/><br/><b>Description:</b><br>${job.details}`,
      showCloseButton: true,
      showConfirmButton: false
    })
  }

  useEffect(() => {
    (async () => {
      const jobs = await JobRequestManager.fetchAll({ where: [["accepted_job.source_contact_id", "=", props.contact.id]] });
      const pages = Math.ceil(jobs.length / limit) - 1;
      setPages(pages);
      setJobs(jobs)
    })();
  }, []);

  return <div>
    <Table header="Accepted Jobs">
      <Header>
        <Cell className="text-lg font-semibold w-1/4">Request Type</Cell>
        <Cell className="text-lg font-semibold w-1/4">Due Date</Cell>
        <Cell className="text-lg font-semibold w-1/4">Status</Cell>
        <Cell className="text-lg font-semibold w-1/4">Location</Cell>
      </Header>
      <Body>
        {/* Jobs haven't been fetched yet */}
        {!jobs ? <tr><Cell colSpan={4} className="text-center text-lg text-gray-500">Fetching data...</Cell></tr>
          : !jobs?.length ? <tr>
            {/* Jobs have been fetched but they hadn't accepted a job */}
            <Cell colSpan={4} className="text-center text-lg text-gray-500">You have not accepted any jobs</Cell>
          </tr> : jobs.slice(page * limit, page + ((page + 1) * limit)).map((job, i) => {
            let status = job["accepted_job.status_id:name"] as string;
            if (job["status_id:name"] != JobRequestStatus.Approved) {
              if (job["status_id:name"] == JobRequestStatus.Cancelled) status = "Cancelled by Client";
              else status = job["status_id:name"];
            }

            // If they have accepted jobs before
            return <tr key={i}>
              <Cell>
                <button className="text-secondary hover:text-primary cursor-pointer" onClick={() => handleView(job)}>
                  {job["Job_Request_Details.Request_Type:label"]}{job["Job_Request_Details.Request_Type:label"]!.length > 37 ? "..." : ""}
                </button>
              </Cell>
              <Cell>{moment(job.activity_date_time!).format('DD/MM/YYYY hh:mm A')}</Cell>
              <Cell><Status className={statusColor[status]}>{status}</Status></Cell>
              <Cell>{job.location}</Cell>
            </tr>
          })}
      </Body>
    </Table>
    {jobs && <PageNavigation page={page} pages={pages} limit={limit} array={jobs} previousPage={previousPage} nextPage={nextPage} />}
  </div>
}