import { Contribution } from "../../../../utils/v2/entities/Contribution";
import { FaArrowUp, FaArrowDown } from "react-icons/fa6";

interface SummarisationProps {
    donations: Contribution[];
}

export default function Summarisation(props: SummarisationProps) {
    console.log(props.donations);

    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    const weekSum = props.donations.filter(d => new Date(d.data.receive_date!) >= weekAgo).reduce((a, b) => a + b.data.total_amount!, 0);
    const weekPercentage = calculatePercentage(props.donations, weekAgo, 7);

    const monthAgo = new Date(now);
    monthAgo.setMonth(now.getMonth() - 1);
    const monthSum = props.donations.filter(d => new Date(d.data.receive_date!) >= monthAgo).reduce((a, b) => a + b.data.total_amount!, 0);
    const monthPercentage = calculatePercentage(props.donations, monthAgo, 28);

    const yearAgo = new Date(now);
    yearAgo.setFullYear(now.getFullYear() - 1);
    const yearSum = props.donations.filter(d => new Date(d.data.receive_date!) >= yearAgo).reduce((a, b) => a + b.data.total_amount!, 0);
    const yearPercentage = calculatePercentage(props.donations, yearAgo, 365);

    return <div className="grid grid-cols-1 lg:grid-cols-3 gap-y-4 bg-gray-100 rounded-lg p-6">
        <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-700">THIS WEEK</h3>
            <div className="flex flex-row justify-center items-center text-lg text-secondary font-semibold">
                <span>S$ {weekSum.toFixed(2)}</span>
                {isValidPercentage(weekPercentage) && <span className={`flex flex-row items-center ml-4 text-sm ${weekPercentage < 0 ? "text-red-500" : "text-green-400"}`}>
                    {weekPercentage < 0 ? <FaArrowDown /> : <FaArrowUp />}{weekPercentage.toFixed(2)}%
                </span>}
            </div>
        </div>
        <div className="text-center lg:border-x-2 border-y-2 lg:border-y-0 py-4 lg:py-0 border-gray-300">
            <h3 className="text-lg text-gray-700 font-semibold">THIS MONTH</h3>
            <div className="flex flex-row justify-center items-center text-lg text-secondary font-semibold">
                <span>S$ {monthSum.toFixed(2)}</span>
                {isValidPercentage(monthPercentage) && <span className={`flex flex-row items-center ml-4 text-sm ${monthPercentage < 0 ? "text-red-500" : "text-green-400"}`}>
                    {monthPercentage < 0 ? <FaArrowDown /> : <FaArrowUp />}{monthPercentage.toFixed(2)}%
                </span>}
            </div>
        </div>
        <div className="text-center">
            <h3 className="text-lg text-gray-700 font-semibold">THIS YEAR</h3>
            <div className="flex flex-row justify-center items-center text-lg text-secondary font-semibold">
                <span>S$ {yearSum.toFixed(2)}</span>
                {isValidPercentage(yearPercentage) && <span className={`flex flex-row items-center ml-4 text-sm ${yearPercentage < 0 ? "text-red-500" : "text-green-400"}`}>
                    {yearPercentage < 0 ? <FaArrowDown /> : <FaArrowUp />}{yearPercentage.toFixed(2)}%
                </span>}
            </div>
        </div>
    </div>
}

function calculatePercentage(donations: Contribution[], date: Date, days: number) {
    const sum = donations.filter(d => new Date(d.data.receive_date!) >= date).reduce((a, b) => a + b.data.total_amount!, 0);
    const newDate = new Date(date);
    newDate.setDate(date.getDate() - days);
    const secondSum = donations.filter(d => new Date(d.data.receive_date!) >= newDate && new Date(d.data.receive_date!) <= newDate).reduce((a, b) => a + b.data.total_amount!, 0);
    return ((sum - secondSum) / secondSum) * 100;
}

function isValidPercentage(percentage: number) {
    return percentage != Infinity && percentage != 0 && !isNaN(percentage);
}