E-TECH STORE - SYSTEM DOCUMENTATION & GUIDE

1. HOW TO RUN THE SYSTEM PREREQUISITES:

Node.js installed (v14 or higher)

MongoDB installed locally OR a MongoDB Atlas connection string

STEP A: BACKEND SETUP (Server)

Open your terminal/command prompt.

Navigate to the backend folder: cd src/backend

Install required packages: npm install

Create a ".env" file in "src/backend/" with the following content:
MONGO_URI=mongodb+srv:/00000000000000000000000000000000000000000000000000/Electronics?retryWrites=true&w=majority&appName=Cluster0
PORT=5000
JWT_SECRET=4d7f9b1dcb1a8e621f3f0ce9f95a8e4b7eac9021b5d9a9e9123f5f6b18d3c4f9

New terminal cd src/backend node seed.js (This creates the Admin account and initial products): node seed.js (Wait for the message: "Seeding completed successfully!")

Start the Server: npm run server (You should see: "Server running on port 5000" and "MongoDB connected")

STEP B: FRONTEND SETUP (Client)

Open a NEW terminal window (keep the backend running).

Navigate to the project root (where package.json for React is): cd C:\Kenshin (or just "cd .." if you are in src/backend)

Install React dependencies: npm install

Start the React Application: npm start

The browser should open automatically at http://localhost:3000.

2. LOGIN CREDENTIALS
Use these accounts created by the seed script:

ADMIN ACCOUNT (Full Access):

Email: admin@electromart.com

Password: Admin123!

USER ACCOUNTS (Customer Access):

Email: john@example.com

Password: User123!

3. SYSTEM ARCHITECTURE: HOW IT WORKS
A. THE SERVER (BACKEND - Node.js & Express) The server acts as the "Brain". It listens for requests from the frontend and talks to the database.

Reception (Server.js):

The entry point. It connects to MongoDB and sets up the "Routes" (like a receptionist directing calls).

Security (Middleware/auth.js):

Before a request reaches sensitive data (like "Manage Orders"), the middleware checks the "Authorization" header for a valid JWT Token.

If the token is missing or invalid, it blocks the request (401 Error).

Logic (Routes):

Located in "routes/". Example: When "GET /products" is called, the route asks the Product Model to find all items.

B. THE FRONTEND (CLIENT - React.js) The interface the user interacts with.

User Action:

User clicks "Login".

API Call (src/api.js):

Axios sends a POST request to "http://localhost:5000/auth/login".

Response Handling:

If successful, the server sends back a Token.

React saves this Token in "localStorage" (browser memory).

Data Fetching:

When loading the Shop, React uses "useEffect" to call "API.get('/products')".

The Token is automatically attached to this request to prove identity.

4. DATABASE OVERVIEW (MongoDB)
The database is a collection of JSON-like documents. Here is the structure:

USERS Collection

Stores: Username, Email, Password (Encrypted), Role (admin/user).

Objective: Authentication and permission management.

PRODUCTS Collection

Stores: Name, Description, Price, Stock, Image URL, Category ID.

Objective: Inventory management.

CATEGORIES Collection

Stores: Name (e.g., Laptops), Description.

Objective: organizing products for filtering.

ORDERS Collection

Stores: User ID, Items Array (Product ID + Qty), Total Price, Status.

Objective: Tracking sales and fulfillment.

Status Flow: Pending -> Paid -> Shipped -> Delivered.

CART Collection

Stores: User ID, Items.

Objective: Persistence. If a user logs in on another device, their cart items are pulled from here instead of the browser cache.

5. ROLES & OBJECTIVES
ADMIN ROLE:

Objective: Manage the business operations.

Capabilities:

Add/Edit/Delete Products and Categories.

View all Users.

Process Orders (Approve payments, Mark as Shipped).

USER (CUSTOMER) ROLE:

Objective: Browse and purchase items.

Capabilities:

Browse Shop and Filter by Category.

Manage Personal Cart.

Checkout (Create Order).

View Order History and Tracking Status.

Update Profile Profile.

