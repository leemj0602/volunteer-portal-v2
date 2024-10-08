import Entity, { obj } from "./Entity";

export class System extends Entity {
    data: {
        version?: string;
        civi?: {
            components: string[];
        }
    } = {};

    constructor(data: obj) {
        super(data);
        for (const key in data)
            this.setNestedValue(this.data, key, data[key]);
    }
}