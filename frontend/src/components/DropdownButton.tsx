import { PropsWithChildren, useEffect, useRef, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";

interface DropdownButtonProps extends PropsWithChildren {
    label: string;
    className?: string;
}

export default function DropdownButton(props: DropdownButtonProps) {
    const [show, setShow] = useState(false);
    const handleDropdown = () => setShow(!show);

    const ref = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (!ref.current?.contains(e.target as Node)) setShow(false);
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [ref]);

    return <div className={`relative w-full lg:w-[200px] ${props.className}`} ref={ref}>
        <button className="bg-secondary text-white flex justify-between px-4 py-2 rounded-md items-center w-full" onClick={handleDropdown}> 
            <span>{props.label}</span>
            <IoIosArrowDown />
        </button>
        {show && props.children}
    </div>
}