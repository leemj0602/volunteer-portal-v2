import { ChangeEvent, useEffect, useRef, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { CustomFieldOptions } from "../../../utils/managers/CustomFieldSetManager";
import { MdInfoOutline } from "react-icons/md";

interface DropdownFieldProps {
    id: string;
    fields: any;
    /** The actual code to update a specific field by its id */
    handleFields?: (id: string, value: any) => void;
    disabled?: boolean;
    className?: string;
    placeholder?: string;
    options: CustomFieldOptions[];
    label: string;
    required?: boolean;
    info?: string;
    showInfo?: boolean;
}

export default function DropdownField(props: DropdownFieldProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState<CustomFieldOptions | null>(null);
    const [isHovering, setIsHovering] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const toggleDropdown = () => setIsMenuOpen(!isMenuOpen);
    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selected = props.options.find((opt) => opt.value === e.target.value) || null;
        setSelectedOption(selected);
        if (props.handleFields) {
            toggleDropdown();
            props.handleFields(props.id, e.target.value);
        }
        setIsMenuOpen(false);
    }

    useEffect(() => {
        const selected = props.options.find((opt) => opt.value === props.fields[props.id]) || null;
        setSelectedOption(selected);
    }, [props.fields, props.id, props.options]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsMenuOpen(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [dropdownRef]);

    const handleHovering = () => setIsHovering(!isHovering);

    return <div className={props.className}>
        <div className="w-full md:w-[300px]">
            {/* Label */}
            <div className="flex flex-row justify-between items-center mb-1">
                <label htmlFor={props.id} className={`font-semibold ${props.disabled ? "opacity-40" : ""}`}>
                    {props.label}
                    {props.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {props.showInfo && props.info?.length !== 0 && (
                    <div
                        className="relative"
                        onMouseEnter={handleHovering}
                        onMouseLeave={handleHovering}
                    >
                        <MdInfoOutline className="text-secondary cursor-pointer" />
                        {/* Information block */}
                        {isHovering && (
                            <div className="absolute w-[240px] top-5 right-0 bg-white p-1 rounded-lg shadow-md text-center text-[12px] z-[1]">
                                <p className="text-secondary font-semibold text-[12px]">
                                    {props.info}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="relative" ref={dropdownRef}>
                {/* Input */}
                <div className="relative flex items-center">
                    <input type="text" id={props.id} placeholder={props.disabled ? props.options.find(o => o.value == props.fields[props.id])?.label ?? "None provided" : props.placeholder ?? "Please select an option"} className={`w-full py-2 px-4 rounded-t-[5px] disabled:bg-white caret-transparent outline-none select-none ${!isMenuOpen ? "rounded-b-[5px]" : ""} cursor-pointer disabled:cursor-not-allowed`} onClick={toggleDropdown} value={selectedOption?.label || ""} disabled={props.disabled} required={props.required} />
                    {!props.disabled && <IoIosArrowDown className="text-secondary absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />}
                </div>
                {/* Dropdown menu */}
                {!props.disabled && isMenuOpen && <div className="absolute z-[1] bg-white w-full rounded-b-[5px] flex flex-col py-2" role="menu" aria-orientation="vertical">
                    {props.options.map((opt: { label: string, value: any }) => {
                        return <div className="inline-block">
                            <input type="radio" className="hidden" name={props.id} value={opt.value} id={`${props.id}-${opt.value}`} checked={props.fields[props.id] == opt.value} onChange={onChange} />
                            <label htmlFor={`${props.id}-${opt.value}`} className={`px-4 py-2 text-sm block w-full ${props.fields[props.id] == opt.value ? "bg-gray-100" : "hover:bg-gray-100"}`}>{opt.label}</label>
                        </div>
                    })}
                </div>}
            </div>
        </div>
    </div>
}