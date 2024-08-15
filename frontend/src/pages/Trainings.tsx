import { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import { Training } from "../../utils/classes/Training";
import TrainingManager from "../../utils/managers/TrainingManager";
import Loading from "../components/Loading";
import TrainingCard from "../components/Card/TrainingCard";

export default function Trainings() {
    const [trainings, setTrainings] = useState<Training[]>();
    useEffect(() => {
        (async () => {
            const trainings = await TrainingManager.fetch();
            console.log(trainings);
            setTrainings(trainings as Training[]);
        })()
    }, []);

    return <Wrapper>
        {!trainings ? <Loading className="h-screen items-center" /> : <div className="p-4 mb-12">
            <div className="max-w-[1400px] px-0 md:px-6">
                <div className="mb-6">

                </div>
                {/* Training cards */}
                {!trainings ? <Loading className="items-center h-full mt-20" /> : <div className="flex flex-col justify-between h-full">
                    {!trainings.length && <p className="text-lg text-gray-500">Looks like there aren't any trainings</p>}
                    {trainings.length > 0 && <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 mt-6">
                        {trainings.map(training => <TrainingCard className="flex justify-center" training={training} />)}
                    </div>}
                </div>}
            </div>
        </div>}
    </Wrapper>
}