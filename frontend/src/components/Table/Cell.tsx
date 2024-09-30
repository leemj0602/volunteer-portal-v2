import { PropsWithChildren } from "react";

interface TableCellProps extends PropsWithChildren {
    colSpan?: number;
    className?: string;
}

export default function Cell(props: TableCellProps) {
    return <td colSpan={props.colSpan} className={`whitespace-nowrap px-6 py-2 ${props.className}`}>
        {props.children}
    </td>
}