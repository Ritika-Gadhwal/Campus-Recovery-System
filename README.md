# Campus Recovery: College Lost & Found Portal

Campus Recovery is a full-featured, production-ready MERN stack web application that allows college students to report lost belongings, list items they have found, search and filter the campus bulletins database, and claim recovered items via a security question verification system.

## Tech Stack

- **Frontend:** React.js (Vite) + Tailwind CSS + Context API + Axios + Socket.io-client
- **Backend:** Node.js + Express.js + Socket.io (WebSockets) + Mongoose
- **Database:** MongoDB with text indexes for rapid searching
- **Authentication:** JSON Web Tokens (JWT) + Bcrypt password hashing
- **Notifications:** Nodemailer (Transactional email notifications) + Socket.io (Real-time in-app alerts)

---

## Core Features

1. **User Authentication:** Student registration is restricted to authorized college email domains (e.g. `.edu` extensions).
2. **Interactive Bulletins Board:** Browse reported items with instant keyword search, and filters for category, type (lost/found), and status.
3. **Report Modules:** Forms to create lost or found posts with description, location, date, photos, and a custom security question (mandatory for found posts).
4. **AI-Based Item Matching:** Instantly computes similarity scores between lost and found reports in the database using text similarity algorithms to recommend potential matches.
5. **Secure Claim Verification:** Claimants must submit answers to the poster's security question. The founder reviews answers to approve or reject the claim.
6. **QR Code Generator:** Every post has a unique QR code pointing to the item detail page for easy mobile scanning and sharing.
7. **Real-time Alerting:** Immediate in-app notification popups using Socket.io for claim status updates (Approved/Rejected/Requested).
8. **Email Notifications:** Automatic Nodemailer alerts fired for incoming claims or approvals (falls back to console logging if credentials are not configured).
9. **Admin dashboard:** Admin portal to review system metrics, manage the user registry, and moderate posts.
10. **Light & Dark Themes:** Sleek theme toggle styling saved in local storage.

---

## Project Structure

```text
Minor_project/
├── backend/
│   ├── config/          # DB connection and Cloudinary integrations
│   ├── controllers/     # Controller handlers (Auth, Items, Claims, Admin, Notifications)
│   ├── middleware/      # Middlewares (Auth, Admin, Multer Uploads)
│   ├── models/          # Mongoose Schemas (User, Item, Claim, Notification)
│   ├── routes/          # REST Routes (Auth, Items, Claims, Admin, Notifications)
│   ├── scripts/         # DB Seeder & API Verification scripts
│   ├── utils/           # Helper scripts (Nodemailer, QR Code, AI Matcher)
│   ├── server.js        # Main Express and Socket.io server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable layout assets (Navbar, Sidebar, ItemCard, etc.)
│   │   ├── context/     # Context state providers (Auth, Theme, Socket)
│   │   ├── pages/       # Portal Views (Home, Dashboard, PostItem, Details, Claims, Admin)
│   │   ├── services/    # API Axios client
│   │   ├── App.jsx      # Router routing logic
│   │   ├── main.jsx
│   │   └── index.css    # Custom styles and glassmorphism definitions
│   ├── tailwind.config.js
│   └── package.json
└── README.md            # Setup guidelines
```

---

## Quick Start Guide

### Prerequisites
- Node.js (v16+)
- Local MongoDB running at `mongodb://127.0.0.1:27017`

### Step 1: Install Dependencies
Open a terminal in the root folder:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Configure Environment Variables
Inside the `backend/` directory, a `.env` file has been pre-configured with local defaults matching the `.env.example` file. 

You can add Cloudinary or SMTP settings to enable live image uploads and emails:
```ini
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/college-lost-found
JWT_SECRET=college_lost_found_secret_key_987654321
JWT_EXPIRE=30d

# (Optional) Cloudinary Config
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# (Optional) Nodemailer Config
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-user
SMTP_PASS=your-password
```

### Step 3: Seed the Database
Before running the server, seed MongoDB with mock items, claims, notifications, and student profiles:
```bash
cd backend
npm run seed
```

This registers the following users for logging in:
- **Admin User:** `admin@mycollege.edu` | Password: `password123`
- **Student A:** `john.doe@mycollege.edu` | Password: `password123`
- **Student B:** `jane.smith@mycollege.edu` | Password: `password123`

### Step 4: Run the Application

Start both the backend server and frontend development environments:

**Run Backend:**
```bash
cd backend
npm run dev
# or: npm start
```

**Run Frontend:**
```bash
cd frontend
npm run dev
```

The React frontend will start on `http://localhost:5173`. Open this URL in your web browser.

---

## Automated Verification Tests
You can run automated verification assertions on the API routes while the backend is running:
```bash
cd backend
node scripts/verify.js
```
This tests registration constraints, login routines, profile fetches, and suggestions matching logic.
