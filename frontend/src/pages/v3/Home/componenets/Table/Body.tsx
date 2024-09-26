import { PropsWithChildren } from "react";

export default function Body({ children }: PropsWithChildren) {
    return <tbody className="bg-white divide-y divide-gray-200">
        {children}
    </tbody>
}