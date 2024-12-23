import Entity from "./Entity";

export class PendingDonation extends Entity {
    data: {

    } = {};

    constructor(data: Record<string, any>) {
        super(data);
        for (const key in data)
            this.setNestedValue(this.data, key, data[key]);
    }
}