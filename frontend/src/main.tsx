import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import "./main.css";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import EventsV1 from "./pages/Events";
import EventV1 from "./pages/Event";
import Checkout from "./pages/Checkout";

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<HashRouter>
			<Routes>
				<Route index path="/" element={<Home />} />
				<Route path="/profile" element={<Profile />} />
				<Route path="/events" element={<EventsV1 />} />
				<Route path="/events/:id" element={<EventV1 />} />
				<Route path="/checkout/:secret" element={<Checkout />} />
			</Routes>
		</HashRouter>
	</React.StrictMode>
)