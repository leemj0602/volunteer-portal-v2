export default class Entity {
    data: Record<string, any> = {};

    constructor(data: Record<string, any>) {
        this.data = data;
    }

    get flat() {
        return this.flatten(this.data) as Record<string, any>;
    }

    public setNestedValue(obj: any, key: string, value: any) {
        const args = key.split(".");
        let current = obj;
        
        for (let i = 0; i < args.length - 1; i++) {
            const arg = args[i];
            if (!current[arg]) current[arg] = {};
            current = current[arg];
        }
        
        current[args[args.length - 1]] = value;
    }

    public flatten(obj: any, prefix = "") {
        let result: any = {};

        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const value = obj[key];
                const newKey = prefix ? `${prefix}.${key}` : key;
    
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) Object.assign(result, this.flatten(value, newKey));
                else result[newKey] = value;
            }
        }

        return result;
    }
}