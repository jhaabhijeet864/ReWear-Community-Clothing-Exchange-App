# ♻️ Odoo Hackathon

---

## 🧩 Problem Statement

### 👑 ReWear – Community Clothing Exchange

ReWear is a web-based platform that enables users to exchange unused clothing through direct swaps or a point-based redemption system. The goal is to promote sustainable fashion and reduce textile waste by encouraging users to reuse wearable garments instead of discarding them.

---

## 👥 Team: Mech X4
- 🧑‍💻 **Abhijeet Jha** *(Team Lead)*
- 👩‍💻 **Siya Pankaj**

---

## 🌟 Project Overview

✨ **ReWear** is about giving your clothes a second life and making sustainable fashion fun, accessible, and rewarding! Swap, earn points, and join a community passionate about saving the planet—one outfit at a time.

### 🚀 Key Features
- 🔐 **User Authentication** (sign up / log in)
- 🏠 **Landing Page** with featured items
- 👤 **User Dashboard** (profile, points, items, swaps)
- 👗 **Item Listing and Detail Pages**
- ➕ **Add New Item** (with images, details, tags)
- 🔄 **Swap System** (direct or points-based)
- 🛡️ **Admin Panel** for moderation

---

## ⚡️ How to Run the Project

### 🎨 Frontend (Vanilla JavaScript)

The frontend is a static site (HTML/CSS/JS)—no build steps or npm needed!

**To run locally:**
1. Open `index.html` in your browser  
   **OR**
2. Use a static server like [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) or run:
   ```bash
   npx live-server --port=3000 --open=./index.html
   ```

---

### 🛠️ Backend (Node.js/Express/MongoDB)

Backend code is in the `backend/` directory: handles API for authentication, items, swaps, and admin features.

**To run the backend:**

1. Open a terminal and navigate to the backend:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy and edit env variables:
   ```bash
   cp env.example .env
   # Edit .env for your MongoDB URI & JWT secret
   ```
4. *(Optional)* Seed the database:
   ```bash
   npm run seed
   ```
5. Start the backend server:
   ```bash
   npm run dev
   # or for production
   npm start
   ```

🔗 The API will be available at: [http://localhost:5000/api](http://localhost:5000/api)

---

## 📁 Directory Structure

```
Odoo_Mech_X4/
│
├── backend/          # Node.js/Express backend API
│   ├── models/       # Mongoose models (User, Item, Swap)
│   ├── routes/       # Express route handlers
│   ├── middleware/   # Auth and validation middleware
│   ├── scripts/      # Utility scripts (e.g. seed.js)
│   ├── uploads/      # Uploaded images (local storage)
│   ├── .env.example  # Environment variable template
│   ├── package.json  # Backend dependencies and scripts
│   └── README.md     # Backend API documentation
│
├── js/               # Frontend JavaScript files
├── styles/           # Frontend CSS files
├── index.html        # Main frontend HTML file
├── package.json      # (Optional) Frontend npm scripts (if any)
├── README.md         # (This file) Project overview and setup
└── ...               # Other project files
```

---

## 📚 API Documentation

For detailed backend API docs, see:  
➡️ [backend/README.md](./backend/README.md)

---

## 🆘 Getting Help

- 🛠️ For backend/API issues: check the backend README or [open an issue](../../issues).
- 💻 For frontend/static site issues: check your browser console for errors or ask for help.

---

<div align="center">

✨👚👖♻️  
**Happy swapping and coding!**  
♻️👗🧥✨

</div>
