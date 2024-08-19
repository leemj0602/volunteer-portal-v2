import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import ContactHandler from "../../../utils/v2/handlers/ContactHandler";
import { Contact } from "../../../utils/v2/entities/Contact";
import Wrapper from "../../components/Wrapper";
import Loading from "../../components/Loading";
import { MdInfoOutline, MdOutlineLockReset, MdSaveAlt } from "react-icons/md";
import CustomFieldSetManager, { CustomField } from "../../../utils/managers/CustomFieldSetManager";
import { FiEdit } from "react-icons/fi";
import swal from "sweetalert";

export default function Profile() {
    const email = (window as any).email;
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [contact, setContact] = useState<Contact>();
    const [prevContact, setPrevContact] = useState<Contact>();
    const [customFieldData, setCustomFieldData] = useState<Map<string, CustomField>>();

    // #region Instantiating Contact value
    useEffect(function () {
        (async function () {
            const contact = await ContactHandler.fetch(email);
            setContact(contact);
            setPrevContact(contact);
            setCustomFieldData(await CustomFieldSetManager.get("Volunteer_Contact_Details"));
        })();
    }, []);
    // #endregions

    // #region Saving changes
    const saveChanges = async function (e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSaving(true);

        const result = await contact?.update();
        if (result) {
            swal("Successfully updated profile", { icon: "success" });
            setContact(result);
            setPrevContact(result);
        }
        else {
            swal("An error has occurred. Please try again later.", { icon: "error" });
            setContact(prevContact);
        }

        setIsSaving(false);
        setIsEditing(false);
    }
    // #endregion

    // Responsible for switching the view
    const handleView = () => {
        setIsEditing(!isEditing);
        // If they were previously editing
        if (isEditing) setContact(prevContact);
    }

    return <Wrapper>
        {(!contact || !customFieldData) ? <Loading className="h-screen items-center" /> : <>
            <div>
                {/* Header PC */}
                <div className="p-4 relative bg-primary/20 h-[140px] hidden md:block">
                    <div className="flex flex-row items-center absolute -bottom-[44%] lg:left-20">
                        {/* Profile Picture */}
                        <div className="w-[130px] h-[130px] rounded-full bg-gray-300 mr-6 border-[#f4f5fb] border-8">
                        </div>
                        {/* Text */}
                        <div className="grid grid-cols-1 gap-y-6">
                            <h1 className="font-bold text-2xl">{contact.data.first_name} {contact.data.last_name}</h1>
                            <h2 className="font-semibold text-transparent lg:text-black">{contact.data.address_primary?.street_address}</h2>
                        </div>
                    </div>
                </div>
                {/* Header Mobile */}
                <div className="p-4 bg-primary/20 md:hidden flex justify-center items-center">
                    <div className="w-full flex flex-col justify-center items-center">
                        {/* Profile Picture */}
                        <div className="w-[120px] h-[120px] mx-auto rounded-full bg-gray-300 border-[#f4f5fb] border-8">
                        </div>
                        {/* Text */}
                        <div className="text-center mt-4">
                            <h1 className="font-bold text-2xl">{contact.data.first_name} {contact.data.last_name}</h1>
                            <h2 className="font-semibold">{contact.data.address_primary?.street_address}</h2>
                        </div>
                    </div>
                </div>
                {/* Form */}
                <div className="p-4">
                    <form onSubmit={saveChanges} className="max-w-[1800px]">
                        {/* Buttons */}
                        <div className="flex w-full justify-center md:justify-end mb-10 lg:mb-20">
                            <div className="flex flex-col sm:flex-row gap-3">
                                {/* Save Changes */}
                                {isEditing && <button type="submit" className={`text-white font-semibold text-sm rounded-md py-[6px] px-4 flex justify-center sm:justify-between items-center gap-x-3 ${isSaving ? "bg-primary" : "bg-secondary"}`} disabled={isSaving}>
                                    <MdSaveAlt />
                                    <span>{isSaving ? "Updating..." : "Save Changes"}</span>
                                </button>}
                                {/* Edit */}
                                {!isEditing && <button onClick={handleView} type="button" className="text-white font-semibold text-sm rounded-md py-[6px] px-4 bg-secondary flex justify-center sm:justify-between items-center gap-x-3">
                                    <FiEdit />
                                    <span>Edit</span>
                                </button>}
                                {/* Reset Password */}
                                <button type="button" className="text-white font-semibold text-sm rounded-md py-[6px] px-4 bg-secondary flex justify-center sm:justify-between items-center gap-x-3" onClick={() => { }}>
                                    <MdOutlineLockReset size={18} />
                                    <span>Reset Password</span>
                                </button>
                            </div>
                        </div>
                        {/* Fields */}
                        <div className="grid grid-cols-1 gap-x-3 gap-y-6 md:gap-y-8 md:grid-cols-2">
                            {/* Email */}
                            <TextField
                                className="flex justify-center" label="Email" value={contact.data.email_primary?.email}
                                disabled={true}
                                showInfo={isEditing}
                                info="Please contact an Administrator to have your email changed"
                            />
                            {/* Phone */}
                            <TextField
                                className="flex justify-center" label="Phone" value={contact.data.phone_primary?.phone_numeric}
                                disabled={true}
                                showInfo={isEditing}
                                info="Please contact an Administrator to have your contact number changed"
                            />
                            {/* First Name */}
                            <TextField
                                className="flex justify-center" label="First Name" value={contact.data.first_name}
                                disabled={!isEditing}
                                onChange={e => {
                                    setContact(c => {
                                        const contact = new Contact(c!.flat);
                                        contact!.data.first_name = e.target.value;
                                        return contact;
                                    })
                                }}
                            />
                            {/* Last Name */}
                            <TextField
                                className="flex justify-center" label="Last Name" value={contact.data.last_name}
                                disabled={!isEditing}
                                onChange={e => {
                                    setContact(c => {
                                        const contact = new Contact(c!.flat);
                                        contact!.data.last_name = e.target.value;
                                        return contact;
                                    })
                                }}
                            />
                            {/* Address */}
                            <TextField
                                className="flex justify-center" label="Address" value={contact.data.address_primary?.street_address}
                                disabled={!isEditing}
                                onChange={e => {
                                    setContact(c => {
                                        const contact = new Contact(c!.flat);
                                        contact!.data.address_primary!.street_address = e.target.value;
                                        return contact;
                                    })
                                }}
                            />
                            {/* Postal Code */}
                            <TextField
                                className="flex justify-center" label="Postal Code" value={contact.data.address_primary?.postal_code}
                                disabled={!isEditing}
                                onChange={e => {
                                    setContact(c => {
                                        const contact = new Contact(c!.flat);
                                        contact!.data.address_primary!.postal_code = e.target.value;
                                        return contact;
                                    })
                                }}
                            />

                            {/* Custom Field Sets */}
                            {Object.keys(contact.data.Volunteer_Contact_Details!).map(key => {
                                return <>{key}</>;
                            })}
                        </div>
                    </form>
                </div>
            </div>
        </>}
    </Wrapper>;
}

