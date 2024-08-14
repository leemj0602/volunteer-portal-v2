import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import "./main.css";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Events from "./pages/v1/Events";
import Event from "./pages/v1/Event";

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<HashRouter>
			<Routes>
				<Route index path="/" element={<Home />} />
				<Route path="/profile" element={<Profile />} />
				<Route path="/v1/events" element={<Events />} />
				<Route path="/v1/events/:id" element={<Event />} />
			</Routes>
		</HashRouter>
	</React.StrictMode>
)