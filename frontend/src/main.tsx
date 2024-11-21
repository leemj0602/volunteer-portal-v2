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
import Donations from "./pages/Donations";
import CheckIn from "./pages/Volunteer/CheckIn";
import { SubtypesProvider } from "./contexts/Subtypes";
import Caregiver from "./pages/Caregiver/Dashboard";
import CaregiverServiceInfoPacks from "./pages/Caregiver/ServiceInfoPacks";
import CaregiverRequests from "./pages/Caregiver/Requests";
import CaregiverTrainings from "./pages/Caregiver/Trainings";
import Patient from "./pages/Patient/Dashboard";
import PatientServiceInfoPacks from "./pages/Patient/ServiceInfoPacks";
import PatientRequests from "./pages/Patient/Requests";


ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<SubtypesProvider>
			<HashRouter>
				<Routes>
					<Route index path="/" element={<Home3 />} />
					<Route path="/volunteer" element={<Home3 />} />
					<Route path="/volunteer/events" element={<Events />} />
					<Route path="/volunteer/events/:eventId/:roleId" element={<Event />} />
					<Route path="/volunteer/trainings" element={<VolunteerTrainings />} />
					<Route path="/volunteer/trainings/:id" element={<VolunteerTrainingPage />} />

					<Route path="/donations" element={<Donations />} />

					<Route path="/profile" element={<Profile />} />
					<Route path="/checkin/:encrypted" element={<CheckIn />} />

					<Route path="/caregiver" element={<Caregiver />} />
					<Route path="/caregiver/service-info-packs" element={<CaregiverServiceInfoPacks />} />
					<Route path="/caregiver/requests" element={<CaregiverRequests />} />
					<Route path="/caregiver/trainings" element={<CaregiverTrainings />} />

					<Route path="/patient" element={<Patient />} />
					<Route path="/patient/service-info-packs" element={<PatientServiceInfoPacks />} />
					<Route path="/patient/requests" element={<PatientRequests />} />

				</Routes>
			</HashRouter>
		</SubtypesProvider>
	</React.StrictMode>
)