interface TextFieldProps {
    label: string;
    info?: string;
    value?: string;
    disabled?: boolean;
    showInfo?: boolean;
    className?: string;
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}
function TextField(props: TextFieldProps) {
    const [isHovering, setIsHovering] = useState(false);
    const handleHovering = () => setIsHovering(!isHovering);

    return <div className={props.className}>
        <div className="w-full md:w-[300px]">
            {/* Label */}
            <div className="flex flex-row justify-between items-center mb-1">
                <label id={props.label} className={`font-semibold ${props.disabled ? "opacity-40" : ""}`}>{props.label}</label>
                {/* If it's currently editable, and there is more information to display */}
                {props.disabled && props.showInfo && props.info?.length != 0 && <>
                    <div className="relative" onMouseEnter={handleHovering} onMouseLeave={handleHovering}>
                        <MdInfoOutline className="text-secondary cursor-pointer" />
                        {/* Information block */}
                        {isHovering && <div className="absolute w-[240px] top-5 right-0 bg-white p-1 rounded-lg shadow-md text-center text-[12px] z-[1]">
                            <p className="text-secondary font-semibold text-[12px]">{props.info}</p>
                        </div>}
                    </div>
                </>}
            </div>
            {/* Text Input */}
            <div className="relative">
                <input id={props.label} required={true} minLength={1} type="text" className="w-full py-2 px-4 rounded-[5px] disabled:bg-white disabled:text-gray-500 disabled:cursor-not-allowed outline-none" value={props.value} disabled={props.disabled} onChange={props.onChange} />
            </div>
        </div>
    </div>
}