import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import { Contact } from "../../../../../utils/classes/Contact";
import { JobRequest, JobRequestStatus } from "../../../../../utils/classes/JobRequest";
import Table from "../../../../components/Table";
import Body from "../../../../components/Table/Body";
import Cell from "../../../../components/Table/Cell";
import Header from "../../../../components/Table/Header";
import PageNavigation from "../../../../components/PageNavigation";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import Status from "../../../../components/Table/Status";
import { AiOutlineEdit, AiOutlineStop } from "react-icons/ai";
import CustomFieldSetManager, { CustomField } from "../../../../../utils/managers/CustomFieldSetManager";
import Modal from "../../../../components/Modal";
import TextField from "../../../../components/Fields/TextField";
import TextareaField from "../../../../components/Fields/TextareaField";
import DropdownField from "../../../../components/Fields/DropdownField";
import CheckboxField from "../../../../components/Fields/CheckboxField";
import Swal from "sweetalert2";
import { MdCreate } from "react-icons/md";
import JobRequestManager from "../../../../../utils/managers/JobRequestManager";
import React from "react";

interface JobRequestsProps {
    contact: Contact;
    requests: JobRequest[];
    setRequests: Dispatch<SetStateAction<JobRequest[] | undefined>>;
}

const limit = 5;

const order = ["Accepted", "Requested", "Pending", "Unapproved", "Cancelled", "Volunteer Cancelled", "Expired", "Completed"];

const statusColor: { [key: string]: string } = {
    "Accepted": "bg-[#57D5FF] text-white",
    "Requested": "bg-[#FFB656] text-white",
    "Pending": "bg-[#F0D202] text-white",
    "Unapproved": "bg-[#efb7c0] text-white",
    "Cancelled": "bg-[#f26a6a] text-white",
    "Volunteer Cancelled": "bg-gray-200 text-[#f26a6a] underline",
    "Expired": "bg-gray-400 text-white",
    "Completed": "bg-[#7bcf72] text-white",
}

