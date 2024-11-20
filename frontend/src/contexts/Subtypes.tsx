import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import ContactManager from "../../utils/managers/ContactManager";

interface SubtypesContextType {
  subtypes: string[] | null;
  setSubTypes: React.Dispatch<React.SetStateAction<string[] | null>>;
}
export const SubtypesContext = createContext<SubtypesContextType | null>(null);

export const SubtypesProvider = ({ children }: PropsWithChildren) => {
  const [subtypes, setSubTypes] = useState<string[] | null>(null);

  useEffect(() => {
    (async () => {
      const email = (window as any).email;
      const contact = await ContactManager.fetch(email);
      setSubTypes(contact.contact_sub_type ?? []);
    })();
  }, []);

  return <SubtypesContext.Provider value={{ subtypes, setSubTypes }}>
    {children}
  </SubtypesContext.Provider>
}

export const useSubtypesContext = (): (SubtypesContextType | null) => {
  const context = useContext(SubtypesContext);
  return context;
}