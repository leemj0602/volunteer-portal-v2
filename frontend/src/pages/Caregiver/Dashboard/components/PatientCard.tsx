import moment from "moment";
import { Relationship } from "../../../../../utils/classes/Relationship"
import Card from "../../../../components/Card";
import { FaFemale, FaLocationArrow, FaMale, FaPhone } from "react-icons/fa";
import { IoMdMail } from "react-icons/io";

interface PatientCardProps {
  relationship: Relationship;
}

export default function PatientCard({ relationship }: PatientCardProps) {
  return <Card hideThumbnail disableHover>
    <p className="font-semibold text-gray-600 text-lg mb-1">{relationship["contact_id_a.first_name"]} {relationship["contact_id_a.last_name"]?.length ? relationship["contact_id_a.last_name"] : ""} {relationship["contact_id_a.gender_id:label"] == "Male" ? <FaMale /> : relationship["contact_id_a.gender_id:label"] == "Female" ? <FaFemale /> : ""}</p>
    <p className="text-gray-600 italic">Since {moment(relationship.created_date).format("DD/MM/YYYY")}</p>
    <hr className="mt-2 mb-4" />
    {relationship["contact_id_a.phone_primary.phone_numeric"] && <p><FaPhone className="text-secondary" /> {relationship["contact_id_a.phone_primary.phone_numeric"]}</p>}
    {relationship["contact_id_a.email_primary.email"] && <p><IoMdMail className="text-secondary" /> {relationship["contact_id_a.email_primary.email"]}</p>}
    {relationship["contact_id_a.address_primary.street_address"] && <p><FaLocationArrow className="text-secondary" /> {relationship["contact_id_a.address_primary.street_address"]}</p>}
  </Card>
}