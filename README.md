# KT Phones — AI-Based Mobile Phone Recommendation Management Information System

## 📌 What Is This Project?

A **web application** that helps customers of KT Phones find the best mobile phone based on their preferences using an **AI-based recommendation engine** (rule-based scoring algorithm).

**Case Study:** KT Phones — a single mobile phone shop that uses this system to manage its phone catalog and help walk-in or online customers choose the right phone through AI-powered recommendations.

The system has three user roles, each with a distinct responsibility:

- **Customer** — browses the KT Phones catalog and gets AI-powered phone recommendations
- **Seller** — a KT Phones staff member responsible for managing the phone catalog (adding new arrivals, updating prices, marking stock status)
- **Admin** — the system administrator who monitors the whole system, manages user accounts, and generates management reports

> **Why a Seller role?** The Admin is an IT/system person — they should not be doing product data entry. The Seller is shop staff — they should not have access to system reports or user data. Separating these responsibilities is a core principle of good system design (separation of concerns).

---

## 👥 User Roles

| Role | Who They Are | What They Do | Dashboard |
|------|-------------|-------------|-----------|
| **Customer** | Walk-in or online KT Phones customer | Browse catalog, get AI recommendations | Public website |
| **Seller** | KT Phones shop staff | Add new phones, update prices, manage stock | `/seller` dashboard |
| **Admin** | KT Phones system administrator | Monitor system, manage users, generate reports | `/admin` dashboard |

### Key Role Rules:
- **Seller** is a KT Phones employee — not an external vendor. They manage the shop's phone catalog.
- **Sellers** can only edit or delete phones **they added** — preventing accidental changes to each other's entries
- **Admin** has full override — can edit or delete **any** phone in the system
- **Admin** account is created manually (via `seed.js`) — cannot be self-registered for security
- **Customers and Sellers** register from the Register page — Sellers select "Register As: Seller"

---

## 🧠 HOW IS THIS AI-BASED? (For Presentation / Defense)

This system uses **Rule-Based Artificial Intelligence** — a type of AI where the computer makes decisions using predefined rules, the same way a human phone expert would think.

### The AI Scoring Algorithm (Step by Step):

When a customer submits their preferences (budget, brand, usage, features), the system:

1. **Fetches all available phones** from MongoDB
2. **Scores each phone out of 100 points** across 4 criteria:

| Criteria | Max Points | How the AI Decides |
|----------|-----------|-------------------|
| **Budget Match** | 30 points | Within budget = 30pts. Slightly above = 10pts. Way above = 0pts |
| **Brand Match** | 20 points | "Any" brand selected = 20pts for all. Exact match = 20pts. No match = 0pts |
| **Usage Match** | 30 points | Each matching usage type (gaming, photography, etc.) = 10pts (max 30) |
| **Feature Match** | 20 points | Battery ≥4500mAh = 5pts, Storage ≥128GB = 5pts, Camera ≥48MP = 5pts, RAM ≥6GB = 5pts |

3. **Sorts all phones** by score (highest first)
4. **Returns the top 3 phones** with their match percentage
5. **Saves the recommendation** to the database for history and reporting

### Why This Is AI:
- It **mimics human expert decision-making** (like a knowledgeable phone salesperson)
- It **processes multiple criteria simultaneously** across all phones in the database
- It **scales automatically** — add more phones and the AI considers them immediately
- It is a **knowledge-based expert system** — one of the foundational types of AI

### Where Is the AI Code?
`controllers/recommendController.js` — look for the `calculateScore()` function.

---

## 💻 HOW TO INSTALL THIS PROJECT ON ANOTHER COMPUTER

### Prerequisites:
1. **Node.js** (version 14 or higher)
2. **MongoDB** Community Edition (running locally)
3. **A web browser** (Chrome, Firefox, Edge)

### Step-by-Step Installation:

#### Step 1: Install Node.js
1. Go to: https://nodejs.org/
2. Download the **LTS** version and run the installer
3. Verify: open Command Prompt and type `node --version`

#### Step 2: Install MongoDB
1. Go to: https://www.mongodb.com/try/download/community
2. Download and run the installer — choose **Complete** installation
3. ✅ Check **"Install MongoDB as a Service"**
4. Verify: open Command Prompt and type `mongod --version`

#### Step 3: Copy the Project Folder
Copy the entire `kt-phones` folder to the new computer (USB, Google Drive, etc.)

#### Step 4: Open Command Prompt in the Project Folder
1. Open the `kt-phones` folder in File Explorer
2. Click the address bar, type `cmd`, press Enter

#### Step 5: Install Project Dependencies
```
npm install
```

#### Step 6: Seed the Database
```
node seed.js
```
This creates the admin account and adds sample phones.

#### Step 7: Start the Server
```
node server.js
```
Expected output:
```
✅ Connected to MongoDB successfully
🚀 KT Phones server running at http://localhost:3000
```

#### Step 8: Open in Browser
```
http://localhost:3000
```

---

## 🔑 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@ktphones.com | KtPh0n3s@2024 |
| **Seller** (KT Phones staff) | seller@ktphones.com | KtSell3r@2024 |

Sellers and Customers can also register their own accounts from the **Register** page (`/register`).  
On the register form, select **"Register As"**: Customer or Seller (KT Phones Staff).

### Password Requirements:
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (`!@#$%^&*`)
- No 4+ repeated characters (e.g. `1111`, `aaaa`)
- No sequential characters (e.g. `1234`, `abcd`)

