import CRM from "../crm";

export interface CustomFieldOptions {
    name?: string;
    label: string;
    value: string;
    option_group_id?: number;
}

export interface CustomField {
    name: string;
    label: string;
    html_type: string;
    option_group_id: number | null;
    options?: CustomFieldOptions[];
    data_type: string;
}

const CustomFieldSetManager = new class CustomFieldSetManager {
    private entity: string = "CustomField";

    async get(name: string) {
        const response = await CRM(this.entity, "get", {
            select: ["name", "label", "html_type", "option_group_id", "data_type"],
            where: [["custom_group_id:name", "=", name]]
        });
        const customFields = response!.data as CustomField[];
        const optionGroupIds = customFields.map((f: CustomField) => f.option_group_id).filter(id => id);
        
        const response2 = await CRM("OptionValue", "get", {
            select: ["label", "value", "name", "option_group_id"],
            where: [["option_group_id", "IN", optionGroupIds]]
        });
        const customFieldOptionValues = response2!.data as CustomFieldOptions[];

        const result: Map<string, CustomField> = new Map<string, CustomField>(customFields.map(f => (
            [`${name}.${f.name}`, {
                ...f,
                options: customFieldOptionValues.filter(opt => opt.option_group_id == f.option_group_id)
            }]
        )));
        return result;
    }
}

export default CustomFieldSetManager;