export interface RelationshipProps {
  id: number;
  "relationship_type_id:name": string;
  "contact_id_a.first_name": string;
  "contact_id_a.last_name": string;
  "contact_id_a.phone_primary.phone_numeric": string;
  "contact_id_a.email_primary.email": string;
  "contact_id_a.address_primary.street_address": null,
  "contact_id_a.address_primary.postal_code": null,
  "contact_id_a.gender_id:label": null
  created_date: string;
}

export class Relationship implements RelationshipProps {
  id: number;
  "relationship_type_id:name": string;
  "contact_id_a.first_name": string;
  "contact_id_a.last_name": string;
  "contact_id_a.phone_primary.phone_numeric": string;
  "contact_id_a.email_primary.email": string;
  "contact_id_a.address_primary.street_address": null;
  "contact_id_a.address_primary.postal_code": null;
  "contact_id_a.gender_id:label": null;
  created_date: string;
  constructor(props: RelationshipProps) {
    this.id = props.id;
    this["relationship_type_id:name"] = props["relationship_type_id:name"];
    this["contact_id_a.first_name"] = props["contact_id_a.first_name"];
    this["contact_id_a.last_name"] = props["contact_id_a.last_name"];
    this["contact_id_a.phone_primary.phone_numeric"] = props["contact_id_a.phone_primary.phone_numeric"];
    this["contact_id_a.email_primary.email"] = props["contact_id_a.email_primary.email"];
    this["contact_id_a.address_primary.street_address"] = props["contact_id_a.address_primary.street_address"];
    this["contact_id_a.address_primary.postal_code"] = props["contact_id_a.address_primary.postal_code"];
    this["contact_id_a.gender_id:label"] = props["contact_id_a.gender_id:label"];
    this.created_date = props.created_date;
  } 
}