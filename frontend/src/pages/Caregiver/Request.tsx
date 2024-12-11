import { FormEvent, useEffect, useState } from "react";
import TextareaField from "../../components/Fields/TextareaField";
import TextField from "../../components/Fields/TextField";
import Wrapper from "../../components/Wrapper";
import CustomFieldSetManager, { CustomField } from "../../../utils/managers/CustomFieldSetManager";
import DropdownField from "../../components/Fields/DropdownField";
import CheckboxField from "../../components/Fields/CheckboxField";
import Loading from "../../components/Loading";
import { MdCreate } from "react-icons/md";
import JobRequestManager from "../../../utils/managers/JobRequestManager";
import Swal from "sweetalert2";
import { JobRequestStatus } from "../../../utils/classes/JobRequest";
import DateTimePickerField from "../../components/Fields/DateTimePickerField";

export default function CaregiverRequest() {
    const email = (window as any).email;
    const [customFieldData, setCustomFieldData] = useState<Map<string, CustomField>>();
    const [formValues, setFormValues] = useState<{ [key: string]: any }>({
        details: "",
        activity_date_time: null,
        location: "",
    });
    const [isCreating, setIsCreating] = useState(false);
    const currentDate = new Date();

    useEffect(() => {
        (async function () {
            const data = await CustomFieldSetManager.get("Job_Request_Details");
            // Initialize formValues with dynamic fields from customFieldData
            const initialValues: { [key: string]: any } = {};
            data?.forEach((field, id) => {
                initialValues[id] = ""; // Initialize empty values for each field
            });
            setFormValues((prev) => ({ ...prev, ...initialValues }));
            setCustomFieldData(data);
        })();
    }, []);

    const handleFieldChange = (id: string, value: any) => {
        setFormValues((prev) => ({
            ...prev,
            [id]: value, // Update field value
        }));
    };

    const filterTimeRange = (time: Date) => {
        const now = new Date();
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

        // Ensure the selected time is at least 1 hour from now
        return time > oneHourFromNow;
    };

    const createRequest = async function (e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        // Check if `activity_date_time` is valid
        const selectedDate = formValues.activity_date_time;
        const now = new Date();
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

        if (!selectedDate || new Date(selectedDate) <= oneHourFromNow /*|| !filterWeekdays(new Date(selectedDate))*/) {
            Swal.fire({
                title: "Invalid Date & Time",
                text: "Please select a date & time that is at least 1 hour ahead.",
                icon: "error"
            });
            return; // Prevent form submission
        }

        setIsCreating(true);

        const resultStatus = await JobRequestManager.create(email, email, formValues);

        if (resultStatus === JobRequestStatus.Approved) {
            Swal.fire({
                title: "Your request has been submitted",
                icon: "success"
            })

            // Reset form values after successful submission
            const resetValues: { [key: string]: any } = {
                details: "",
                activity_date_time: null,
                location: "",
            };
            customFieldData?.forEach((_, id) => {
                resetValues[id] = ""; // Reset dynamic fields to empty
            });

            setFormValues(resetValues);
        }
        else if (resultStatus === JobRequestStatus.ApprovalRequired) {
            Swal.fire({
                title: "Your request has been submitted",
                text: 'Since you have selected "Others" category, please wait for an Administrator to approve your request.',
                icon: "success",
                iconColor: "#f8bb86",
            })

            // Reset form values after successful submission
            const resetValues: { [key: string]: any } = {
                details: "",
                activity_date_time: null,
                location: "",
            };
            customFieldData?.forEach((_, id) => {
                resetValues[id] = ""; // Reset dynamic fields to empty
            });

            setFormValues(resetValues);
        } else {
            Swal.fire({
                title: "An error occurred",
                text: "Please try again at a later time.",
                icon: "error"
            });
        }
        setIsCreating(false);
    }

    return (
        <Wrapper>
            {!customFieldData ? (
                <Loading className="h-screen items-center" />
            ) : (
                <>
                    <div className="w-full px-0 md:px-6 max-w-[1200px] mx-auto">
                        <div className="p-4">
                            <form onSubmit={createRequest} className="max-w-[1000px]">
                                {/* Request Type */}
                                {customFieldData.has("Job_Request_Details.Request_Type") && (() => {
                                    const requestTypeField = customFieldData.get("Job_Request_Details.Request_Type");
                                    switch (requestTypeField?.html_type) {
                                        case "Text":
                                            return (
                                                <TextField
                                                    key="Job_Request_Details.Request_Type"
                                                    className="flex justify-center mt-4"
                                                    label={requestTypeField?.label || "Request Type"}
                                                    id="Job_Request_Details.Request_Type"
                                                    value={formValues["Job_Request_Details.Request_Type"]}
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
                                {/* Date Time */}
                                <DateTimePickerField
                                    className="flex justify-center mt-4"
                                    label="Request Date & Time"
                                    id="activity_date_time"
                                    showInfo={true}
                                    info="Please select a date & time that is at least 1 hour ahead."
                                    value={formValues.activity_date_time ? new Date(formValues.activity_date_time) : null}
                                    handleChange={(date) => handleFieldChange("activity_date_time", date)}
                                    required={true}
                                    showTimeSelect={true}
                                    minDate={currentDate}
                                    // filterDate={filterWeekdays}
                                    filterTime={filterTimeRange}
                                />
                                {/* Location */}
                                <TextField
                                    className="flex justify-center mt-4"
                                    label="Location"
                                    id="location"
                                    showInfo={true}
                                    info="Location of your request."
                                    value={formValues.location}
                                    handleChange={(e) => handleFieldChange("location", e.target.value)}
                                    required={true}
                                />
                                {/* Details */}
                                <TextareaField
                                    className="flex justify-center mt-4"
                                    label="Description"
                                    id="details"
                                    showInfo={true}
                                    info="Description of your request (Max. 100 words)."
                                    value={formValues.details}
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
                                                        value={formValues[id]}
                                                        handleChange={(e) =>
                                                            handleFieldChange(id, e.target.value)
                                                        }
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
                                        className={`text-white font-semibold text-sm rounded-md py-[6px] px-4 flex justify-center sm:justify-between items-center gap-x-3 ${isCreating ? "bg-primary" : "bg-secondary"
                                            }`}
                                        disabled={isCreating}
                                    >
                                        <MdCreate />
                                        <span>{isCreating ? "Submitting..." : "Submit Request"}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}
        </Wrapper>
    );
}