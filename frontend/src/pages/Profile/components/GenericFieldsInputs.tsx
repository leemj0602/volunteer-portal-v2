import { useState } from "react";
import TextField from "../../../components/Fields/TextField";
import { Contact } from "../../../../utils/v2/entities/Contact";
import DropdownField from "../../../components/Fields/DropdownField";

interface GenericFieldsInputsProps {
  contact: Contact;
  flat_contact: Record<string, any>;
  disabled?: boolean;
  handleFieds: (id: string, value: any) => void;
}
export default function GenericFieldsInputs(props: GenericFieldsInputsProps) {
  const [name, setName] = useState(`${props.contact.data.first_name}${props.contact.data.last_name ? ` ${props.contact.data.last_name}` : ""}`);

  const handleName = (id: string, value: string) => {
    setName(value);
    props.handleFieds('first_name', value.split(' ')[0]);
    props.handleFieds('last_name', value.split(' ').splice(1, value.split(' ').length).join(' '));
  }

  return <div className="grid grid-cols-1 gap-x-3 gap-y-6 md:gap-y-8 md:grid-cols-2">
    {/* Email */}
    <TextField className="flex justify-center" label="Email" id="email_primary.email" fields={props.flat_contact} info="Please contact an administrator to have your Email changed" showInfo={!props.disabled} disabled />
    {/* Phone */}
    <TextField className="flex justify-center" label="Phone" id="phone_primary.phone_numeric" fields={props.flat_contact} info="Please contact an administrator to have your Contact Number changed" showInfo={!props.disabled} disabled />
    {/* Name */}
    <TextField className="flex justify-center" label="Name" id="name" value={name} handleFields={handleName} disabled={props.disabled} />
    {/* Address */}
    <TextField className="flex justify-center" label="Address" id="address_primary.street_address" fields={props.flat_contact} handleFields={props.handleFieds} disabled={props.disabled} />
    {/* Postal Code */}
    <TextField className="flex justify-center" label="Address" id="address_primary.postal_code" fields={props.flat_contact} disabled={props.disabled} />
    {/* Gender */}
    <DropdownField className="flex justify-center" label="Gender" id="gender_id" placeholder="Please choose your gender" fields={props.flat_contact} disabled={props.disabled} options={[
          { label: "Male", value: "2" },
          { label: "Female", value: "1" },
          { label: "Others", value: "0" }
        ]} handleFields={props.handleFieds} />
  </div>
}