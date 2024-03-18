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
exports.Vendor = void 0;
// Importing necessary modules and decorators from TypeORM
const typeorm_1 = require("typeorm");
// Define Vendor entity
let Vendor = class Vendor {
};
exports.Vendor = Vendor;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)() // Decorator for auto-incrementing primary key column
    ,
    __metadata("design:type", Number)
], Vendor.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)() // Decorator to define a column in the database
    ,
    __metadata("design:type", String)
], Vendor.prototype, "name", void 0);
exports.Vendor = Vendor = __decorate([
    (0, typeorm_1.Entity)() // Decorator to mark Vendor class as an entity
], Vendor);
