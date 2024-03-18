import React, { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import {
  Link,
  useNavigate,
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import AppointmentForm from "./AppointmentForm"; // Importing AppointmentForm component
import AppointmentDetail from "./AppointmentDetail"; // Importing AppointmentDetail component
import "./AppointmentList.css"; // Importing CSS file for styling

// Define AppointmentList component
const AppointmentList = () => {
  const navigate = useNavigate(); // Hook for programmatic navigation

  // Define interface for Appointment object
  interface Appointment {
    id: number;
    title: string;
    type: string;
    location: string;
    host: {
      name: string;
    };
    client: {
      name: string;
      companyName: string;
    };
    startTime: Date;
    endTime: Date;
  }

  // State hook for managing appointments list
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Fetch appointments data from the server on component mount
  useEffect(() => {
    axios
      .get("http://localhost:3030/appointments")
      .then((response) => setAppointments(response.data))
      .catch((error) => console.error("There was an error!", error));
  }, []);

  // Function to format date and time
  const formatDateTime = (dateTime: Date) => {
    return dateTime.toString().slice(0, -8).replace("T", " h");
  };

  // Function to handle view appointment details
  const handleView = (id: number) => {
    navigate(`/appointments/${id}`);
  };

  // Function to handle view appointment details
  const handleEdit = (id: number, isEditable: boolean) => {
    setTimeout(() => {
      navigate(`/appointments/${id}`, { state: { isEditable } });
    }, 0);
  };

  // Function to handle delete appointment
  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      axios
        .delete(`http://localhost:3030/appointments/${id}`)
        .then(() => {
          // If the deletion is successful, update the list of appointments
          setAppointments((prevAppointments) =>
            prevAppointments.filter((appointment) => appointment.id !== id)
          );
          console.log(`Appointment with id ${id} deleted successfully`);
        })
        .catch((error) => {
          console.error(`Error deleting appointment with id ${id}:`, error);
        });
    }
  };

  // Render appointments list
  return (
    <div className="container">
      <div className="header">
        <Link to="/createAppointment">
          <button className="create">Create Appointment</button>
        </Link>
      </div>
      <div className="list-form">
        {appointments.map((appointment) => (
          <div key={appointment.id} className="list">
            <div className="list-header">
              <h2 className="list-title">{appointment.title}</h2>
              <p className="list-details">Host: {appointment.host.name}</p>
              <p className="list-details">Client: {appointment.client.name}</p>
              <p className="list-details">
                Client Company: {appointment.client.companyName}
              </p>
              <p className="list-details">Type: {appointment.type}</p>
              {appointment.type === "physical" && (
                <p className="list-details">Location: {appointment.location}</p>
              )}
              <p className="list-dates">
                {formatDateTime(appointment.startTime)} -{" "}
                {formatDateTime(appointment.endTime)}
              </p>
            </div>
            {/* ... other details ... */}
            <div className="buttons">
              <button
                className="button detail"
                onClick={() => handleView(appointment.id)}
              >
                View Details
              </button>
              <button
                className="button edit"
                onClick={() => handleEdit(appointment.id, true)}
              >
                Edit
              </button>
              <button
                className="button delete"
                onClick={() => handleDelete(appointment.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppointmentList;
