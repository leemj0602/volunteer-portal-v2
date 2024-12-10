import { FormEvent, useEffect, useState } from "react";
import Wrapper from "../../components/Wrapper";
import { Contact } from "../../../utils/v2/entities/Contact";
import ContactHandler from "../../../utils/v2/handlers/ContactHandler";
import Loading from "../../components/Loading";
import Header from "./components/Header";
import { useSubtypesContext } from "../../contexts/Subtypes";
import CustomFieldSetHandler, { CustomField } from "../../../utils/v2/handlers/CustomFieldSetHandler";
import { FiEdit } from "react-icons/fi";
import { ResetPasswordButton } from "./components/ResetPasswordButton";
import { MdSaveAlt } from "react-icons/md";
import GenericFieldsInputs from "./components/GenericFieldsInputs";
import CustomFieldsInputs from "./components/CustomFieldsInputs";
import Swal from "sweetalert2";

export default function Profile2() {
  const [contact, setContact] = useState<Contact>();
  const [volunteer, setVolunteer] = useState<CustomField[]>();
  const [donor, setDonor] = useState<CustomField[]>();
  const [caregiver, setCaregiver] = useState<CustomField[]>();
  const [patient, setPatient] = useState<CustomField[]>();

  const [post, setPost] = useState<Record<string, any>>();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const { subtypes } = useSubtypesContext()!;

  useEffect(() => {
    (async () => {
      if (subtypes) {
        const email = (window as any).email;
        const contact = await ContactHandler.fetch(email);

        if (subtypes?.includes("Volunteer")) setVolunteer(await CustomFieldSetHandler.fetch("Volunteer_Contact_Details"));
        if (subtypes?.includes("Patient")) setPatient(await CustomFieldSetHandler.fetch("Patient_Contact_Details"));
        if (subtypes?.includes("Caregiver")) setCaregiver(await CustomFieldSetHandler.fetch("Caregiver_Contact_Details"));
        if (subtypes?.includes("Donator")) setDonor(await CustomFieldSetHandler.fetch("Donator_Contact_Details"));

        setContact(contact);
        setPost(contact.flat);
      }
    })();
  }, [subtypes]);

  useEffect(() => {
    console.log(volunteer);
  }, [volunteer]);

  const handleFields = (id: string, value: any) => {
    if (post) {
      post[id] = value;
      setPost(post);
    }
  }

  const update = async function (e: FormEvent<HTMLFormElement>) {
    if (contact && post) {
      e.preventDefault();
      setSaving(true);
      const result = await contact.update(post);
      setSaving(false);
      setEditing(false);

      if (result) {
        setContact(result);
        setPost(result.flat);
        await Swal.fire("Profile successfully updated", undefined, "success");
      }
      else {
        setPost(contact.flat);
        Swal.fire("An error occurred", "Please try again at a later time.", "error");
      }
    }
  }

  return <Wrapper>
    {!post || !contact ? <Loading className="h-screen items-center" /> : <div className="mb-20">
      <Header contact={contact} />
      <div className="p-4">
        <form className="max-w-[1000px]" onSubmit={update}>
          {/* Buttons */}
          <div className="flex w-full justify-center md:justify-end mb:10 lg:mb-20">
            <div className="flex flex-col sm:flex-row gap-3">
              {!editing && <button onClick={() => setEditing(true)} type="button" className="text-white font-semibold text-sm rounded-md py-[6px] px-4 bg-secondary flex justify-center sm:justify-between items-center gap-x-3">
                <FiEdit />
                <span>Edit</span>
              </button>}
              {editing && <button type="submit" className={`text-white font-semibold text-sm rounded-md py-[6px] px-4 flex justify-center sm:justify-between items-center gap-x-3 ${saving ? "bg-primary" : "bg-secondary"}`}>
                <MdSaveAlt />
                <span>{saving ? "Updating..." : "Save Changes"}</span>
              </button>}
              <ResetPasswordButton />
            </div>
          </div>

          <GenericFieldsInputs flat_contact={post} contact={contact} handleFieds={handleFields} disabled={!editing} />
          <CustomFieldsInputs subtype="volunteer" fields={volunteer} flat_contact={post} handleFields={handleFields} disabled={!editing} />
          <CustomFieldsInputs subtype="donator" fields={donor} flat_contact={post} handleFields={handleFields} disabled={!editing} />
          <CustomFieldsInputs subtype="caregiver" fields={caregiver} flat_contact={post} handleFields={handleFields} disabled={!editing} />
          <CustomFieldsInputs subtype="patient" fields={patient} flat_contact={post} handleFields={handleFields} disabled={!editing} />
        </form>
      </div>
    </div>}
  </Wrapper>
}