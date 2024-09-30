import { PropsWithChildren } from "react"

interface TableBodyProps extends PropsWithChildren {
    header: string;
}

export default function Table(props: TableBodyProps) {
    return <div className="mt-8 rounded-lg">
        <h2 className="text-xl font-semibold mt-5 mb-5">{props.header}</h2>
        <div className="border-white rounded-lg shadow-md overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
                {props.children}
            </table>
        </div>
    </div>
}