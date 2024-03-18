"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Import necessary modules
require("reflect-metadata"); // Importing reflect-metadata to enable decorators
const typeorm_1 = require("typeorm"); // Importing TypeORM functions for database connection and query
const express_1 = __importDefault(require("express")); // Importing Express.js for handling HTTP requests / for building RESTful APIs
const Appointment_1 = require("./models/Appointment"); // Importing Appointment model
const Vendor_1 = require("./models/Vendor"); // Importing Vendor model
const Buyer_1 = require("./models/Buyer"); // Importing Buyer model
const db_config_1 = __importDefault(require("./db.config")); // Importing database configuration
const cors_1 = __importDefault(require("cors")); // Importing CORS middleware for enabling cross-origin requests
// Create database connection using configuration from db.config
(0, typeorm_1.createConnection)(db_config_1.default)
    .then((connection) => {
    const app = (0, express_1.default)(); // Creating an Express application
    const port = 3030; // Port to run the server
    app.use((0, cors_1.default)()); // Enabling CORS middleware for cross-origin requests
    app.use(express_1.default.json()); // Middleware for parsing JSON request bodies
    // Route to fetch all appointments
    app.get("/appointments", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const appointmentRepository = connection.getRepository(Appointment_1.Appointment);
        try {
            const appointments = yield appointmentRepository.find({
                relations: ["host", "client"], // Fetching related entities (host and client)
            });
            res.json(appointments); // Sending JSON response with appointments
        }
        catch (error) {
            res.status(500).json({ message: error.message }); // Handling errors
        }
    }));
    // Route to fetch all vendors
    app.get("/vendors", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const vendorRepository = connection.getRepository(Vendor_1.Vendor);
        try {
            const vendors = yield vendorRepository.find(); // Fetching all vendors
            res.json(vendors); // Sending JSON response with vendors
        }
        catch (error) {
            res.status(500).json({ message: error.message }); // Handling errors
        }
    }));
    // Route to fetch all buyers
    app.get("/buyers", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const buyerRepository = connection.getRepository(Buyer_1.Buyer);
        try {
            const buyers = yield buyerRepository.find(); // Fetching all buyers
            res.json(buyers); // Sending JSON response with buyers
        }
        catch (error) {
            res.status(500).json({ message: error.message }); // Handling errors
        }
    }));
    // Function to convert a date to a string in the local time zone
    const localDateString = (date) => {
        return date.toLocaleString(); // Using the browser's time zone settings
    };
    // Endpoint to get details of a specific appointment by ID
    app.get("/appointments/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const appointmentRepository = connection.getRepository(Appointment_1.Appointment);
        try {
            const appointmentId = parseInt(req.params.id, 10); // Parsing appointment ID from request parameters
            // Fetching the appointment with the specified ID and selecting specific attributes
            const appointment = yield appointmentRepository.findOne({
                where: { id: appointmentId },
                relations: ["host", "client"], // Fetching related entities (host and client)
            });
            // If the appointment is found, send its details.
            if (appointment) {
                res.json({
                    id: appointment.id,
                    title: appointment.title,
                    type: appointment.type,
                    location: appointment.location,
                    startTime: localDateString(appointment.startTime),
                    endTime: localDateString(appointment.endTime),
                    host: appointment.host, // Extract only the id property for host
                    client: appointment.client, // Extract only the id property for client
                });
            }
            else {
                res.status(404).json({ error: "Appointment not found" }); // Handling case where appointment is not found
            }
        }
        catch (error) {
            console.error("Error fetching appointment:", error);
            res.status(500).json({ error: "Internal Server Error" }); // Handling errors
        }
    }));
    // Endpoint to create a new appointment
    app.post("/createAppointment", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const appointmentRepository = connection.getRepository(Appointment_1.Appointment);
        const { title, type, location, hostId, clientId, startTime, endTime } = req.body;
        const currentTime = Date.now(); // Get the current timestamp
        // Checking if the provided startTime is in the past
        if (new Date(startTime).getTime() <= currentTime) {
            return res
                .status(400)
                .json({ error: "Appointment startTime cannot be in the past" });
        }
        // Checking if the provided endTime is less than or equal to startTime
        if (new Date(endTime).getTime() <= new Date(startTime).getTime()) {
            return res.status(400).json({
                error: "Appointment endTime cannot be smaller than or equal to startTime",
            });
        }
        // Convert start and end times to Date objects
        const start = new Date(startTime);
        const end = new Date(endTime);
        // Check for conflicting appointments with the same host
        const hostConflicts = yield appointmentRepository.findOne({
            where: {
                host: { id: hostId }, // Assuming hostId is the ID of the host
                startTime: (0, typeorm_1.LessThan)(end),
                endTime: (0, typeorm_1.MoreThan)(start),
            },
        });
        // Check for conflicting appointments with the same client
        const clientConflicts = yield appointmentRepository.findOne({
            where: {
                client: { id: clientId }, // Assuming clientId is the ID of the client
                startTime: (0, typeorm_1.LessThan)(end),
                endTime: (0, typeorm_1.MoreThan)(start),
            },
        });
        if (hostConflicts || clientConflicts) {
            // Conflicts found, send a response indicating the conflict
            return res.status(409).json({
                message: "Conflicting appointments found with both the host and the client",
            });
        }
        const appointment = new Appointment_1.Appointment();
        appointment.title = title;
        appointment.type = type;
        appointment.location = type === "physical" ? location : "";
        appointment.host = hostId;
        appointment.client = clientId;
        appointment.startTime = new Date(startTime);
        appointment.endTime = new Date(endTime);
        yield appointmentRepository.save(appointment);
        res.send(appointment);
    }));
    // Delete appointment route
    app.delete("/appointments/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const appointmentId = parseInt(req.params.id, 10);
            // We are using TypeORM, find the appointment by ID
            const appointmentRepository = connection.getRepository(Appointment_1.Appointment);
            const appointment = yield appointmentRepository.findOne({
                where: { id: appointmentId },
            });
            if (!appointment) {
                return res.status(404).json({ error: "Appointment not found" });
            }
            // Perform the deletion
            yield appointmentRepository.remove(appointment);
            // Send a success response
            res.json({ message: "Appointment deleted successfully" });
        }
        catch (error) {
            console.error("Error deleting appointment:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }));
    // Endpoint to update an existing appointment
    app.put("/appointments/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const appointmentRepository = connection.getRepository(Appointment_1.Appointment);
        const appointmentId = parseInt(req.params.id, 10);
        try {
            const appointment = yield appointmentRepository.findOne({
                where: { id: appointmentId },
            });
            if (!appointment) {
                return res.status(404).send("Appointment not found");
            }
            console.log(req.body);
            const { title, type, location, hostId, clientId, startTime, endTime } = req.body;
            const currentTime = Date.now(); // Get the current timestamp
            // Check if the provided startTime is in the past
            if (new Date(startTime).getTime() <= currentTime) {
                return res
                    .status(400)
                    .json({ error: "Appointment startTime cannot be in the past" });
            }
            // Check if the provided endTime is less than or equal to startTime
            if (new Date(endTime).getTime() <= new Date(startTime).getTime()) {
                return res.status(400).json({
                    error: "Appointment endTime cannot be smaller than or equal to startTime",
                });
            }
            // Function to convert a date to a Date object in the local time zone
            const localDate = (date) => {
                const year = date.getFullYear();
                const month = date.getMonth();
                const day = date.getDate();
                const hours = date.getHours();
                const minutes = date.getMinutes();
                const seconds = date.getSeconds();
                return new Date(year, month, day, hours, minutes, seconds);
            };
            // Convert start and end times to Date objects in local time
            const start = localDate(new Date(startTime));
            const end = localDate(new Date(endTime));
            // Check for conflicting appointments with the same host
            const hostConflicts = yield appointmentRepository.findOne({
                where: {
                    host: { id: hostId }, // Assuming hostId is the ID of the host
                    startTime: (0, typeorm_1.LessThan)(end),
                    endTime: (0, typeorm_1.MoreThan)(start),
                },
            });
            // Check for conflicting appointments with the same client
            const clientConflicts = yield appointmentRepository.findOne({
                where: {
                    client: { id: clientId }, // Assuming clientId is the ID of the client
                    startTime: (0, typeorm_1.LessThan)(end),
                    endTime: (0, typeorm_1.MoreThan)(start),
                },
            });
            if (hostConflicts && clientConflicts) {
                // Conflicts found with both the host and the client
                return res.status(409).json({
                    message: `Conflicting appointments found with both the host and the client (Host ID: ${hostId}, Client ID: ${clientId})`,
                });
            }
            else if (hostConflicts) {
                // Conflicts found only with the host
                return res.status(409).json({
                    message: `Conflicting appointments found with the host (Host ID: ${hostId})`,
                });
            }
            else if (clientConflicts) {
                // Conflicts found only with the client
                return res.status(409).json({
                    message: `Conflicting appointments found with the client (Client ID: ${clientId})`,
                });
            }
            // Update appointment data
            appointment.title = title;
            appointment.type = type;
            appointment.location = type === "physical" ? location : "";
            appointment.host = hostId;
            appointment.client = clientId;
            appointment.startTime = start;
            appointment.endTime = end;
            // Save the updated appointment
            yield appointmentRepository.save(appointment);
            res.send(appointment);
        }
        catch (error) {
            console.error("Error updating appointment:", error);
            res.status(500).send("Internal Server Error");
        }
    }));
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
})
    .catch((error) => console.log(error));
