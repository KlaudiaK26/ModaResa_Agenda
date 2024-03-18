// Importing necessary modules and decorators from TypeORM
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
// Importing related entity classes
import { Vendor } from "./Vendor";
import { Buyer } from "./Buyer";

// Define Appointment entity
@Entity() // Decorator to mark Appointment class as an entity
export class Appointment {
  @PrimaryGeneratedColumn() // Decorator for auto-incrementing primary key column
  id: number; // Unique identifier for each appointment

  @Column() // Decorator to define a column in the database
  title: string; // Title of the appointment

  @Column()
  type: string; // Type of the appointment

  @Column({ nullable: true }) // Decorator to define a nullable column in the database
  location: string; // Location of the appointment (optional)

  @ManyToOne(() => Vendor) // Decorator defining many-to-one relationship with Vendor entity
  @JoinColumn() // Decorator to specify the column used for joining
  host: Vendor; // Vendor who hosts the appointment

  @ManyToOne(() => Buyer) // Decorator defining many-to-one relationship with Buyer entity
  @JoinColumn()
  client: Buyer; // Buyer who is the client for the appointment

  @Column()
  startTime: Date; // Start time of the appointment

  @Column()
  endTime: Date; // End time of the appointment
}
