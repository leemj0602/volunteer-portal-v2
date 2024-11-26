import { KeyboardEvent, useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import ServiceInfoPackManager, { ServiceInfoPack } from "../../utils/managers/ServiceInfoPackManager";
import Loading from "../components/Loading";
import { ServiceInfoPackCard } from "../components/Card/ServiceInfoPackCard";
import { useSearchParams } from "react-router-dom";

const limit = 9;

export default function ServiceInfoPacks() {
	const [initialised, setInitialised] = useState(false);
	const [serviceInfoPacks, setServiceInfoPacks] = useState<ServiceInfoPack[]>();
	const [search, setSearch] = useState("");
	const [searchQuery, setSearchQuery] = useState<string>();
	const [totalPages, setTotalPages] = useState(1);
	const [searchParams, setSearchParams] = useSearchParams();

	const onSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key == "Enter") {
			setSearchQuery(search.length ? search : undefined);
			setSearch("");
		}
	}

	const fetchSips = async () => {
		setSearch('');
		setServiceInfoPacks(undefined);

		const sips = await ServiceInfoPackManager.fetch({ limit });
		const total = (await ServiceInfoPackManager.fetch()).length;
		const pages = Math.ceil(total / limit);
		setTotalPages(pages);
		setServiceInfoPacks(sips);
		if (!initialised) setInitialised(true);
	}

	useEffect(() => {
		fetchSips();
	}, [searchQuery]);

	return <Wrapper>
		{!initialised ? <Loading className="h-screen items-center" /> : <div className="p-4 mb-12">
			<div className="w-full px-0 md:px-6 max-w-[1200px] mx-auto">
				{/* Filtering  */}
				<div className="mb-6">
					{/* Search bar */}
					<div className="relative flex items-center">
						<input type="text" placeholder="Search" className="py-2 px-4 pr-12 rounded-lg w-full outline-none" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={onSearchKeyDown} />
					</div>
				</div>
				{/* SIP cards */}
				{!serviceInfoPacks ? <Loading className="items-center h-full mt-20" /> : <div className="flex flex-col justify-between h-full">
					{/* Search query results */}
					{searchQuery && <h1 className="text-xl font-semibold text-gray-600">Results for: {searchQuery}</h1>}
					{/* No cards */}
					{!serviceInfoPacks.length && <p className="text-lg text-gray-500">Loo 	ks like there aren't any service info packs.</p>}
					{serviceInfoPacks.length && <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 mt-6">
						{serviceInfoPacks.map(sip => <ServiceInfoPackCard className="flex justify-center" sip={sip} />)}
					</div>}
					{/* Pagination */}
					{totalPages > 1 && <div className="mt-8 items-center justify-center text-center w-full">
						{Array.from({ length: totalPages }).map((_, n) => <button onClick={() => {
							searchParams.set("page", `${n + 1}`);
							setSearchParams(searchParams);
						}} className="px-3 py-1 rounded-md hover:bg-secondary hover:text-white mx-1 font-semibold text-gray-600">{n + 1}</button>)}
					</div>}
				</div>}
			</div>
		</div>}
	</Wrapper>
}