import { Link } from "react-router-dom";
import { RxDashboard } from "react-icons/rx";
import { CgProfile } from "react-icons/cg";
import O8Logo from "../../../assets/O8Logo.png";
import { PiSignOutBold } from "react-icons/pi";
import { LuCalendarRange } from "react-icons/lu";
import axios from "axios";
import { useEffect, useState } from "react";
import SignOut from "../../../assets/SignOut.png";
import config from "../../../../config.json";
import { GiHamburgerMenu } from "react-icons/gi";
import { FaBriefcaseMedical, FaChalkboardTeacher, FaClinicMedical, FaDonate, FaHeartbeat, FaInfoCircle } from "react-icons/fa";
import Swal from "sweetalert2";
import { BiDonateHeart } from "react-icons/bi";
import Category from "./Category";
import Item from "./Item";
import { RiMailSendFill } from "react-icons/ri";
import { useSubtypesContext } from "../../contexts/Subtypes";
import ContactManager from "../../../utils/managers/ContactManager";

interface NavbarProps {
    className: string;
}

export default function Navbar(props: NavbarProps) {
    const { subtypes } = useSubtypesContext()!;

    const openModal = async () => {
        const result = await Swal.fire({
            imageUrl: SignOut,
            imageWidth: 240,
            imageHeight: 160,
            width: 400,
            text: "Are you sure you want to sign out?",
            confirmButtonColor: "#5a71b4",
            confirmButtonText: "Sign Out",
            cancelButtonText: "Cancel",
            showCloseButton: true,
            showCancelButton: true
        });

        if (result.isConfirmed) {
            Swal.fire({ title: "Signing out...", timer: 3000, timerProgressBar: true, showConfirmButton: false });
            await axios.get(`${config.domain}/portal/api/logout.php`);
            window.location.href = `${config.domain}/wp-login.php?redirect_to=${encodeURIComponent(window.location.href)}`;
        }
    }

    const [menuOpen, setMenuOpen] = useState(false);

    return subtypes && <>
        <nav className={`h-full fixed bg-white flex-col hidden z-[11] overflow-y-auto ${props.className} md:flex`}>
            {/* Responsible for the image */}
            <Link to="/" className="p-4 flex items-center">
                <img src={O8Logo} />
            </Link>
            {/* Navigation */}
            <div className="mt-6 flex flex-col justify-between h-full">
                <div className="mb-2">
                    {subtypes.includes('Volunteer') && <Category to="/volunteer" icon={FaBriefcaseMedical} name="Volunteer">
                        <Item to="/volunteer/events" name="Events" />
                        <Item to="/volunteer/trainings" name="Trainings" />
                    </Category>}
                    {subtypes.includes('Donator') && <Category to="/donations" icon={FaDonate} name="Donator">
                    </Category>}
                    {subtypes.includes('Caregiver') && <Category to="/caregiver" icon={FaHeartbeat} name="Caregiver">
                        <Item to="/caregiver/service-info-pack" icon={FaInfoCircle} name="Service Info Pack" />
                        <Item to="/caregiver/requests" icon={RiMailSendFill} name="Request for Volunteer" />
                        <Item to="/caregiver/trainings" icon={FaChalkboardTeacher} name="Trainings" />
                    </Category>}
                    {subtypes.includes('Patient') && <Category to="/patient" icon={FaClinicMedical} name="Patient">
                        <Item to="/patient/service-info-pack" icon={FaInfoCircle} name="Service Info Pack" />
                        <Item to="/patient/requests" icon={RiMailSendFill} name="Request for Volunteer" />
                    </Category>}
                </div>
                <div className="w-full">
                    <Item to="/profile" icon={CgProfile} name="Profile" />
                    <button onClick={openModal} className="flex pl-9 py-2 items-center gap-x-4 text-secondary border-l-4 font-semibold hover:bg-primary/10 hover:text-secondary/90 border-l-transparent hover:border-l-secondary/70 w-full">
                        <PiSignOutBold />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>
        </nav>
        {menuOpen && <div className="h-full w-screen bg-black opacity-30 z-[11] fixed md:hidden" onClick={() => setMenuOpen(false)} />}
        <nav className="w-full fixed bg-white rounded-b-lg flex flex-col z-20 md:hidden">
            <div className="flex justify-between h-20 items-center px-6">
                {/* Responsible for the image */}
                <div className="p-4 w-[220px] flex items-center">
                    <img src={O8Logo} />
                </div>
                {/* Button */}
                <button className={`text ${menuOpen ? "text-secondary" : "text-primary"} hover:text-secondary`} onClick={() => setMenuOpen(!menuOpen)}>
                    <GiHamburgerMenu size={24} />
                </button>
            </div>
            {menuOpen && <>
                <hr />
                <div className="flex flex-col pt-2 max-h-[200px] overflow-y-scroll">
                    <Link to="/">
                        <div className="text-center hover:bg-primary/30 text-secondary hover:text-secondary/90 font-semibold flex pl-12 py-2 mb-2 items-center gap-x-4">
                            <RxDashboard />
                            Dashboard
                        </div>
                    </Link>
                    <Link to="/events">
                        <div className="text-center hover:bg-primary/30 text-secondary hover:text-secondary/90 font-semibold flex pl-12 py-2 mb-2 items-center gap-x-4">
                            <LuCalendarRange />
                            Events
                        </div>
                    </Link>
                    <Link to="/trainings">
                        <div className="hover:bg-primary/30 text-secondary hover:text-secondary/90 font-semibold flex pl-12 py-2 mb-2 items-center gap-x-4">
                            <FaChalkboardTeacher />
                            Trainings
                        </div>
                    </Link>
                    <Link to="/profile">
                        <div className="text-center hover:bg-primary/30 text-secondary hover:text-secondary/90 font-semibold flex pl-12 py-2 mb-2 items-center gap-x-4">
                            <CgProfile />
                            Profile
                        </div>
                    </Link>
                    {/* {system?.data.civi?.components.includes("CiviContribute") && <Link to="/donations">
                        <div className="text-center hover:bg-primary/30 text-secondary hover:text-secondary/90 font-semibold flex pl-12 py-2 mb-2 items-center gap-x-4">
                            <BiDonateHeart />
                            Donations
                        </div>
                    </Link>} */}
                    <button onClick={openModal} className="text-center hover:bg-primary/30 text-secondary hover:text-secondary/90 font-semibold flex pl-12 py-2 mb-2 items-center gap-x-4">
                        <PiSignOutBold />
                        <span>Sign Out</span>
                    </button>
                </div>
            </>}
        </nav>
    </>
}