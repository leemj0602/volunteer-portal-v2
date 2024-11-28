import { PropsWithChildren } from "react";

interface StatusProps extends PropsWithChildren {
    className?: string;
    onClick?: any;
}

export default function Status(props: StatusProps) {
    return <button className={`flex items-center justify-center px-4 leading-8 font-semibold rounded-md w-[120px] ${props.onClick ? "cursor-pointer" : "cursor-default"} ${props.className}`} onClick={props.onClick}>
        {props.children}
    </button>
}