# 🌯 The Union Shawarma — MERN Stack Website

A complete, production-ready MERN stack website for The Union Shawarma restaurant.

## 📁 Project Structure

```
union-shawarma/
├── backend/         ← Node.js + Express + MongoDB API
└── frontend/        ← React.js customer website + admin panel
```

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values (MongoDB URI, Cloudinary, JWT secret)
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Set REACT_APP_API_URL=http://localhost:5000/api
npm start
```

---

## ⚙️ Environment Variables

### Backend `.env`
| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Strong random secret for JWT |
| `JWT_EXPIRE` | Token expiry (e.g. `30d`) |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `FRONTEND_URL` | Deployed frontend URL(s) for CORS, comma-separated |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Optional — SMTP creds to email catering inquiries. If unset, requests are still saved to the DB and visible in Admin → Catering, just no email is sent. |
| `CATERING_NOTIFY_EMAIL` | Optional — inbox that receives catering inquiry emails (requires SMTP vars above) |

### Frontend `.env`
| Variable | Description |
|---|---|
| `REACT_APP_API_URL` | Backend API URL |

---

## 🔑 Creating Admin Account

After seeding or registering a user, update their role manually in MongoDB:

```javascript
// In MongoDB Compass or Atlas
db.users.updateOne(
  { email: "admin@theunionshawarma.ca" },
  { $set: { role: "admin" } }
)
```

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router 6, Framer Motion, React Hot Toast |
| Backend | Node.js, Express 4, Mongoose 7 |
| Database | MongoDB Atlas |
| Image Uploads | Cloudinary (via multer-storage-cloudinary) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Styling | Custom CSS with CSS Variables |

---

## 🌐 Pages

### Public
- `/` — Home (Hero, Popular Menu, Story, Delivery)
- `/menu` — Full menu with category filter + search
- `/about` — About page
- `/gallery` — Photo gallery with lightbox
- `/pricing` — Menu pricing grid
- `/contact` — Contact info + hours
- `/login` — Sign in
- `/register` — Create account
- `/cart` — Shopping cart
- `/checkout` — Place order

### Customer (Requires Login)
- `/profile` — Edit profile
- `/my-orders` — Order history
- `/favourites` — Saved favourites

### Admin Panel (Requires Admin Role)
- `/admin` — Dashboard (stats, recent orders, quick actions)
- `/admin/menu` — Menu item CRUD + Cloudinary image upload
- `/admin/categories` — Category management
- `/admin/orders` — Order management with status update
- `/admin/users` — Customer list + promo subscriber export
- `/admin/gallery` — Gallery management (Cloudinary upload)
- `/admin/settings` — Site settings (logo, hours, contact, offers)

---

## 🎨 Brand Colors

| Color | Hex |
|---|---|
| Primary Orange | `#F57C00` |
| Primary Red | `#D32F2F` |
| Dark | `#1A1A1A` |
| Cream | `#FFF8F0` |

---

## 📞 Client Information

- **Restaurant:** The Union Shawarma
- **Website:** www.theunionshawarma.ca
- **Email:** theunionshawarma@gmail.com
- **Social:** @Theunionshawarma
- **Delivery:** Uber Eats, DoorDash, Skip the Dishes

Built by **BizzOne Digital**
