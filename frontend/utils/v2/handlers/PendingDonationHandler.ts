import CRM from "../../crm";
import ContactHandler from "./ContactHandler";

class PendingDonationHandler {
    private entity: string = "Activity";

    async fetchCustomFields() {
        const response = await CRM("CustomField", "get", {
            select: [
                'custom_group_id:name',
                'name',
                'label',
            ],
            where: [
                ['OR', [
                    ['label', '=', 'NRIC/FIN/UEN'],
                    ['label', '=', 'Personal Data Protection Act'],
                    ['label', '=', 'Recurring Payment'],
                    ['label', '=', 'Anonymity Preference'],
                    ['label', '=', 'Marketing Consent'],
                    ['label', '=', 'Donation Campaign'],
                ]],
                ['custom_group_id:name', '=', 'pencon_customgroup'],
            ],
        })

        if (!response || !response.data) {
            throw new Error("Failed to fetch custom fields or no values returned");
        }

        // Map the custom fields: label -> custom_group_id:name.name
        const fieldMapping: Record<string, string> = {};
        response.data.forEach((field: { label: string; name: string; 'custom_group_id:name': string }) => {
            const fieldKey = `${field['custom_group_id:name']}.${field.name}`;
            fieldMapping[field.label] = fieldKey;
        });

        return fieldMapping;
    }

    async create(email: string, finType: number, amount: number, paymentMethod: string, nric: string, recurring: number, campaignId?: number) {
        // Fetch contact
        const contact = await ContactHandler.fetch(email);
        if (!contact || !contact.data?.id) {
            throw new Error("Contact not found");
        }

        // Fetch and map custom fields
        const customFieldsMapped = await this.fetchCustomFields();
        const nricField = customFieldsMapped['NRIC/FIN/UEN'];
        const pdpaField = customFieldsMapped['Personal Data Protection Act'];
        const recurringField = customFieldsMapped['Recurring Payment'];
        const marketingField = customFieldsMapped['Marketing Consent'];
        const anonymityField = customFieldsMapped['Anonymity Preference'];
        const campaignField = customFieldsMapped['Donation Campaign'];

        // Ensure required fields are present
        if (!nricField || !pdpaField || !recurringField) {
            throw new Error("Required custom fields not found");
        }

        const values: [string, any][] = [
            ['activity_type_id:name', 'pencon_activitytype'],
            ['status_id:name', 'Scheduled'],
            ['source_contact_id', contact.data.id],
            ['target_contact_id', contact.data.id],
            ['pencon_customgroup.pencon_cf_fintype', finType],
            ['pencon_customgroup.pencon_cf_ammount', amount],
            ['pencon_customgroup.pencon_cf_source', 'Donor Portal'],
            ['pencon_customgroup.pencon_cf_paymeth', paymentMethod],
            [nricField, nric],
            [pdpaField, [1]],
            [recurringField, recurring],
            [marketingField, ''],
            [anonymityField, ''],
        ]

        if (campaignId) {
            values.push([campaignField, campaignId]);
        }

        const response = await CRM(this.entity, "create", { values }).catch((error: any) => {
            console.error("CRM create error:", error);
            throw new Error("CRM create request failed");
        });

        if (!response) {
            throw new Error("Failed to create pending donation");
        }

        return (response.data[0].id);
    }

    async update(id: number) {
        const response = await CRM(this.entity, "update", {
            values: [
                ['status_id:name', 'Payment Successful'],
            ],
            where: [
                ['id', '=', id],
            ]
        }).catch((error: any) => {
            console.error("CRM create error:", error);
            throw new Error("CRM create request failed");
        });

        if (!response) {
            throw new Error("Failed to update pending donation");
        }

        return (response.data.length > 0);
    }
}

export default new PendingDonationHandler;