import { inflect } from "inflection";

interface PageNavigationProps {
    page: number;
    pages: number;
    limit: number;
    array: any[];
    previousPage: () => void;
    nextPage: () => void;
}

export default function PageNavigation({ page, pages, limit, array, previousPage, nextPage }: PageNavigationProps) {
    return <div className="flex justify-between items-center mt-4">
        <span className="text-gray-500">
            {array.length === 0
                ? "No entries to show"
                : (page * limit + 1 === Math.min((page + 1) * limit, array.length))
                    ? `Showing ${page * limit + 1} of ${array.length} ${inflect("entry", array.length)}`
                    : `Showing ${page * limit + 1} - ${Math.min((page + 1) * limit, array.length)} of ${array.length} ${inflect("entries", array.length)}`}
        </span>
        <div className="flex items-center space-x-2">
            {/* Previous Page */}
            <button className={`px-2 text-2xl font-medium rounded ${page == 0 ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:text-black"}`} onClick={previousPage} disabled={page == 0}>
                &laquo;
            </button>
            <span className="text-lg font-medium text-gray-700">
                {page + 1}
            </span>
            {/* Next Page */}
            <button className={`px-2 text-2xl font-medium rounded ${page >= pages ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:text-black"}`} onClick={nextPage} disabled={page >= pages}>
                &raquo;
            </button>
        </div>
    </div>
}