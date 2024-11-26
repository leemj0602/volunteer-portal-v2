import CRM from "../crm";

export interface OptionValue {
    name?: string;
    label: string;
    value: number;
    "option_group_id:name": string;
}

const OptionValueManager = new class OptionValueManager {
    private entity: string = "OptionValue";

    async get(ogid_name: string, value: number) {
        const response = await CRM(this.entity, "get", {
            select: ["name", "label", "value", "option_group_id:name"],
            where: [
                ["option_group_id:name", "=", ogid_name],
                ["value", "=", value]
            ]
        })

        const optionValue = response?.data[0] as OptionValue;

        return optionValue;
    }
}

export default OptionValueManager