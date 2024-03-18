// Importing necessary modules and decorators from TypeORM
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

// Define Buyer entity
@Entity() // Decorator to mark Buyer class as an entity
export class Buyer {
  @PrimaryGeneratedColumn() // Decorator for auto-incrementing primary key column
  id: number; // Unique identifier for each buyer

  @Column() // Decorator to define a column in the database
  name: string; // Name of the buyer

  @Column()
  companyName: string; // Company name of the buyer
}
