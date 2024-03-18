import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import "./AppointmentDetail.css";

// Interfaces defining the structure of appointment, buyer, and vendor objects
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

interface Buyer {
  id: number;
  name: string;
  companyName: string;
}

interface Vendor {
  id: number;
  name: string;
}

// Props interface for AppointmentDetail component
interface AppointmentDetailProps {
  id: number;
  isEditable: boolean;
}

// AppointmentDetail component
const AppointmentDetail: React.FC<AppointmentDetailProps> = ({
  id,
  isEditable,
}) => {
  const navigate = useNavigate(); // Hook for navigation
  const [successMessage, setSuccessMessage] = useState(""); // State for success message
  const [appointment, setAppointment] = useState({
    // State for appointment details
    title: "",
    type: "",
    location: "",
    hostId: "",
    clientId: "",
    startTime: "",
    endTime: "",
  });

  const [vendors, setVendors] = useState<Vendor[]>([]); // State for vendors
  const [buyers, setBuyers] = useState<Buyer[]>([]); // State for buyers
  const [conflictMessage, setConflictMessage] = useState(""); // State for conflict message

  // Fetch vendors and buyers data from server when component mounts
  useEffect(() => {
    axios
      .get("http://localhost:3030/vendors")
      .then((response) => setVendors(response.data));
    axios
      .get("http://localhost:3030/buyers")
      .then((response) => setBuyers(response.data));
  }, []);

  // Fetch appointment details when 'id' changes
  useEffect(() => {
    axios
      .get(`http://localhost:3030/appointments/${id}`)
      .then((response) => {
        const responseData = response.data;

        // Convert date strings to Date objects
        const startTime = new Date(responseData.startTime).toISOString();
        const endTime = new Date(responseData.endTime).toISOString();

        // Update state with appointment details
        setAppointment({
          ...appointment,
          title: responseData.title,
          type: responseData.type,
          location: responseData.location,
          hostId: responseData.host.id,
          clientId: responseData.client.id,
          startTime: startTime,
          endTime: endTime,
        });
      })
      .catch((error) =>
        console.error("Error fetching appointment details:", error)
      );
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    handleSaveClick(); // Call your save function
  };

  // Function to handle click event of saving appointment
  const handleSaveClick = () => {
    // Options for formatting the date with the desired time zone
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Europe/Berlin", // Adjust the time zone as needed
    };

    // Format the start and end time with the specified options
    const startTime = new Date(appointment.startTime).toLocaleString(
      "en-US",
      options
    );
    const endTime = new Date(appointment.endTime).toLocaleString(
      "en-US",
      options
    );

    // Construct the data object with formatted start and end time
    const data = {
      title: appointment.title,
      type: appointment.type,
      location: appointment.location,
      hostId: appointment.hostId,
      clientId: appointment.clientId,
      startTime: startTime,
      endTime: endTime,
    };

    // Send the updated appointment data to the server
    axios
      .put(`http://localhost:3030/appointments/${id}`, data)
      .then((response) => {
        // If the update is successful update the appointment state with the new data
        setAppointment(response.data);
        setSuccessMessage("Successfully updated!");
        // Delay redirection after 2 seconds
        setTimeout(() => {
          navigate("/"); // Redirect to the main page
        }, 5000);
      })
      .catch((error) => {
        // If there is an error updating, set the error message
        setConflictMessage(
          error.response?.data?.message ||
            "Failed to update. Please try again later."
        );
      });
  };

  // Function to handle click event of saving appointment
  if (!appointment) {
    return <div>Loading...</div>;
  }

  // Function to format date and time for display
  const formatDateTimeView = (dateTime: Date | string) => {
    const formattedDateTime = new Date(dateTime).toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });

    return formattedDateTime;
  };

  // Function to format date and time for input fields
  const formatDateTimeForInput = (dateTimeString: string) => {
    const dateTime = new Date(dateTimeString);
    const year = dateTime.getFullYear();
    const month = (dateTime.getMonth() + 1).toString().padStart(2, "0");
    const day = dateTime.getDate().toString().padStart(2, "0");
    const hours = dateTime.getHours().toString().padStart(2, "0");
    const minutes = dateTime.getMinutes().toString().padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Render component based on whether it's editable or not
  return (
    <div>
      {/* Render editable form if 'isEditable' is true */}
      {/* // Render for Edit */}
      {isEditable ? (
        <div className="update">
          <label>Edit Appointment</label>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={appointment.title}
              onChange={(e) =>
                setAppointment({ ...appointment, title: e.target.value })
              }
              placeholder="Title"
              required
            />
            <select
              value={appointment.type}
              onChange={(e) =>
                setAppointment({ ...appointment, type: e.target.value })
              }
            >
              <option value="virtual">Virtual</option>
              <option value="physical">Physical</option>
            </select>
            {appointment.type === "physical" && (
              <input
                type="text"
                value={appointment.location}
                onChange={(e) =>
                  setAppointment({ ...appointment, location: e.target.value })
                }
                placeholder="Location"
                required
              />
            )}
            <select
              value={appointment.hostId}
              onChange={(e) =>
                setAppointment({ ...appointment, hostId: e.target.value })
              }
              required
            >
              <option value="">Select a host</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </option>
              ))}
            </select>
            <select
              value={appointment.clientId}
              onChange={(e) =>
                setAppointment({ ...appointment, clientId: e.target.value })
              }
              required
            >
              <option value="">Select a client</option>
              {buyers.map((buyer) => (
                <option key={buyer.id} value={buyer.id}>
                  {buyer.name}
                </option>
              ))}
            </select>
            <input
              type="datetime-local"
              value={formatDateTimeForInput(appointment.startTime)}
              onChange={(e) =>
                setAppointment({
                  ...appointment,
                  startTime: e.target.value,
                })
              }
              required
            />
            <input
              type="datetime-local"
              value={formatDateTimeForInput(appointment.endTime)}
              onChange={(e) =>
                setAppointment({
                  ...appointment,
                  endTime: e.target.value,
                })
              }
              required
            />
            {conflictMessage && (
              <div className="conflict-message">
                <p>{conflictMessage}</p>
              </div>
            )}
            {successMessage && (
              <p className="success-messageDetail">{successMessage}</p>
            )}
            <div className="button-container">
              <button className="saveBtn" type="submit">
                Update Appointment
              </button>
              <Link to="/">
                <button className="backBtn" type="button">
                  Back
                </button>
              </Link>
            </div>
          </form>
        </div>
      ) : (
        // Render appointment details if 'isEditable' is false
        // Render for View
        <div className="list-formDetail">
          <div className="list-detail">
            <div className="list-headerDetail">
              <h2>Title: {appointment.title}</h2>
              <p>Type: {appointment.type}</p>
              {appointment.type === "physical" && (
                <p>Location: {appointment.location}</p>
              )}
              <p>
                Host:{" "}
                {
                  vendors.find(
                    (vendor) => vendor.id === Number(appointment.hostId)
                  )?.name
                }
              </p>
              <p>
                Client:{" "}
                {
                  buyers.find(
                    (buyer) => buyer.id === Number(appointment.clientId)
                  )?.name
                }
              </p>
              <p>
                Client Company:{" "}
                {
                  buyers.find(
                    (buyer) => buyer.id === Number(appointment.clientId)
                  )?.companyName
                }
              </p>
              <p>Start Time: {formatDateTimeView(appointment.startTime)}</p>
              <p>End Time: {formatDateTimeView(appointment.endTime)}</p>
              <Link to="/">
                <button className="backBtn" type="button">
                  Back
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentDetail;
