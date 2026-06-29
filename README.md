# ☀️ SolarVolt — Full-Stack Solar Selling Website

A complete solar panel selling website built with **Node.js + Express + MongoDB**.

---

## 📁 Project Structure

```
solarvolt/
├── .env                          ← Environment variables (edit this first!)
├── package.json
│
├── backend/
│   ├── server.js                 ← Express server entry point
│   ├── middleware/
│   │   └── auth.js               ← JWT authentication middleware
│   ├── models/
│   │   ├── User.js               ← User schema (admin + customers)
│   │   ├── Product.js            ← Solar product schema
│   │   └── Quote.js              ← Quote request schema
│   └── routes/
│       ├── auth.js               ← Register, Login, Profile APIs
│       ├── products.js           ← Product CRUD APIs
│       ├── quotes.js             ← Quote submission & management APIs
│       └── admin.js              ← Admin dashboard stats & user management
│
├── frontend/
│   ├── index.html                ← Single-page app (all pages in one file)
│   ├── css/
│   │   └── style.css             ← All styles
│   └── js/
│       └── app.js                ← All frontend logic (routing, API calls)
│
└── uploads/                      ← Product images stored here (auto-created)
```

---

## ⚙️ Prerequisites

Make sure you have these installed:

- [Node.js](https://nodejs.org/) v18 or above
- [MongoDB](https://www.mongodb.com/) — local install **or** free cloud via [MongoDB Atlas](https://www.mongodb.com/atlas)
- npm (comes with Node.js)

---

## 🚀 Setup & Run (Step by Step)

### Step 1 — Install dependencies

```bash
cd solarvolt
npm install
```

### Step 2 — Configure environment

Open `.env` and update these values:

```env
PORT=5000

# Local MongoDB:
MONGO_URI=mongodb://localhost:27017/solarvolt

# OR MongoDB Atlas (replace with your connection string):
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/solarvolt

# Change this to a long random string in production!
JWT_SECRET=solarvolt_super_secret_key_change_in_production

# Default admin login credentials (created automatically on first run)
ADMIN_EMAIL=admin@solarvolt.in
ADMIN_PASSWORD=Admin@1234
```

### Step 3 — Start the server

```bash
# Production start:
npm start

# Development (auto-restarts on file changes):
npm run dev
```

### Step 4 — Open the website

Visit: **http://localhost:5000**

The server will automatically:
- ✅ Connect to MongoDB
- ✅ Create the default Admin account
- ✅ Seed 3 sample solar products

---

## 🔑 Default Login Credentials

| Role  | Email                | Password    |
|-------|----------------------|-------------|
| Admin | admin@solarvolt.in   | Admin@1234  |

> ⚠️ **Change these in `.env` before deploying to production!**

---

## 🌐 Website Pages

| Page        | URL / Access             | Description                        |
|-------------|--------------------------|------------------------------------|
| Home        | `/`                      | Hero, Why Us, CTA                  |
| Products    | Click "Products" in nav  | Browse & filter solar products     |
| Contact     | Click "Get Free Quote"   | Submit quote request form          |
| Profile     | Login → My Profile       | View account & quote history       |
| Admin Panel | Login as admin           | Full management dashboard          |

---

## ⚡ API Endpoints

### Auth
| Method | Endpoint              | Access  | Description          |
|--------|-----------------------|---------|----------------------|
| POST   | `/api/auth/register`  | Public  | Create account       |
| POST   | `/api/auth/login`     | Public  | Login                |
| GET    | `/api/auth/profile`   | Private | Get my profile       |
| PUT    | `/api/auth/profile`   | Private | Update my profile    |

### Products
| Method | Endpoint              | Access  | Description          |
|--------|-----------------------|---------|----------------------|
| GET    | `/api/products`       | Public  | List all products    |
| GET    | `/api/products/:id`   | Public  | Single product       |
| POST   | `/api/products`       | Admin   | Create product       |
| PUT    | `/api/products/:id`   | Admin   | Update product       |
| DELETE | `/api/products/:id`   | Admin   | Delete product       |

### Quotes
| Method | Endpoint                    | Access  | Description          |
|--------|-----------------------------|---------|----------------------|
| POST   | `/api/quotes`               | Public  | Submit quote         |
| GET    | `/api/quotes`               | Admin   | List all quotes      |
| GET    | `/api/quotes/my`            | Private | My quotes            |
| PUT    | `/api/quotes/:id/status`    | Admin   | Update status        |
| DELETE | `/api/quotes/:id`           | Admin   | Delete quote         |

### Admin
| Method | Endpoint                    | Access | Description          |
|--------|-----------------------------|--------|----------------------|
| GET    | `/api/admin/stats`          | Admin  | Dashboard stats      |
| GET    | `/api/admin/users`          | Admin  | List all users       |
| DELETE | `/api/admin/users/:id`      | Admin  | Delete a user        |

---

## 🛠️ Admin Panel Features

Log in as admin at **http://localhost:5000** → you'll be taken straight to the admin panel.

- **Dashboard** — see total products, users, quotes, and new requests at a glance
- **Products** — add, edit, delete solar products; upload product images; mark as featured/out of stock
- **Quotes** — view all quote requests; update status (New → In Progress → Resolved); delete quotes
- **Users** — view registered users; delete accounts

---

## 🌍 Deploying to Production

### Option A — Railway / Render (recommended for beginners)
1. Push the project to GitHub
2. Connect repo to [Railway](https://railway.app) or [Render](https://render.com)
3. Add environment variables in the platform dashboard
4. Set start command: `npm start`

### Option B — VPS (DigitalOcean / AWS)
```bash
# Install PM2 for process management
npm install -g pm2
pm2 start backend/server.js --name solarvolt
pm2 save
pm2 startup
```

### Important before going live:
- [ ] Change `JWT_SECRET` to a long random string
- [ ] Change `ADMIN_PASSWORD` to something strong
- [ ] Use MongoDB Atlas instead of local MongoDB
- [ ] Set up HTTPS (SSL certificate)
- [ ] Configure a domain name

---

## 🧰 Tech Stack

| Layer     | Technology        |
|-----------|-------------------|
| Frontend  | Vanilla HTML/CSS/JS (SPA) |
| Backend   | Node.js + Express |
| Database  | MongoDB + Mongoose |
| Auth      | JWT + bcryptjs    |
| File Upload | Multer          |
| Fonts     | Google Fonts (Bebas Neue, Syne, DM Sans) |
