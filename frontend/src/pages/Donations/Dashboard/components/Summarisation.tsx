import numeral from "numeral";
import { Contribution } from "../../../../../utils/v2/entities/Contribution";
import { FaArrowUp, FaArrowDown } from "react-icons/fa6";

interface SummarisationProps {
    donations: Contribution[];
}

export default function Summarisation(props: SummarisationProps) {
    const now = new Date();
    
    const yearAgo = new Date(now);
    yearAgo.setFullYear(now.getFullYear() - 1);
    const yearSum = props.donations.filter(d => new Date(d.data.receive_date!) >= yearAgo).reduce((a, b) => a + b.data.total_amount!, 0);
    const yearPercentage = calculatePercentage(props.donations, yearAgo, 365);

    // Getting the earliest known year that isn't 2024
    let donationsPastYears = props.donations.filter(d => new Date(d.data.receive_date!).getFullYear() != now.getFullYear());
    let earliestYear = new Date(donationsPastYears[donationsPastYears.length - 1]?.data.receive_date! ?? now);
    if (earliestYear.getFullYear() == now.getFullYear()) earliestYear.setFullYear(now.getFullYear() - 1);
    donationsPastYears = donationsPastYears.filter(d => new Date(d.data.receive_date!).getFullYear() != earliestYear.getFullYear());
    // Getting the latest known year that isn't 2024
    let latestYear: Date | null = new Date(donationsPastYears[0]?.data.receive_date ?? now);
    if (latestYear.getFullYear() == now.getFullYear()) latestYear = null;

    const totalBeforeThisYear = props.donations.filter(d => new Date(d.data.receive_date!) < yearAgo).reduce((a, b) => a + b.data.total_amount!, 0);

    return <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-4 bg-gray-100 rounded-lg p-6">
        <div className="text-center border-gray-300 lg:border-r-2 pb-4 lg:pb-0 border-b-2 lg:border-b-0">
            <h3 className="text-lg font-semibold text-gray-700">THIS YEAR {"(2024)"}</h3>
            <div className="text-center items-center text-2xl text-secondary">
                <span>S$ {numeral(yearSum).format('0,0.00')}</span>
                {isValidPercentage(yearPercentage) && <span className={`flex flex-row justify-center items-center ml-4 text-sm ${yearPercentage < 0 ? "text-red-600" : "text-green-600"}`}>
                    {yearPercentage < 0 ? <FaArrowDown /> : <FaArrowUp />}{yearPercentage.toFixed(1)}% compared to {now.getFullYear() - 1}
                </span>}
            </div>
        </div>
        <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-700">PAST YEARS TOTAL {`(${earliestYear.getFullYear()}${latestYear ? ` - ${latestYear.getFullYear()}` : ""})`}</h3>
            <div className="text-center items-center text-2xl text-secondary">
                S$ {numeral(totalBeforeThisYear).format('0,0.00')}
            </div>
        </div>
    </div>
}

function calculatePercentage(donations: Contribution[], date: Date, days: number) {
    const sum = donations.filter(d => new Date(d.data.receive_date!) >= date).reduce((a, b) => a + b.data.total_amount!, 0);
    const newDate = new Date(date);
    newDate.setDate(date.getDate() - days);
    console.log(date, newDate);
    const secondSum = donations.filter(d => new Date(d.data.receive_date!) >= newDate && new Date(d.data.receive_date!) < date).reduce((a, b) => a + b.data.total_amount!, 0);
    return ((sum - secondSum) / secondSum) * 100;
}

function isValidPercentage(percentage: number) {
    return percentage != Infinity && percentage != 0 && !isNaN(percentage);
}