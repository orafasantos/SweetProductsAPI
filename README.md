# Sweets Management API

## 📖 About the Project

This is a RESTful API designed for managing a candy store. The application allows for product registration, order management, and user control with different access levels, built with a modern and high-performance tech stack.

## ✨ Features

  - **User Authentication:** Secure login system with robust validation.
  - **Product Management:**
      - Add new sweets to the menu.
      - Update information on existing products.
      - Remove products from the menu.
      - List all available products.
  - **Order Control:**
      - Customers can create new orders.
      - Administrators can view and manage orders.
      - Update order status (e.g., `Pending`, `Processing`, `Shipped`, `Delivered`).
  - **Access Levels:**
      - **Admin:** Full access to all features.
      - **Customer:** Can view products and place orders.

## 🚀 Tech Stack

This project was built using the following technologies:

  - **Framework:** [Fastify](https://www.google.com/search?q=https.://www.fastify.io/) - A web framework focused on performance and low overhead.
  - **ORM:** [Prisma](https://www.prisma.io/) - Next-generation ORM for Node.js and TypeScript.
  - **Data Validation:** [Zod](https://zod.dev/) - A TypeScript-first schema declaration and validation library.
  - **Database:** [PostgreSQL](https://www.postgresql.org/) - A powerful, open-source object-relational database system.
  - **Development Environment:** [Docker](https://www.docker.com/) - To create a consistent, containerized database environment.
  - **Language:** [TypeScript](https://www.typescriptlang.org/)


### ⚙️ Getting Started

Follow these steps to set up and run the project locally.

#### **1. Initial Setup (Run these commands only once)**

This will clone the project, install all dependencies, and prepare the database.

```bash
# Clone the project and enter the directory
git clone https://github.com/orafasantos/SweetProductsAPI.git
cd SweetProductsAPI

# Create the .env file for the database connection
# (On Windows, use 'copy' instead of 'cp')
cp .env.example .env

# Install dependencies for both the API (root) and the frontend
npm install
npm install --prefix frontend

# Start the PostgreSQL database container
docker-compose up -d

# Create the database tables with Prisma Migrate
npx prisma migrate dev
```

#### **2. Running the Application (Fast setup)**

You will need **two separate terminals** running at the same time.

**➡️ Terminal 1: Start the Back-End API**

In the project's root directory, run:

```bash
npm run dev
```

*Your API will be running at `http://localhost:3333`.*

**➡️ Terminal 2: Start the Front-End**

Navigate to the front-end's source folder and start the live server:

```bash
cd frontend/src
npx live-server
```

*This will automatically open your browser with the front-end application.*

And that's it\! Your full application is now up and running.



  
## 📝 API Endpoints

Below are some examples of the main available endpoints.

#### Authentication

  - `POST /sessions` - Authenticates a user.
  - `POST /users` - Registers a new user.

#### Products (Admin Routes)

  - `POST /products` - Creates a new product.
  - `PUT /products/:id` - Updates a product.
  - `DELETE /products/:id` - Deletes a product.

#### Orders

  - `POST /orders` - Creates a new order (customer route).
  - `GET /orders/me` - Lists the logged-in user's orders (customer route).
  - `GET /orders` - Lists all orders (admin route).
  - `PATCH /orders/:id` - Updates an order's status (admin route).


## 📜 License

This project is under the MIT license. See the [LICENSE](https://www.google.com/search?q=LICENSE) file for more details.

-----

Made with ❤️ by [Rafael Santos](https://www.google.com/search?q=https://github.com/orafasantos)
