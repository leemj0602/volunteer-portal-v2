import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import "./main.css";

import Home3 from "./pages/Volunteer/Dashboard";

import Profile from "./pages/Profile";
import VolunteerTrainings from "./pages/Volunteer/Trainings";
import VolunteerTrainingPage from "./pages/Volunteer/Training";
import Events from "./pages/Volunteer/Events";
import Event from "./pages/Volunteer/Event";
import Donations from "./pages/Donations/Dashboard";
import CheckIn from "./pages/Volunteer/CheckIn";
import { SubtypesProvider } from "./contexts/Subtypes";
import Caregiver from "./pages/Caregiver/Dashboard";
import CaregiverRequest from "./pages/Caregiver/Request";
import CaregiverTrainings from "./pages/Caregiver/Trainings";
import Patient from "./pages/Patient/Dashboard";
import PatientRequest from "./pages/Patient/Request";
import DonorInfoPack from "./pages/Donations/DonorInfoPack";
import ServiceInfoPack from "./pages/ServiceInfoPack";
import VolunteerInfoPack from "./pages/Volunteer/VolunteerInfoPack";
import Jobs from "./pages/Volunteer/Jobs";
import Campaigns from "./pages/Donations/Campaigns";


ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<SubtypesProvider>
			<HashRouter>
				<Routes>
					<Route index path="/" element={<Home3 />} />
					<Route path="/volunteer" element={<Home3 />} />
					<Route path="/volunteer/events" element={<Events />} />
					<Route path="/volunteer/events/:eventId/:roleId" element={<Event />} />
					<Route path="/volunteer/jobs" element={<Jobs />} />
					<Route path="/volunteer/trainings" element={<VolunteerTrainings />} />
					<Route path="/volunteer/trainings/:id" element={<VolunteerTrainingPage />} />
					<Route path="/volunteer/volunteer-info-pack" element={<VolunteerInfoPack />} />

					<Route path="/donor" element={<Donations />} />
					<Route path="/donor/donor-info-pack" element={<DonorInfoPack />} />
					<Route path="/donor/campaigns" element={<Campaigns />} />

					<Route path="/profile" element={<Profile />} />
					<Route path="/checkin/:encrypted" element={<CheckIn />} />

					<Route path="/caregiver" element={<Caregiver />} />
					<Route path="/caregiver/request" element={<CaregiverRequest />} />
					<Route path="/caregiver/trainings" element={<CaregiverTrainings />} />
					<Route path="/caregiver/service-info-pack" element={<ServiceInfoPack />} />


					<Route path="/patient" element={<Patient />} />
					<Route path="/patient/request" element={<PatientRequest />} />
					<Route path="/patient/service-info-pack" element={<ServiceInfoPack />} />
				</Routes>
			</HashRouter>
		</SubtypesProvider>
	</React.StrictMode>
)