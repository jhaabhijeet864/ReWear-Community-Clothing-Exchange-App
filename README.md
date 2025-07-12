# ReWear – Community Clothing Exchange

## Team: Mech X4
1. Abhijeet Jha (TL)
2. Siya Pankaj

## Project Overview
ReWear is a web-based platform that enables users to exchange unused clothing through direct swaps or a point-based redemption system. The goal is to promote sustainable fashion and reduce textile waste by encouraging users to reuse wearable garments instead of discarding them.

**Key Features:**
- User authentication (signup/login)
- Landing page with featured items
- User dashboard (profile, points, items, swaps)
- Item listing and detail pages
- Add new item (with images, details, tags)
- Swap system (direct or points-based)
- Admin panel for moderation

---

## How to Run the Project

### 1. **Frontend (Vanilla JavaScript)**
The frontend is a simple static site (HTML/CSS/JS) and does **not** require a build step or npm dependencies.

**To run locally:**
- Open `index.html` in your browser, or
- Use a simple static server (e.g. [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) VSCode extension, or `npx live-server`):
  ```bash
  npx live-server --port=3000 --open=./index.html
  ```

### 2. **Backend (Node.js/Express/MongoDB)**
The backend is located in the `backend/` directory and provides the API for authentication, item management, swaps, and admin features.

**To run the backend:**
1. Open a terminal and navigate to the `backend/` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment variables template and edit as needed:
   ```bash
   cp env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   ```
4. (Optional) Seed the database with sample data:
   ```bash
   npm run seed
   ```
5. Start the backend server:
   ```bash
   npm run dev
   # or for production
   npm start
   ```

The backend API will be available at `http://localhost:5000/api` by default.

---

## Directory Structure

```
Odoo_Mexh_X4/
│
├── backend/              # Node.js/Express backend API
│   ├── models/           # Mongoose models (User, Item, Swap)
│   ├── routes/           # Express route handlers
│   ├── middleware/       # Auth and validation middleware
│   ├── scripts/          # Utility scripts (e.g. seed.js)
│   ├── uploads/          # Uploaded images (local storage)
│   ├── .env.example      # Environment variable template
│   ├── package.json      # Backend dependencies and scripts
│   └── README.md         # Backend API documentation
│
├── js/                   # Frontend JavaScript files
├── styles/               # Frontend CSS files
├── index.html            # Main frontend HTML file
├── package.json          # (Optional) Frontend npm scripts (if any)
├── README.md             # (This file) Project overview and setup
└── ...                   # Other project files
```

---

## API Documentation

For detailed backend API documentation, see:
- [backend/README.md](./backend/README.md)

---

## Getting Help
- For backend/API issues, see the backend README or open an issue.
- For frontend/static site issues, check your browser console for errors or ask for help.

---

**Happy swapping and coding!** 
