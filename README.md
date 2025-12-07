# Vehicle Rental API 🚗

**Live URL:** [https://vehicle-rental-system-azure.vercel.app/](https://vehicle-rental-system-azure.vercel.app/)

---

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Setup & Installation](#setup--installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [License](#license)

---

## Project Overview
Vehicle Rental API is a RESTful backend service that allows users to browse vehicles, create bookings, and manage vehicle availability. Admins have full control over bookings and vehicles, while customers can manage their own bookings. The system ensures secure access using JWT authentication and enforces business rules for booking management.

---

## Features
- User authentication & role-based authorization (Admin & Customer)
- Browse vehicles and view details
- Create, update, and retrieve bookings
- Role-based booking updates:
  - Customers can cancel their own bookings (before start date)
  - Admins can mark bookings as returned
- Vehicle availability is automatically updated based on booking status
- Data validation and error handling with standard API responses
- Prevent deletion of vehicles or users with active bookings

---

## Technology Stack
- **Backend:** Node.js, Express.js, TypeScript
- **Database:** PostgreSQL
- **Authentication:** JWT (JSON Web Tokens)
- **ORM/Query:** PostgreSQL `pool` with `pg`
- **Environment Management:** dotenv
- **Version Control:** Git & GitHub

---

## Setup & Installation

1. **Clone the repository**
```bash
git clone https://github.com/Niloy-Uthso/vehicle-rental-system.git
 