**Good password examples:** `MyPhone@2024` · `Kt$ecure7x` · `Sell3r#KT`

---

## 📁 Project Structure

```
kt-phones/
├── server.js                  → Main server — starts Express, connects MongoDB
├── package.json               → Project dependencies
├── .env                       → Environment variables (DB URI, session secret)
├── seed.js                    → Seeds database with sample phones + admin account
├── README.md                  → This file
├── diagrams.md                → System diagrams (Mermaid)
│
├── /middleware/
│   └── auth.js                → isAdmin, isSeller, isAdminOrSeller helpers
│
├── /models/
│   ├── Phone.js               → Phone schema (includes addedBy → seller reference)
│   ├── User.js                → User schema (roles: admin, seller, customer)
│   └── Recommendation.js      → AI recommendation history schema
│
├── /controllers/
│   ├── authController.js      → Register, login, logout, session, users
│   ├── phoneController.js     → CRUD + ownership check (sellers edit own phones)
│   └── recommendController.js → ⭐ AI scoring algorithm
│
├── /routes/
│   ├── auth.js                → /api/auth/*
│   ├── phones.js              → /api/phones/* (public read, seller/admin write)
│   ├── recommend.js           → /api/recommend
│   └── report.js              → /api/report/* (admin only — PDF generation)
│
├── /views/
│   ├── index.html             → Home page (phone listings)
│   ├── login.html             → Login page
│   ├── register.html          → Register page (Customer or Seller selection)
│   ├── recommend.html         → AI recommendation form
│   ├── results.html           → Top 3 recommendation results
│   ├── admin.html             → Admin dashboard (monitor system, all phones, reports)
│   ├── seller.html            → Seller dashboard (manage own listings)
│   └── forgot-password.html   → Password reset
│
└── /public/
    ├── /css/style.css         → All styling and colors
    ├── /js/main.js            → Frontend JavaScript (all pages)
    └── /images/               → Uploaded phone images
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **HTML / CSS / JavaScript** | Frontend — what users see and interact with |
| **Node.js** | Backend runtime — runs JavaScript on the server |
| **Express.js** | Web framework — handles routes and HTTP requests |
| **MongoDB** | NoSQL database — stores phones, users, recommendations |
| **Mongoose** | ODM — connects Node.js to MongoDB with schema validation |
| **bcryptjs** | Hashes passwords securely before storing |
| **express-session** | Keeps users logged in across requests |
| **multer** | Handles phone image uploads |
| **PDFKit** | Generates PDF reports server-side (admin only) |

---

## 🔐 Role-Based Access Control (RBAC)

All protected routes go through `middleware/auth.js`:

| Middleware | Allowed Roles | Used On |
|-----------|--------------|---------|
| `isAdmin` | admin only | Reports, all-user management |
| `isSeller` | seller only | — |
| `isAdminOrSeller` | admin or seller | Add phone, edit/delete phone |

Ownership check in `phoneController.js`:
- **Sellers** can only `PUT` or `DELETE` phones where `phone.addedBy === session.userId`
- **Admins** bypass ownership — can act on any phone

---

## 📋 Features Summary

### Customer:
- Register / Login / Reset Password
- Browse all phone listings with specs
- Submit AI recommendation preferences (budget, brand, usage, features)
- Receive top 3 matching phones with match percentage

### Seller:
- Register / Login (select "Seller" on register form)
- Add new phone listings with photo upload
- Edit or delete their own listings
- View stats: total listings, in stock, out of stock
- Seller Dashboard at `/seller`

### Admin:
- Admin Dashboard at `/admin`
- View all phones listed by all sellers — with "Listed By" column
- Edit or delete **any** phone (admin override)
- View all registered customers and sellers with role badges
- Monitor seller activity — listings count per seller
- View complete AI recommendation history
- Generate PDF reports: Full System Report, Phone Inventory, Recommendations
- Dashboard with live stats and brand / price charts
- Role responsibility overview table on dashboard

---

## 🎨 HOW TO CHANGE COLORS

The main color scheme is in `public/css/style.css`.

### Current Palette:
| Variable | Hex | Used For |
|---------|-----|---------|
| Primary Blue | `#1a237e` | Navbar, headings, sidebar, buttons |
| Accent Orange | `#ff6f00` | Highlights, prices, active states |
| Background | `#f5f5f5` | Page background |
| White | `#ffffff` | Cards |
| Text | `#333333` | Body text |

### How to Change:
1. Open `public/css/style.css` in any text editor
2. Use **Find and Replace** (Ctrl+H):
   - Replace `#1a237e` with your new primary color
   - Replace `#ff6f00` with your new accent color
3. Do the same inside `views/admin.html` and `views/seller.html` `<style>` sections

**Color tools:** https://colorhunt.co · https://coolors.co

---

## 🔧 Troubleshooting

| Problem | Fix |
|--------|-----|
| `MongoDB connection failed` | Open Windows Services, find "MongoDB", click Start |
| `Cannot find module` | Run `npm install` again |
| Photos not uploading | Check `public/images/` folder exists; must be logged in as seller or admin |
| Port 3000 already in use | Change `PORT=3000` to `PORT=4000` in `.env` |
| Forgot admin password | Run `node seed.js` again (resets database) |
| Registration button does nothing | Check password — no sequences like `1234` or `abcd` allowed |
| Seller can't edit a phone | Seller can only edit phones they personally added |

---

## 📄 License

Created for educational purposes — Mount Kenya University College Project.
