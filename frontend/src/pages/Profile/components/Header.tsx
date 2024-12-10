import { Contact } from "../../../../utils/v2/entities/Contact"

interface HeaderProps {
  contact: Contact;
}

export default function Header({ contact }: HeaderProps) {
  return <>
    {/* Header PC */}
    <div className="p-4 relative bg-primary/20 h-[140px] hidden md:block">
      <div className="flex flex-row items-center absolute -bottom-[44%] lg:left-20">
        {/* Profile Picture */}
        <div className="w-[130px] h-[130px] rounded-full bg-gray-300 mr-6 border-[#f4f5fb] border-8">

        </div>
        {/* Text */}
        <div className="grid-cols-1 gap-y-6 hidden lg:grid">
          <h1 className="font-bold text-2xl">{contact.data.first_name} {contact.data.last_name ?? ""}</h1>
          <h2 className="font-semibold">{contact.data.address_primary?.street_address}</h2>
        </div>
      </div>
    </div>
    {/* Header Mobile */}
    <div className="p-4 bg-primary/20 md:hidden flex justify-center items-center">
      <div className="w-full flex flex-col justify-center items-center">
        {/* Profile Picture */}
        <div className="w-[120px] h-[120px] mx-auto rounded-full bg-gray-300 border-[#f4f5fb] border-8">

        </div>
        {/* Text */}
        <div className="text-center mt-4">
          <h1 className="font-bold text-2xl">{contact.data.first_name} {contact.data.last_name ?? ""}</h1>
          <h2 className="font-semibold">{contact.data.address_primary?.street_address}</h2>
        </div>
      </div>
    </div>
  </>
}