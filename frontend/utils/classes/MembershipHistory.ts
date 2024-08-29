export interface MembershipHistory {
    id: number;
    activity_date_time: string;
    "activity_type_id:name": string;
    "membership.membership_type_id:label": string;
    "membership.join_date": string;
    "membership.start_date": string;
    "membership.end_date": string;
}