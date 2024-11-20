import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import "./main.css";

import Home3 from "./pages/Home";

import Profile from "./pages/Profile";
import Trainings from "./pages/Trainings";
import Training from "./pages/Training";
import Events from "./pages/Events";
import EventV3 from "./pages/v3/Event";
import Donations from "./pages/Donations";
import QRCheckIn from "./pages/QRCheckIn";
import { SubtypesProvider } from "./contexts/Subtypes";

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<SubtypesProvider>
			<HashRouter>
				<Routes>
					<Route index path="/" element={<Home3 />} />
					<Route path="/volunteer" element={<Home3 />} />
					<Route path="/volunteer/events" element={<Events />} />
					<Route path="/volunteer/events/:eventId/:roleId" element={<EventV3 />} />
					<Route path="/volunteer/trainings" element={<Trainings />} />
					<Route path="/volunteer/trainings/:id" element={<Training />} />

					<Route path="/donations" element={<Donations />} />

					<Route path="/profile" element={<Profile />} />
					<Route path="/events" element={<Events />} />
					<Route path="/events/:eventId/:roleId" element={<EventV3 />} />
					<Route path="/trainings" element={<Trainings />} />
					<Route path="/trainings/:id" element={<Training />} />
					<Route path="/donations" element={<Donations />} />
					<Route path="/checkin/:encryptedString" element={<QRCheckIn />} />
				</Routes>
			</HashRouter>
		</SubtypesProvider>
	</React.StrictMode>
)