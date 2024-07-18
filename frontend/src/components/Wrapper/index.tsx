import { PropsWithChildren } from "react";
import Navbar from "./Navbar";

export default function Wrapper(props: PropsWithChildren) {
    return <>
        <Navbar className="w-52" />
        <div className="md:ml-52 md:pt-0 pt-20">
            {props.children}
        </div>
    </>
}