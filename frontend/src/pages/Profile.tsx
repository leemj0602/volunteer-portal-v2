import { FormEvent, useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import ContactManager from "../../utils/managers/ContactManager";
import { Contact, ContactProps } from "../../utils/classes/Contact";
import CustomFieldSetManager, { CustomField } from "../../utils/managers/CustomFieldSetManager";
import config from "../../../config";
import Loading from "../components/Loading";
import ConfirmationModal from "../components/ConfirmationModal";
import ResetPassword from "../../assets/ResetPassword.png";
import { MdOutlineLockReset, MdSaveAlt } from "react-icons/md";
import { FiEdit } from "react-icons/fi";
import TextField from "../components/Fields/TextField";
import DropdownField from "../components/Fields/DropdownField";
import CheckboxField from "../components/Fields/CheckboxField";
import swal from "sweetalert";

export default function Profile() {
    const email = (window as any).email ?? config.email;
    const [name, setName] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [unsavedContact, setUnsavedContact] = useState<Contact>();
    const [contact, setContact] = useState<Contact>();
    const [customFieldData, setCustomFieldData] = useState<Map<string, CustomField>>();

    useEffect(() => {
        (async function () {
            const data = await ContactManager.fetch(email);
            data["Volunteer_Contact_Details.Skills_Interests"]
            setName(`${data.first_name}${data.last_name?.length ? ` ${data.last_name}` : ""}`);
            setContact(data);
            setUnsavedContact(data);
            setCustomFieldData(await CustomFieldSetManager.get("Volunteer_Contact_Details"));
        })();
    }, []);


    const handleContact = function(id: keyof Contact, value: any) {
        const updated = new Contact(contact!);
        updated[id] = value;
        setContact(updated);
    }

    const saveChanges = async function (e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSaving(true);

        const updated = { ...contact } as ContactProps;
        updated.first_name = name.split(" ")[0];
        updated.last_name = name.split(" ").splice(1, name.split(" ").length).join(" ");

        const data = await ContactManager.update(email, updated);
        swal("Successfully updated profile", { icon: "success" });

        setIsSaving(false);
        setContact(data);
        setUnsavedContact(data);
        setIsEditing(false);
    }

    const [showModal, setShowModal] = useState(false);
    const openModal = () => {
        setShowModal(true);
        document.body.style.overflow = "hidden";
    }
    const closeModal = () => {
        setShowModal(false);
        document.body.style.overflow = "";
    }

    // Responsible for switching the view
    const handleView = () => {
        setIsEditing(!isEditing);
        // If they were previously editing
        if (isEditing) {
            setName(`${unsavedContact!.first_name} ${unsavedContact!.last_name ?? ""}`);
            setContact(unsavedContact);
        }
    }


    return <Wrapper>
        {!contact || !customFieldData ? <Loading className="h-screen items-center" /> : <>
            <ConfirmationModal showModal={showModal} closeModal={closeModal} image={ResetPassword}>
                <h1 className="font-semibold text-lg mt-4">Reset Password Confirmation</h1>
                <p className="text-gray-500 text-ms mt-2">Click Confirm to redirect to another page to reset your password</p>
                <button className="text-sm font-semibold bg-secondary rounded-md p-2 w-[140px] text-white self-center mt-4" onClick={() => {
                   closeModal();
                   window.open(`${config.domain}/wp-login.php?action=lostpassword`, "_blank")}
                }>
                    Confirm
                </button>
                <button onClick={closeModal} className="font-semibold text-sm mt-2 text-gray-400">Nevermind</button>
            </ConfirmationModal>
            <div>
                {/* Header */}
                <div className="p-4 relative bg-primary/20 h-[140px]">
                    <div className="flex flex-row items-center absolute -bottom-[44%] lg:left-20">
                        {/* Profile picture */}
                        <div className="w-[130px] h-[130px] rounded-full bg-gray-300 mr-6 border-[#f4f5fb] border-8">

                        </div>
                        {/* Profile name and address */}
                        <div className="grid grid-cols-1 gap-y-6">
                            <h1 className="font-bold text-2xl">{name}</h1>
                            <h2 className="font-semibold">{contact["address_primary.street_address"]}</h2>
                        </div>
                    </div>
                </div>
                {/* Form */}
                <div className="p-4">
                    <form onSubmit={saveChanges} className="max-w-[1000px]">
                        {/* Buttons */}
                        <div className="flex w-full justify-end mb-20">
                            <div className="flex gap-x-3">
                                {/* Save Changes */}
                                {isEditing && <button type="submit" className={`text-white font-semibold text-sm rounded-md py-[6px] px-4 flex justify-between items-center gap-x-3 ${isSaving ? "bg-primary" : "bg-secondary"}`} disabled={isSaving}>
                                    <MdSaveAlt />
                                    <span>{isSaving ? "Updating..." : "Save Changes"}</span>
                                </button>}
                                {/* Edit */}
                                {!isEditing && <button onClick={handleView} type="button" className="text-white font-semibold text-sm rounded-md py-[6px] px-4 bg-secondary flex justify-between items-center gap-x-3">
                                    <FiEdit />
                                    <span>Edit</span>
                                </button>}
                                {/* Reset Password */}
                                <button type="button" className="text-white font-semibold text-sm rounded-md py-[6px] px-4 bg-secondary flex justify-between items-center gap-x-3" onClick={openModal}>
                                    <MdOutlineLockReset size={18} />
                                    <span>Reset Password</span>
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-x-3 gap-y-6 md:gap-y-8 md:grid-cols-2">
                            {/* Email */}
                            <TextField className="flex justify-center" label="Email" id="email_primary.email" fields={contact} disabled={true} showInfo={isEditing} info="Please contact an administrator to have your Email changed" />
                            {/* Phone */}
                            <TextField className="flex justify-center" label="Phone" id="phone_primary.phone_numeric" fields={contact} disabled={true} showInfo={isEditing} info="Please contact an administrator to have your Contact Number changed" />
                            {/* Name */}
                            <TextField className="flex justify-center" label="Name" id="name" disabled={!isEditing} value={name} handleChange={e => setName(e.target.value)} />
                            {/* Address */}
                            <TextField className="flex justify-center" label="Address" id="address_primary.street_address" fields={contact} disabled={!isEditing} handleFields={handleContact} />
                            {/* Postal Code */}
                            <TextField className="flex justify-center" label="Postal Code" id="address_primary.postal_code" fields={contact} disabled={!isEditing} handleFields={handleContact} />
                            {/* Gender */}
                            <DropdownField className="flex justify-center" label="Gender" id="gender_id" placeholder="Please choose your gender" fields={contact} disabled={!isEditing} handleFields={handleContact} options={[
                                { label: "Male", value: "2" },
                                { label: "Female", value: "1" },
                                { label: "Others", value: "0" },
                            ]} />
                            
                            {/* Custom Fields */}
                            {customFieldData && Array.from(customFieldData).map(value => {
                                const [id, field] = value;
                                switch (field.html_type) {
                                    case "Text":
                                        return <TextField className="flex justify-center" label={field.label} id={id} fields={contact} disabled={!isEditing} handleFields={handleContact} />
                                    case "Radio":
                                        return <DropdownField className="flex justify-center" label={field.label} id={id} fields={contact} disabled={!isEditing} handleFields={handleContact} options={field.options!} />
                                    case "Select":
                                        return <DropdownField className="flex justify-center" label={field.label} id={id} fields={contact} disabled={!isEditing} handleFields={handleContact} options={field.options!} />
                                    case "CheckBox":
                                        return <CheckboxField className="flex justify-center" label={field.label} id={id} fields={contact} disabled={!isEditing} handleFields={handleContact} options={field.options!} />
                                }
                            })}
                        </div>
                    </form>
                </div>
            </div>
        </>}
    </Wrapper>
}