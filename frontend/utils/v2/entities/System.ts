import Entity from "./Entity";

export class System extends Entity {
    data: {
        version?: string;
        civi?: {
            components: string[];
        }
    } = {};

    constructor(data: Record<string, any>) {
        super(data);
        for (const key in data)
            this.setNestedValue(this.data, key, data[key]);
    }
}