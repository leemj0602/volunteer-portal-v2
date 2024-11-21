import { ChangeEvent, useState } from "react";
import { MdInfoOutline } from "react-icons/md";

interface TextareaFieldProps {
    id: string;
    label: string;
    info?: string;
    value?: string;
    fields?: any;
    handleFields?: (id: string, value: any) => void;
    handleChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
    disabled?: boolean;
    showInfo?: boolean;
    className?: string;
    rows?: number;
    wordLimit?: number; // Add word limit prop
}

export default function TextareaField(props: TextareaFieldProps) {
    const [isHovering, setIsHovering] = useState(false);
    const [currentValue, setCurrentValue] = useState(props.value || "");
    const [wordCount, setWordCount] = useState(0);

    const handleHovering = () => setIsHovering(!isHovering);

    const countWords = (text: string) => text.trim().split(/\s+/).length;

    const onChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        const inputText = e.target.value;
        const words = countWords(inputText);

        if (props.wordLimit && words > props.wordLimit) {
            return; // Prevent input if word limit is exceeded
        }

        setCurrentValue(inputText);
        setWordCount(words);

        if (props.handleChange) {
            props.handleChange(e);
        } else if (props.handleFields) {
            props.handleFields(props.id, inputText);
        }
    };

    return (
        <div className={props.className}>
            <div className="w-full md:w-[300px]">
                {/* Label */}
                <div className="flex flex-row justify-between items-center mb-1">
                    <label
                        htmlFor={props.id}
                        className={`font-semibold ${props.disabled ? "opacity-40" : ""}`}
                    >
                        {props.label}
                    </label>
                    {props.showInfo && props.info?.length !== 0 && (
                        <div
                            className="relative"
                            onMouseEnter={handleHovering}
                            onMouseLeave={handleHovering}
                        >
                            <MdInfoOutline className="text-secondary cursor-pointer" />
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
                {/* Textarea */}
                <div className="relative">
                    <textarea
                        id={props.id}
                        className="w-full py-2 px-4 rounded-[5px] disabled:bg-white disabled:cursor-not-allowed outline-none border-none"
                        value={currentValue}
                        placeholder={
                            props.value !== undefined ? props.value : props.fields?.[props.id]
                        }
                        disabled={props.disabled}
                        onChange={onChange}
                        rows={props.rows || 4}
                    />
                    {/* Word Limit Display */}
                    {props.wordLimit && (
                        <div className="text-right text-sm text-gray-500 mt-1">
                            {`${wordCount}/${props.wordLimit} words`}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
