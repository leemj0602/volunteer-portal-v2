import CRM from "../../crm";

export interface CustomFieldOptions {
  id: number;
  name?: string;
  label: string;
  value: string;
  option_group_id?: number;
}

export interface CustomField {
  id: number;
  name: string;
  label: string;
  html_type: string;
  option_group_id: number | null;
  "option_group_id:name": string;
  options: CustomFieldOptions[];
  data_type: string;
}

class CustomFieldSetHandler {
  private entity: string = "CustomField";

  /** Fetch custom fields by the custom field set's name */
  async fetch(name: string) {
    const response = await CRM(this.entity, "get", {
      where: [["custom_group_id:name", "=", name]],
      select: ["name", "label", "html_type", "option_group_id", "option_group_id:name", "data_type"],
    });

    const customFields = response?.data as CustomField[];
    const optionGroupIds = customFields.map((f: CustomField) => f.option_group_id).filter(id => id);

    const _response = await CRM("OptionValue", "get", {
      select: ["label", "value", "name", "option_group_id"],
      where: [["option_group_id", "IN", optionGroupIds]]
    });
    const customFieldOptionValues = _response!.data as CustomFieldOptions[];

    return customFields.map(field => ({ 
      ...field,
      options: customFieldOptionValues.filter(opt => opt.option_group_id == field.option_group_id)
    }));
  }
}

export default new CustomFieldSetHandler;