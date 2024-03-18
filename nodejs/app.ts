// Import necessary modules
import "reflect-metadata"; // Importing reflect-metadata to enable decorators
import { createConnection, MoreThan, LessThan, Not } from "typeorm"; // Importing TypeORM functions for database connection and query
import express from "express"; // Importing Express.js for handling HTTP requests / for building RESTful APIs
import { Appointment } from "./models/Appointment"; // Importing Appointment model
import { Vendor } from "./models/Vendor"; // Importing Vendor model
import { Buyer } from "./models/Buyer"; // Importing Buyer model
import config from "./db.config"; // Importing database configuration
import cors from "cors"; // Importing CORS middleware for enabling cross-origin requests

// Create database connection using configuration from db.config
createConnection(config)
  .then((connection) => {
    const app = express(); // Creating an Express application
    const port = 3030; // Port to run the server

    app.use(cors()); // Enabling CORS middleware for cross-origin requests

    app.use(express.json()); // Middleware for parsing JSON request bodies

    // Route to fetch all appointments
    app.get("/appointments", async (req, res) => {
      const appointmentRepository = connection.getRepository(Appointment);
      try {
        const appointments = await appointmentRepository.find({
          relations: ["host", "client"], // Fetching related entities (host and client)
        });
        res.json(appointments); // Sending JSON response with appointments
      } catch (error) {
        res.status(500).json({ message: (error as any).message }); // Handling errors
      }
    });

    // Route to fetch all vendors
    app.get("/vendors", async (req, res) => {
      const vendorRepository = connection.getRepository(Vendor);
      try {
        const vendors = await vendorRepository.find(); // Fetching all vendors
        res.json(vendors); // Sending JSON response with vendors
      } catch (error) {
        res.status(500).json({ message: (error as any).message }); // Handling errors
      }
    });

    // Route to fetch all buyers
    app.get("/buyers", async (req, res) => {
      const buyerRepository = connection.getRepository(Buyer);
      try {
        const buyers = await buyerRepository.find(); // Fetching all buyers
        res.json(buyers); // Sending JSON response with buyers
      } catch (error) {
        res.status(500).json({ message: (error as any).message }); // Handling errors
      }
    });

    // Function to convert a date to a string in the local time zone
    const localDateString = (date: Date): string => {
      return date.toLocaleString(); // Using the browser's time zone settings
    };

    // Endpoint to get details of a specific appointment by ID
    app.get("/appointments/:id", async (req, res) => {
      const appointmentRepository = connection.getRepository(Appointment);

      try {
        const appointmentId = parseInt(req.params.id, 10); // Parsing appointment ID from request parameters

        // Fetching the appointment with the specified ID and selecting specific attributes
        const appointment = await appointmentRepository.findOne({
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
        } else {
          res.status(404).json({ error: "Appointment not found" }); // Handling case where appointment is not found
        }
      } catch (error) {
        console.error("Error fetching appointment:", error);
        res.status(500).json({ error: "Internal Server Error" }); // Handling errors
      }
    });

    // Endpoint to create a new appointment
    app.post("/createAppointment", async (req, res) => {
      const appointmentRepository = connection.getRepository(Appointment);
      const { title, type, location, hostId, clientId, startTime, endTime } =
        req.body;

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
          error:
            "Appointment endTime cannot be smaller than or equal to startTime",
        });
      }

      // Convert start and end times to Date objects
      const start = new Date(startTime);
      const end = new Date(endTime);

      // Check for conflicting appointments with the same host
      const hostConflicts = await appointmentRepository.findOne({
        where: {
          host: { id: hostId }, // Assuming hostId is the ID of the host
          startTime: LessThan(end),
          endTime: MoreThan(start),
        },
      });

      // Check for conflicting appointments with the same client
      const clientConflicts = await appointmentRepository.findOne({
        where: {
          client: { id: clientId }, // Assuming clientId is the ID of the client
          startTime: LessThan(end),
          endTime: MoreThan(start),
        },
      });

      if (hostConflicts || clientConflicts) {
        // Conflicts found, send a response indicating the conflict
        return res.status(409).json({
          message:
            "Conflicting appointments found with both the host and the client",
        });
      }

      const appointment = new Appointment();
      appointment.title = title;
      appointment.type = type;
      appointment.location = type === "physical" ? location : "";
      appointment.host = hostId;
      appointment.client = clientId;
      appointment.startTime = new Date(startTime);
      appointment.endTime = new Date(endTime);

      await appointmentRepository.save(appointment);
      res.send(appointment);
    });

    // Delete appointment route
    app.delete("/appointments/:id", async (req, res) => {
      try {
        const appointmentId = parseInt(req.params.id, 10);
        // We are using TypeORM, find the appointment by ID
        const appointmentRepository = connection.getRepository(Appointment);
        const appointment = await appointmentRepository.findOne({
          where: { id: appointmentId },
        });

        if (!appointment) {
          return res.status(404).json({ error: "Appointment not found" });
        }

        // Perform the deletion
        await appointmentRepository.remove(appointment);

        // Send a success response
        res.json({ message: "Appointment deleted successfully" });
      } catch (error) {
        console.error("Error deleting appointment:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    // Endpoint to update an existing appointment
    app.put("/appointments/:id", async (req, res) => {
      const appointmentRepository = connection.getRepository(Appointment);
      const appointmentId = parseInt(req.params.id, 10);

      try {
        const appointment = await appointmentRepository.findOne({
          where: { id: appointmentId },
          relations: ["host", "client"],
        });

        if (!appointment) {
          return res.status(404).send("Appointment not found");
        }

        const { title, type, location, hostId, clientId, startTime, endTime } =
          req.body;

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
            error:
              "Appointment endTime cannot be smaller than or equal to startTime",
          });
        }

        // Function to convert a date to a Date object in the local time zone
        const localDate = (date: Date): Date => {
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
        req.body.startTime = start;
        req.body.endTime = end;

        if (
          (appointment.title !== title ||
            appointment.type !== type ||
            appointment.location !== location) &&
          appointment.startTime.toISOString() ===
            req.body.startTime.toISOString() &&
          appointment.endTime.toISOString() ===
            req.body.endTime.toISOString() &&
          appointment.host.id === req.body.hostId &&
          appointment.client.id === req.body.clientId
        ) {
          // Update appointment data
          appointment.title = title;
          appointment.type = type;
          appointment.location = type === "physical" ? location : "";
          appointment.host = hostId;
          appointment.client = clientId;
          appointment.startTime = start;
          appointment.endTime = end;

          // Save the updated appointment
          await appointmentRepository.save(appointment);
          res.send(appointment);
          return;
        }

        // Check for conflicting appointments with the same host, excluding the current appointment
        const hostConflicts = await appointmentRepository.findOne({
          where: {
            host: { id: hostId }, // Assuming hostId is the ID of the host
            id: Not(appointmentId), // Exclude the current appointment
            startTime: LessThan(end),
            endTime: MoreThan(start),
          },
        });

        // Check for conflicting appointments with the same client, excluding the current appointment
        const clientConflicts = await appointmentRepository.findOne({
          where: {
            client: { id: clientId }, // Assuming clientId is the ID of the client
            id: Not(appointmentId), // Exclude the current appointment
            startTime: LessThan(end),
            endTime: MoreThan(start),
          },
        });

        if (hostConflicts && clientConflicts) {
          // Conflicts found with both the host and the client
          return res.status(409).json({
            message: `Conflicting appointments found with both the host and the client (Host ID: ${hostId}, Client ID: ${clientId})`,
          });
        } else if (hostConflicts) {
          // Conflicts found only with the host
          return res.status(409).json({
            message: `Conflicting appointments found with the host (Host ID: ${hostId})`,
          });
        } else if (clientConflicts) {
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
        await appointmentRepository.save(appointment);

        res.send(appointment);
      } catch (error) {
        console.error("Error updating appointment:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  })
  .catch((error) => console.log(error));
