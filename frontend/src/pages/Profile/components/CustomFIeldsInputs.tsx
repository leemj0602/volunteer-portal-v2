import { capitalize } from "inflection";
import { useSubtypesContext } from "../../../contexts/Subtypes";
import { CustomField } from "../../../../utils/v2/handlers/CustomFieldSetHandler";
import TextField from "../../../components/Fields/TextField";
import DropdownField from "../../../components/Fields/DropdownField";
import CheckboxField from "../../../components/Fields/CheckboxField";

interface CustomFieldsInputsProps {
  /** The subtype required to show this custom field set */
  subtype: string;
  /** The array of custom fields to iterate through and map from */
  fields: CustomField[] | undefined;
  flat_contact: Record<string, any>;
  disabled?: boolean;
  /** Required for editing */
  handleFields?: (id: string, value: any) => void;
}

export default function CustomFieldsInputs(props: CustomFieldsInputsProps) {
  const { subtypes } = useSubtypesContext()!;

  return props.fields && props.fields.length > 0 && subtypes?.map(s => s.toLowerCase()).includes(props.subtype.toLowerCase()) && <>
    <h1 className="text-xl font-semibold text-secondary mt-14 mb-4 text-center">{capitalize(props.subtype)} Details</h1>
    <div className="grid grid-cols-1 gap-x-3 gap-y-6 md:gap-y-8 md:grid-cols-2">
      {Array.from(props.fields).map(field => {
        const id = `${capitalize(props.subtype)}_Contact_Details.${field.name}`;

        switch (field.html_type) {
          case "Text":
            return <TextField className="flex justify-center" label={field.label} id={id} fields={props.flat_contact} disabled={props.disabled} handleFields={props.handleFields} required={field.is_required} />
          case "Radio":
            return <DropdownField className="flex justify-center" label={field.label} id={id} fields={props.flat_contact} options={field.options} disabled={props.disabled} handleFields={props.handleFields} required={field.is_required} />
          case "Select":
            return <DropdownField className="flex justify-center" label={field.label} id={id} fields={props.flat_contact} options={field.options} disabled={props.disabled} handleFields={props.handleFields} required={field.is_required} />
          case "CheckBox":
            return <CheckboxField className="flex justify-center" label={field.label} id={id} fields={props.flat_contact} options={field.options} disabled={props.disabled} handleFields={props.handleFields} required={field.is_required} />
        }
      })}
    </div>
  </> 
}