export default function JobRequests(props: JobRequestsProps) {
    const [currRequests, setCurrRequests] = useState<JobRequest[]>();
    const [formValues, setFormValues] = useState<{ [key: string]: any }>({});
    const [customFieldData, setCustomFieldData] = useState<Map<string, CustomField>>();
    const [isModalOpen, setModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentRequest, setCurrentRequest] = useState<JobRequest | null>(null);

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
                case "Approved": request.status = "Requested";
                    break;
                case "Approval Required": request.status = "Pending";
                    break;
                case "Not Approved": request.status = "Unapproved";
                    break;
                case "Cancelled": request.status = "Cancelled";
                    break;
            }

            if (request["status_id:name"] === "Approved" && request["accepted_job.id"] != null) {
                request.status = "Accepted";
                if (request["accepted_job.status_id:name"] === "Cancelled") {
                    request.status = "Volunteer Cancelled";
                }

                if (request["accepted_job.status_id:name"] === "Completed") {
                    request.status = "Completed";
                }
            } else {
                if (request["status_id:name"] === "Approved" || request["status_id:name"] === "Approval Required") {
                    const now = new Date();
                    const activity_date_time = new Date(request.activity_date_time)
                    if (now > activity_date_time) {
                        request.status = "Expired";
                    }
                }
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

    const openEditModal = async (request: JobRequest) => {
        const data = await CustomFieldSetManager.get("Job_Request_Details");

        const initialValues: { [key: string]: any } = {
            details: request.details || "",
            location: request.location || "",
        };

        if (data) {
            data.forEach((field, id) => {
                initialValues[id] = request[id] || "";
            });
        }

        setCustomFieldData(data);
        setFormValues(initialValues);
        setCurrentRequest(request);
        setModalOpen(true);
    };

    const handleFieldChange = useCallback((id: string, value: any) => {
        setFormValues((prev) => ({ ...prev, [id]: value }));
    }, []);

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log(formValues);
        if (!currentRequest) return;
        setIsEditing(true);

        const resultStatus = await JobRequestManager.update(currentRequest.id!, formValues);

        if (resultStatus === JobRequestStatus.Approved) {
            Swal.fire({
                title: "Your request has been saved",
                icon: "success"
            })
        } else if (resultStatus === JobRequestStatus.ApprovalRequired) {
            Swal.fire({
                title: "Your request has been saved",
                text: 'Since you have selected "Others" category, please wait for an Administrator to approve your request.',
                icon: "success",
                iconColor: "#f8bb86",
            })
        } else {
            Swal.fire({
                title: "An error occurred",
                text: "Please try again at a later time.",
                icon: "error"
            });
        }
        setIsEditing(false);
        setModalOpen(false);

        props.setRequests(await props.contact.fetchJobRequests());
    };

    const handleView = async (request: JobRequest) => {
        Swal.fire({
            html: `<b>Request Type:</b><br/>${request["Job_Request_Details.Request_Type:label"]}<br/><br/><b>Date & Time:</b><br/>${moment(request.activity_date_time!).format("DD/MM/yyyy hh:mm A")}<br/><br/><b>Location:</b><br/>${request.location}<br/><br/><b>Description:</b><br>${request.details}`,
            showCloseButton: true,
            showConfirmButton: false,
        })
    }

    return <div>
        <Table header="Job Requests">
            <Header>
                <Cell className="text-lg font-semibold w-1/4">Request Type</Cell>
                <Cell className="text-lg font-semibold w-1/4">Date & Time</Cell>
                <Cell className="text-lg font-semibold w-1/6">Status</Cell>
                <Cell className="text-lg font-semibold w-1/4  hidden lg:table-cell">Location</Cell>
                <Cell className="text-lg font-semibold w-1/6">Action</Cell>
            </Header>
            <Body>
                {!currRequests?.length ? <tr>
                    <Cell colSpan={5} className="text-center text-lg text-gray-500">No job request history available</Cell>
                    {/* Slices and shows only 5 entities per page */}
                </tr> : currRequests.slice(page * limit, page + ((page + 1) * limit)).map((request, index) => {
                    const editable = ["Pending"].includes(request.status);
                    const cancellable = ["Pending", "Requested"].includes(request.status);
                    const volunteerCancelled = request["accepted_job.status_id:name"] === "Cancelled";

                    return <tr key={index} className={volunteerCancelled ? "bg-gray-200" : ""}>
                        {/* Subject */}
                        <Cell className={volunteerCancelled ? "text-gray-400" : ""}>
                            <button className="text-secondary hover:text-primary cursor-pointer" onClick={() => handleView(request)}>
                                {request["Job_Request_Details.Request_Type:label"]}{request["Job_Request_Details.Request_Type:label"]!.length > 37 ? "..." : ""}
                            </button>
                        </Cell>
                        {/* Date & Time */}
                        <Cell className={volunteerCancelled ? "text-gray-400" : ""}>
                            {moment(request.activity_date_time!).format("DD/MM/yyyy hh:mm A")}
                        </Cell>
                        {/* Status */}
                        <Cell className={volunteerCancelled ? "text-gray-400" : ""}>
                            <Status className={statusColor[request.status]}>
                                {request.status}
                            </Status>
                        </Cell>
                        {/* Location */}
                        <Cell className={`whitespace-nowrap hidden lg:table-cell ${volunteerCancelled ? "text-gray-400" : ""}`}>
                            {request.location}{request.location!.length > 37 ? "..." : ""}
                        </Cell>
                        {/* Action */}
                        <Cell className={volunteerCancelled ? "text-gray-400" : ""}>
                            <div className="flex flex-row space-x-3">
                                <button className={`flex ${editable ? "text-blue-700" : "text-gray-500"} items-center`} disabled={!editable} onClick={() => openEditModal(request)}>
                                    <AiOutlineEdit className="mr-2" /> Edit
                                </button>
                                <button className={`flex ${cancellable ? "text-red-700" : "text-gray-500"} items-center`} disabled={!cancellable} onClick={() => navigate("request")}>
                                    <AiOutlineStop className="mr-2" /> Cancel
                                </button>
                            </div>
                        </Cell>
                    </tr>
                })}
            </Body>
        </Table>
        <PageNavigation page={page} pages={pages} limit={limit} array={props.requests} previousPage={previousPage} nextPage={nextPage} />

        {isModalOpen && (
            <Modal
                isOpen={isModalOpen}
                onRequestClose={() => setModalOpen(false)}
                title="Edit Job Request"
            >
                {/* <FormComponent
                    formValues={formValues}
                    data={customFieldData!}
                    handleFieldChange={handleFieldChange}
                    handleSave={handleSave}
                    isEditing={isEditing}
                /> */}
                <form onSubmit={handleSave} id="editForm" className="max-w-[1000px] mx-auto">
                    {/* Request Type */}
                    {customFieldData?.has("Job_Request_Details.Request_Type") && (() => {
                        const requestTypeField = customFieldData.get("Job_Request_Details.Request_Type");
                        switch (requestTypeField?.html_type) {
                            case "Text":
                                return (
                                    <TextField
                                        key="Job_Request_Details.Request_Type"
                                        className="flex justify-center mt-4"
                                        label={requestTypeField?.label || "Request Type"}
                                        id="Job_Request_Details.Request_Type"
                                        value={formValues["Job_Request_Details.Request_Type"] || ""}
                                        handleChange={(e) =>
                                            handleFieldChange("Job_Request_Details.Request_Type", e.target.value)
                                        }
                                        required={true}
                                    />
                                );
                            case "Radio":
                            case "Select":
                                return (
                                    <DropdownField
                                        key="Job_Request_Details.Request_Type"
                                        className="flex justify-center mt-4"
                                        label={requestTypeField?.label || "Request Type"}
                                        id="Job_Request_Details.Request_Type"
                                        fields={formValues}
                                        handleFields={(id, value) =>
                                            handleFieldChange(id, value)
                                        }
                                        options={requestTypeField?.options || []}
                                        required={true}
                                    />
                                );
                            case "CheckBox":
                                return (
                                    <CheckboxField
                                        key="Job_Request_Details.Request_Type"
                                        className="flex justify-center mt-4"
                                        label={requestTypeField?.label || "Request Type"}
                                        id="Job_Request_Details.Request_Type"
                                        fields={formValues}
                                        handleFields={(id, value) =>
                                            handleFieldChange(id, value)
                                        }
                                        options={requestTypeField?.options || []}
                                    />
                                );
                            default:
                                return null;
                        }
                    })()}
                    {/* Location */}
                    <TextField
                        className="flex justify-center mt-4"
                        label="Location"
                        id="location"
                        showInfo={true}
                        info="Location of your request."
                        value={formValues.location || ""}
                        handleChange={(e) => handleFieldChange("location", e.target.value)}
                        required={true}
                    />
                    {/* Details */}
                    <TextareaField
                        className="flex justify-center mt-4"
                        label="Description"
                        id="details"
                        value={formValues.details || ""}
                        handleChange={(e) => handleFieldChange("details", e.target.value)}
                        wordLimit={100}
                        required={true}
                    />
                    {/* Custom Fields */}
                    {customFieldData &&
                        Array.from(customFieldData).map(([id, field]) => {
                            if (id === "Job_Request_Details.Request_Type") return null;
                            switch (field.html_type) {
                                case "Text":
                                    return (
                                        <TextField
                                            key={id}
                                            className="flex justify-center mt-4"
                                            label={field.label}
                                            id={id}
                                            value={formValues[id] || ""}
                                            handleChange={(e) => handleFieldChange(id, e.target.value)}
                                            required={true}
                                        />
                                    );
                                case "Radio":
                                case "Select":
                                    return (
                                        <DropdownField
                                            key={id}
                                            className="flex justify-center mt-4"
                                            label={field.label}
                                            id={id}
                                            fields={formValues}
                                            handleFields={(id, value) =>
                                                handleFieldChange(id, value)
                                            }
                                            options={field.options!}
                                            required={true}
                                        />
                                    );
                                case "CheckBox":
                                    return (
                                        <CheckboxField
                                            key={id}
                                            className="flex justify-center mt-4"
                                            label={field.label}
                                            id={id}
                                            fields={formValues}
                                            handleFields={(id, value) =>
                                                handleFieldChange(id, value)
                                            }
                                            options={field.options!}
                                        />
                                    );
                                default:
                                    return null;
                            }
                        })
                    }
                    <div className="flex justify-center mt-4">
                        <button
                            type="submit"
                            className={`text-white font-semibold text-sm rounded-md py-[6px] px-4 flex justify-center sm:justify-between items-center gap-x-3 ${isEditing ? "bg-primary" : "bg-secondary"}`}
                            disabled={isEditing}
                        >
                            <MdCreate />
                            <span>{isEditing ? "Saving..." : "Save Request"}</span>
                        </button>
                    </div>
                </form>
            </Modal>
        )}
    </div>
}
