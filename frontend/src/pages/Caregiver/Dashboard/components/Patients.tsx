import { useEffect, useState } from "react";
import { Contact } from "../../../../../utils/classes/Contact"
import { Relationship } from "../../../../../utils/classes/Relationship";
import Loading from "../../../../components/Loading";
import PatientCard from "./PatientCard";

interface PatientsProps {
  contact: Contact;
}

export default function Patients(props: PatientsProps) {
  const [relationships, setRelationships] = useState<Relationship[]>();

  useEffect(() => {
    (async () => {
      const relationships = await props.contact.fetchPatients();
      setRelationships(relationships);
      console.log(relationships);
    })();
  }, []);

  return <div>
    <h2 className="text-xl font-semibold mt-5 mb-5">Patients</h2>
    {!relationships ? <Loading /> : <div className="grid grid-cols-4 gap-x-6">
      {relationships.map(r => <PatientCard relationship={r} />)}
    </div>}
  </div>
}