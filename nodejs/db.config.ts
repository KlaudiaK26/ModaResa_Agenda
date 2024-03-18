// Importing necessary module for defining database connection options
import { ConnectionOptions } from "typeorm";

// Define database connection options
const config: ConnectionOptions = {
  type: "postgres", // Database type (e.g., postgres, mysql, sqlite, etc.)
  host: "localhost",
  port: 5432, // Port on which the database server is running
  username: "postgres", // Username for database authentication
  password: "Klaw2626@@", // Password for database authentication
  database: "agenda_db", // Name of the database to connect to
  entities: [__dirname + "/models/**/*.ts"], // Location of the entity classes (models) to be used in the application
  synchronize: true, // Automatically synchronize database schema with the entities. (Note: Set to false in production!)
  logging: false, // Enable or disable logging of SQL queries and events
  schema: "Data", // Optional: Database schema to be used
};

// Export the database connection configuration
export default config;
