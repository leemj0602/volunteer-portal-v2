import axios from "axios";
import config from "../../../../config";
import { System } from "../entities/System";

class ContributionHandler {
        async fetch(): Promise<System | null> {
        const response = await axios.post(`${config.domain}/portal/api/system.php`);
        if (!response) return null;
        return response.data.values.map((d: any) => new System(d))[0];
    }
}

export default new ContributionHandler;