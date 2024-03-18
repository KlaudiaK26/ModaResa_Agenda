// Import necessary modules from React and React Router
import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AppointmentList from "./AppointmentList"; // Importing AppointmentList from external file
import AppointmentForm from "./AppointmentForm";
import AppointmentDetail from "./AppointmentDetail";
import { useParams, useLocation } from "react-router-dom";

// Wrapper component for AppointmentDetail to handle location state
const AppointmentDetailWrapper: React.FC = () => {
  const location = useLocation();
  // Extract 'isEditable' from location state or set it to false if not provided
  const isEditable = location.state?.isEditable || false;

  // Extract 'id' parameter from URL using useParams hook
  const { id } = useParams();
  if (!id) {
    return <div>Error: Appointment ID not found</div>; // Display error if ID is not found
  }
  const parsedId = parseInt(id, 10);

  // Render AppointmentDetail component with parsed 'id' and 'isEditable' prop
  return <AppointmentDetail id={parsedId} isEditable={isEditable} />;
};

// Render the application
ReactDOM.render(
  <Router>
    <Routes>
      {/* '/': Renders the AppointmentList component */}
      <Route path="/" element={<AppointmentList />} />
      {/* It extracts the appointment ID from the URL and renders the detail for that appointment */}
      <Route path="/appointments/:id" element={<AppointmentDetailWrapper />} />
      {/* Renders the AppointmentForm component for creating a new appointment, with a callback function onSave to handle saving the appointment */}
      <Route
        path="/createAppointment"
        element={
          <AppointmentForm
            onSave={() => {
              console.log("Saved appointment");
            }}
          />
        }
      />
    </Routes>
  </Router>,
  document.getElementById("root") // Render content inside the root element in HTML
);
