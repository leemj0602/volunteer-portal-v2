import moment from "moment";
import { JobRequest } from "../../../../../utils/classes/JobRequest"
import { useState } from "react";
import JobRequestManager from "../../../../../utils/managers/JobRequestManager";
import Swal from "sweetalert2";
import ContactManager from "../../../../../utils/managers/ContactManager";
import { Spinner } from "flowbite-react";

interface JobRequestTabProps {
  job: JobRequest;
  updateJobs: () => Promise<void>;
}

export default function JobRequestTab(props: JobRequestTabProps) {
  const email = (window as any).email;
  const [collapsed, setCollapsed] = useState(props.job.details!.length > 300);
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    const [job] = await JobRequestManager.fetchAll({ where: [["id", "=", props.job.id]] });
    // IF somehow the job doesn't exist anymore at this instance or that it has already been taken
    if (!job || job["accepted_job.id"]) {
      Swal.fire({
        icon: "error",
        title: "An error has occurred",
        text: "The job you tried to accept is no longer available. Please try again with another job.",
        timerProgressBar: true,
        timer: 3000
      });
      return props.updateJobs();
    }   
    else {
      setLoading(true);
      // Otherwise, accept the job and assign the logged in contact to it
      const contact = await ContactManager.fetch(email);
      await job.accept(contact.id!);
      Swal.fire({
        icon: "success",
        title: "You have accepted this job!",
        timerProgressBar: true,
        timer: 3000
      });
      props.updateJobs();
      return setLoading(false);
    }
  }

  return <div className="bg-white rounded-lg shadow-md p-4">
    <div className="flex justify-between">
      <div>
        <div className="flex gap-x-2 items-baseline">
          <h2 className="font-semibold text-secondary text-xl">{props.job["Job_Request_Details.Request_Type:label"]}</h2>
          <h6 className="text-sm text-gray-600 italic">{moment(props.job.created_date).fromNow()}</h6>
        </div>
        <p className="text-sm text-gray-700 mb-4 font-semibold">{props.job.location}</p>
        <p>{props.job.details?.slice(0, collapsed ? 300 : props.job.details.length)}{collapsed ? '...' : ""}</p>
        {props.job.details!.length > 300 && <button className="text-secondary text-sm font-semibold mt-4" onClick={() => setCollapsed(!collapsed)}>{collapsed ? "Read More" : "Collapse"}</button>}
      </div>
      <button onClick={handleAccept} className="bg-secondary p-2 font-semibold text-white rounded-lg h-fit top-0 disabled:bg-primary" disabled={loading}>{loading ? <Spinner className="w-[25px] h-[25px] fill-secondary" /> : "Accept"}</button>
    </div>
  </div>
}