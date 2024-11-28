import { useEffect, useState } from "react";
import Wrapper from "../../../components/Wrapper";
import CustomFieldSetManager, { CustomField, CustomFieldOptions } from "../../../../utils/managers/CustomFieldSetManager";
import Loading from "../../../components/Loading";
import { JobRequest, JobRequestStatus } from "../../../../utils/classes/JobRequest";
import { ComparisonOperator } from "../../../../utils/crm";
import DropdownButton from "../../../components/DropdownButton";
import { useSearchParams } from "react-router-dom";
import JobRequestManager from "../../../../utils/managers/JobRequestManager";
import JobRequestTab from "./components/JobRequestTab";
import moment from "moment";

const limit = 12;

export default function Jobs() {
  const [fields, setFields] = useState<Map<string, CustomField>>();
  const [jobs, setJobs] = useState<JobRequest[]>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    (async () => {
      const result = await CustomFieldSetManager.get("Job_Request_Details");
      setFields(result);
    })();
  }, []);

  useEffect(() => {
    updateJobs();
  }, [searchParams]);

  const updateJobs = async () => {
    setJobs(undefined);
    const where: [string, ComparisonOperator, any?][] = [
      ["accepted_job.id", "IS NULL"],
      ["status_id:name", "=", JobRequestStatus.Approved],
      ["activity_date_time", ">=", moment(new Date()).format('YYYY-MM-DD hh:mm:ss')]
    ];
    searchParams.forEach((val, key) => {
      if (!key.includes("undefined") && key != "page") where.push([key, 'IN', JSON.parse(val ?? "[]")])
    });

    // Getting total number of documents
    const total = (await JobRequestManager.fetchAll({ where, select: ['id'] })).length;
    const pages = Math.ceil(total / limit);
    setTotalPages(pages);

    let page = parseInt(searchParams.get("page") ?? "1");
    if (isNaN(page)) page = 1;
    if (page > totalPages) page = totalPages;
    if (page < 1) page = 1;

    const jobs = await JobRequestManager.fetchAll({ where, page, limit, order: [["created_date", "DESC"]] });
    setJobs(jobs);
  }

  // Checkbox update sleection
  const updateSelection = (selection: string, option: CustomFieldOptions) => {
    const selected: string[] = JSON.parse(searchParams.get(selection) ?? "[]").map((v: any) => `${v}`);
    if (!selected.includes(option.value)) selected.push(option.value);
    else selected.splice(selected.indexOf(option.value), 1);

    if (!selected.length) searchParams.delete(selection);
    else searchParams.set(selection, JSON.stringify(selected));

    searchParams.set("page", "1");
    setSearchParams(searchParams);
  }

  return <Wrapper>
    {!fields ? <Loading className="h-screen items-center" /> : <div className="p-4 mb-12">
      <div className="max-w-[1600px] px:0 md:px-6">
        <div className="mb-6">
          <div className="col-span-2 flex flex-col md:Grid md:grid-cols-2 lg:Flex lg:flex-row justify-between lg:justify-normal gap-3">
            {/* Filters */}
            {Array.from(fields.keys()).map((key, i) => {
              const field = fields.get(key);
              return !(!field) && <DropdownButton label={field.label}>
                <div className={`absolute bg-white shadow-md rounded-md w-full min-w-[200px] mt-2 z-20 ${i == fields.size - 1 ? "right-0" : "left-0"}`}>
                  {field.options!.map(opt => <div className="in-line px-4 py-2 items-center gap-x-3 cursor-pointer hover:bg-gray-100" onClick={() => updateSelection(key, opt)}>
                    <input type="checkbox" id={`${opt.option_group_id}-${opt.name}`} className="pointer-events-none" checked={JSON.parse(searchParams.get(key) ?? "[]").includes(opt.value)} />
                    <label htmlFor={`${opt.option_group_id}-${opt.name}`} className="text-sm w-full text-gray-600 ml-4 cursor-pointer pointer-events-none">{opt.label}</label>
                  </div>)}
                </div>
              </DropdownButton>
            })}
          </div>
        </div>
        {/* Jobs */}
        {!jobs ? <Loading className="items-center h-full mt-20" /> : <div className="flex flex-col justify-between h-full">
          {!jobs.length && <p className="text-lg text-gray-500">Looks like there aren't any pending jobs.</p>}
          {jobs.length > 0 && <div className="flex flex-col gap-6">
            {jobs.map(job => <JobRequestTab job={job} updateJobs={updateJobs} />)}
          </div>}
        </div>}

        {/* Pagination */}
        {totalPages > 1 && <div className="mt-8 items-center justify-center text-center w-full">
          {Array.from({ length: totalPages }).map((_, n) => <button onClick={() => {
            searchParams.set("page", `${n + 1}`);
            setSearchParams(searchParams);
          }} className="px-3 py-1 rounded-md hover:bg-secondary hover:text-white mx-1 font-semibold text-gray-600">{n + 1}</button>)}
        </div>}
      </div>
    </div>}
  </Wrapper>
}