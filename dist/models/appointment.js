"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Appointment = void 0;
// Importing necessary modules and decorators from TypeORM
const typeorm_1 = require("typeorm");
// Importing related entity classes
const Vendor_1 = require("./Vendor");
const Buyer_1 = require("./Buyer");
// Define Appointment entity
let Appointment = class Appointment {
};
exports.Appointment = Appointment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)() // Decorator for auto-incrementing primary key column
    ,
    __metadata("design:type", Number)
], Appointment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)() // Decorator to define a column in the database
    ,
    __metadata("design:type", String)
], Appointment.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Appointment.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }) // Decorator to define a nullable column in the database
    ,
    __metadata("design:type", String)
], Appointment.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Vendor_1.Vendor) // Decorator defining many-to-one relationship with Vendor entity
    ,
    (0, typeorm_1.JoinColumn)() // Decorator to specify the column used for joining
    ,
    __metadata("design:type", Vendor_1.Vendor)
], Appointment.prototype, "host", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Buyer_1.Buyer) // Decorator defining many-to-one relationship with Buyer entity
    ,
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", Buyer_1.Buyer)
], Appointment.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], Appointment.prototype, "startTime", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], Appointment.prototype, "endTime", void 0);
exports.Appointment = Appointment = __decorate([
    (0, typeorm_1.Entity)() // Decorator to mark Appointment class as an entity
], Appointment);
