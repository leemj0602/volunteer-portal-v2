interface MandatoryCustomMembershipProps {
    "Membership_Purchase_Details.Pricing": number | null;
    "Membership_Purchase_Details.Expiration_Date": string | null;
    [key: string]: any;
}

export interface MembershipPurchaseProps extends MandatoryCustomMembershipProps {
    id: number | null;
    activity_date_time: string | null;
}

export class MembershipPurchase implements MembershipPurchaseProps {
    public id: number | null;
    public activity_date_time: string | null;

    public "Membership_Purchase_Details.Pricing": number | null;
    public "Membership_Purchase_Details.Expiration_Date": string | null;

    constructor(props: MembershipPurchaseProps) {
        this.id = props.id;
        this.activity_date_time = props.activity_date_time;
    }

}