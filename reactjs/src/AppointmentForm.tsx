import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AppointmentForm.css"; // Importing CSS file for styling
import { useNavigate, Link } from "react-router-dom";

// Define props interface for AppointmentForm component
interface AppointmentFormProps {
  appointmentId?: number; // Optional for editing
  onSave: () => void; // Callback to refresh the list after saving
}

// Define interfaces for Buyer and Vendor objects
interface Buyer {
  id: number;
  name: string;
  companyName: string;
}

interface Vendor {
  id: number;
  name: string;
}

// Component for creating/editing appointments
const AppointmentForm: React.FC<AppointmentFormProps> = ({
  appointmentId,
  onSave,
}) => {
  // State hooks for managing form fields and messages
  const [title, setTitle] = useState("");
  const [type, setType] = useState("virtual");
  const [location, setLocation] = useState("");
  const [hostId, setHostId] = useState("");
  const [clientId, setClientId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [vendors, setVendors] = useState<Vendor[]>([]); // State for vendors list
  const [buyers, setBuyers] = useState<Buyer[]>([]); // State for buyers list
  const [successMessage, setSuccessMessage] = useState(""); // Success message
  const history = useNavigate(); // Hook for programmatic navigation

  // Fetch vendors and buyers data from the server
  useEffect(() => {
    axios
      .get("http://localhost:3030/vendors")
      .then((response) => setVendors(response.data));
    axios
      .get("http://localhost:3030/buyers")
      .then((response) => setBuyers(response.data));
  }, []);

  // Fetch appointment details if appointmentId prop is provided
  useEffect(() => {
    if (appointmentId) {
      axios
        .get(`http://localhost:3030/appointments/${appointmentId}`)
        .then((response) => {
          const { title, type, location, host, client, startTime, endTime } =
            response.data;
          // Set form fields with fetched appointment data
          setTitle(title);
          setType(type);
          setLocation(location);
          setHostId(String(host.id));
          setClientId(String(client.id));
          setStartTime(startTime);
          setEndTime(endTime);
        })
        .catch((error) => console.error("Failed to fetch appointment", error));
    }
  }, [appointmentId]);

  // Function to handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Prepare data object to be sent to the server
    const data = {
      title,
      type,
      location: type === "physical" ? location : null,
      hostId,
      clientId,
      startTime,
      endTime,
    };

    // Send a POST request to create a new appointment
    axios
      .post("http://localhost:3030/createAppointment", data)
      .then(() => {
        onSave(); // Trigger the onSave callback to refresh the appointments list
        setSuccessMessage("Successfully created!"); // Set success message

        // Clear form fields
        setTitle("");
        setType("virtual");
        setLocation("null");
        setHostId("");
        setClientId("");
        setStartTime("");
        setEndTime("");

        // Delay redirection after 2 seconds
        setTimeout(() => {
          history("/"); // Redirect to the main page
        }, 2000);
      })
      .catch((error) => {
        console.error("Failed to save appointment", error);
        setSuccessMessage("Error creating appointment"); // Set error message
      });
  };

  return (
    <div className="form">
      {/* Appointment form */}
      <form onSubmit={handleSubmit}>
        <div className="form-info">
          <label>Create Appointment</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            required
          />
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="virtual">Virtual</option>
            <option value="physical">Physical</option>
          </select>
          {/* Display location field only if appointment type is physical */}
          {type === "physical" && (
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              required
            />
          )}
          {/* Dropdown to select host */}
          <select
            value={hostId}
            onChange={(e) => setHostId(e.target.value)}
            required
          >
            <option value="">Select a host</option>
            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name}
              </option>
            ))}
          </select>
          {/* Dropdown to select client */}
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            required
          >
            <option value="">Select a client</option>
            {buyers.map((buyer) => (
              <option key={buyer.id} value={buyer.id}>
                {buyer.name}
              </option>
            ))}
          </select>
          {/* Input field for start time */}
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
          {/* Input field for end time */}
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>
        {/* Display success message */}
        {successMessage && <p className="success-message">{successMessage}</p>}
        {/* Cancel button */}
        {/* Submit button */}
        <button className="saveBtn" type="submit">
          Save Appointment
        </button>
        <Link to="/">
          <button className="backBtn" type="button">
            Cancel
          </button>
        </Link>
      </form>
    </div>
  );
};

export default AppointmentForm;
