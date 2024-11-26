import { useEffect, useState } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { MdInfoOutline } from "react-icons/md";

interface DateTimePickerFieldProps {
    id: string;
    label: string;
    info?: string;
    value?: Date | null;
    fields?: any;
    handleChange?: (date: Date | null) => void;
    handleFields?: (id: string, value: Date | null) => void;
    disabled?: boolean;
    showInfo?: boolean;
    className?: string;
    required?: boolean;
    showTimeSelect?: boolean;
    minDate?: Date | null;
    filterDate?: (date: Date) => boolean;
    filterTime?: (time: Date) => boolean;
}

export default function DateTimePickerField(props: DateTimePickerFieldProps) {
    const [isHovering, setIsHovering] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(props.value || null);

    useEffect(() => {
        setSelectedDate(props.value || null);
    }, [props.value]);

    const handleHovering = () => setIsHovering(!isHovering);

    const onChange = (date: Date | null) => {
        setSelectedDate(date);

        if (props.handleChange) {
            props.handleChange(date);
        } else if (props.handleFields) {
            props.handleFields(props.id, date);
        }
    };

    return (
        <>
            <div className={props.className}>
                <div className="w-full md:w-[300px]">
                    {/* Label */}
                    <div className="flex flex-row justify-between items-center mb-1">
                        <label
                            htmlFor={props.id}
                            className={`font-semibold ${props.disabled ? "opacity-40" : ""}`}
                        >
                            {props.label}
                            {props.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {/* Info Icon */}
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
                    {/* Date Time Picker */}
                    <div className="relative">
                        <ReactDatePicker
                            id={props.id}
                            className="w-full py-2 px-4 rounded-[5px] disabled:bg-white disabled:cursor-not-allowed outline-none border-none"
                            selected={selectedDate}
                            placeholderText={
                                props.value !== undefined
                                    ? props.value
                                    : props.fields?.[props.id]
                            }
                            disabled={props.disabled}
                            onChange={onChange}
                            showTimeSelect={props.showTimeSelect}
                            dateFormat={props.showTimeSelect ? "Pp" : "P"}
                            required={props.required}
                            minDate={props.minDate}
                            filterTime={props.filterTime}
                            filterDate={props.filterDate}
                        />
                    </div>
                </div>
            </div>

            <style>
                {`
                .react-datepicker-wrapper {
                    width: 100%;
                }
                .react-datepicker__input-container {
                    width: 100%;
                }
                .react-datepicker-popper {
                    width: 350px;
                    display: flex;
                    justify-content: center;
                }
                `}
            </style>
        </>
    )
}