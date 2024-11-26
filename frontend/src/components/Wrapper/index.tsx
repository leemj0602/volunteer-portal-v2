import { PropsWithChildren } from "react";
import Navbar from "./Navbar";

interface WrapperProps extends PropsWithChildren {
    location?: string;
}

export default function Wrapper(props: WrapperProps) {
    return <>
        <Navbar location={props.location} className="w-52" />
        <div className="md:ml-52 md:pt-0 pt-20">
            {props.children}
        </div>
    </>
}