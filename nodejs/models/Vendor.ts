// Importing necessary modules and decorators from TypeORM
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

// Define Vendor entity
@Entity() // Decorator to mark Vendor class as an entity
export class Vendor {
  @PrimaryGeneratedColumn() // Decorator for auto-incrementing primary key column
  id: number; // Unique identifier for each vendor

  @Column() // Decorator to define a column in the database
  name: string; // Name of the vendor
}
