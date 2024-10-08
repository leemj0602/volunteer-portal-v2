import Entity, { obj } from "./Entity";

export class Contribution extends Entity {
    data: {
        id?: number;
        // contact?: typeof Contact.prototype.data;
        currency?: string;
        source?: string;
        total_amount?: number;
        receive_date?: string;
        "financial_type_id:label"?: string;
        "payment_instrument_id:label"?: string;
    } = {};

    constructor(data: obj) {
        super(data);
        for (const key in data)
            this.setNestedValue(this.data, key, data[key]);
    }
}