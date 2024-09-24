import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import "./main.css";

import Home from "./pages/v1/Home";
import Home3 from "./pages/v3/Home";

import Profile from "./pages/Profile";
import Trainings from "./pages/Trainings";
import Training from "./pages/Training";
import Events from "./pages/Events";
import EventV3 from "./pages/v3/Event";

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<HashRouter>
			<Routes>
				<Route index path="/" element={<Home />} />
				<Route index path="/home" element={<Home3 /> } />
				<Route path="/profile" element={<Profile />} />
				<Route path="/events" element={<Events />} />
				<Route path="/events/:eventId/:roleId" element={<EventV3 />} />
				<Route path="/trainings" element={<Trainings />} />
				<Route path="/trainings/:id" element={<Training />} />
			</Routes>
		</HashRouter>
	</React.StrictMode>
)