import { PropsWithChildren } from "react"

export default function Header({ children }: PropsWithChildren) {
    return <thead className="bg-white">
        <tr>{children}</tr>
    </thead>
}