import axios from "axios";
import Entity, { obj } from "./Entity";
import config from "../../../../config.json";
import CRM from "../../crm";

export class RecurringDonation extends Entity {
    data: {
        id?: number;
        subject?: string;
    } = {};

    constructor(data: obj) {
        super(data);
        for (const key in data)
            this.setNestedValue(this.data, key, data[key]);
    }

    async fetchStripe() {
        const response = await axios.post(`${config.domain}/portal/api/stripe/get_subscription.php`, { subscriptionId: this.data.subject! }).catch(() => null);
        if (!response) return null;
        await CRM("Activity", "update", {
            where: [["id", "=", this.data.id]],
            values: [["status_id:name", "Cancelled"]]
        });;
        return response.data;
    }
}
