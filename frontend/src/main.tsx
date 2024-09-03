import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import "./main.css";
import Home from "./pages/Home";
import ProfileV1 from "./pages/v1/Profile";
import Trainings from "./pages/Trainings";
import Training from "./pages/Training";
import EventsV2 from "./pages/v2/Events";
import EventV3 from "./pages/v3/Event";
import ProfileV3 from "./pages/v3/Profile";

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<HashRouter>
			<Routes>
				<Route index path="/" element={<Home />} />
				{/* Todo: Try to complete ProfileV3 with the new framework */}
				<Route path="/profile" element={<ProfileV1 />} />
				<Route path="/events" element={<EventsV2 />} />
				<Route path="/events/:eventId/:roleId" element={<EventV3 />} />
				<Route path="/trainings" element={<Trainings />} />
				<Route path="/trainings/:id" element={<Training />} />
			</Routes>
		</HashRouter>
	</React.StrictMode>
)