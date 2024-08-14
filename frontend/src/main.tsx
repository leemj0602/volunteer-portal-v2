import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import "./main.css";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import EventsV1 from "./pages/v1/Events";
import EventV1 from "./pages/v1/Event";
import Trainings from "./pages/Trainings";
import Training from "./pages/Training";

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<HashRouter>
			<Routes>
				<Route index path="/" element={<Home />} />
				<Route path="/profile" element={<Profile />} />
				<Route path="/v1/events" element={<EventsV1 />} />
				<Route path="/v1/events/:id" element={<EventV1 />} />
				<Route path="/trainings" element={<Trainings />} />
				<Route path="/trainings/:id" element={<Training />} />
			</Routes>
		</HashRouter>
	</React.StrictMode>
)