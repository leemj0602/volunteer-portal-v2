import { useEffect, useState } from "react";
import { Contact } from "../../../../../utils/classes/Contact"
import { Relationship } from "../../../../../utils/classes/Relationship";

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

  </div>
}