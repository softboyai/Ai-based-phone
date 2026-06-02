# KT Phones - AI-Based Mobile Phone Recommendation Management Information System

## 📌 What Is This Project?

This is a **web application** that helps customers find the best mobile phone based on their preferences. It uses an **AI-based recommendation engine** (rule-based scoring algorithm) to analyze what the customer wants and suggest the top 3 matching phones from the database.

**Case Study:** KT Phones — a mobile phone shop that wants to help customers choose phones using technology instead of guessing.

---

## 🧠 HOW IS THIS AI-BASED? (Explanation for Presentation/Defense)

This system uses **Rule-Based Artificial Intelligence** — a type of AI where the computer makes decisions using a set of predefined rules, similar to how a human expert would think.

### The AI Scoring Algorithm (How It Works Step by Step):

When a customer fills in their preferences (budget, brand, usage, features), the system:

1. **Fetches all available phones** from the MongoDB database
2. **Scores each phone out of 100 points** using 4 criteria:

| Criteria | Max Points | How the AI Decides |
|----------|-----------|-------------------|
| **Budget Match** | 30 points | If phone price is within customer's budget = 30pts. Slightly above = 10pts. Way above = 0pts |
| **Brand Match** | 20 points | If customer chose "Any" = 20pts for all. If brand matches = 20pts. No match = 0pts |
| **Usage Match** | 30 points | For each usage type (gaming, photography, etc.) that matches the phone's capabilities = 10pts (max 30) |
| **Feature Match** | 20 points | Battery ≥4500mAh = 5pts, Storage ≥128GB = 5pts, Camera ≥48MP = 5pts, RAM ≥6GB = 5pts |

3. **Sorts all phones** by score from highest to lowest
4. **Returns the top 3 phones** with their match percentage
5. **Saves the recommendation** to the database for history/reporting

### Why This Is AI:

- It **mimics human expert decision-making** (like a phone shop salesperson who knows all phones)
- It **processes multiple criteria simultaneously** (a human would struggle to compare 10+ phones across 4 criteria)
- It **learns from data** — as you add more phones to the database, the AI automatically considers them
- It uses a **knowledge-based expert system** approach — one of the foundational types of AI

### Where Is the AI Code?

The AI logic is in: `controllers/recommendController.js` — look for the `calculateScore()` function.

---

## 💻 HOW TO INSTALL THIS PROJECT ON ANOTHER COMPUTER

### Prerequisites (What You Need First):

1. **Node.js** (version 14 or higher)
2. **MongoDB** (Community Edition, running locally)
3. **A web browser** (Chrome, Firefox, Edge)

### Step-by-Step Installation:

#### Step 1: Install Node.js

1. Go to: https://nodejs.org/
2. Download the **LTS** version (the big green button)
3. Run the installer → click Next → Next → Install
4. To verify, open **Command Prompt** (search "cmd" in Windows) and type:
   ```
   node --version
   ```
   You should see something like `v18.17.0`

#### Step 2: Install MongoDB

1. Go to: https://www.mongodb.com/try/download/community
2. Select your operating system (Windows)
3. Download and run the installer
4. Choose **"Complete"** installation
5. ✅ Check "Install MongoDB as a Service" (this makes it run automatically)
6. Click Install
7. To verify, open Command Prompt and type:
   ```
   mongod --version
   ```

#### Step 3: Copy the Project Folder

Copy the entire `kt-phones` folder to the new computer (USB, email, Google Drive, etc.)

#### Step 4: Open Command Prompt in the Project Folder

1. Open the `kt-phones` folder in File Explorer
2. Click on the address bar at the top
3. Type `cmd` and press Enter
4. A black Command Prompt window will open in that folder

#### Step 5: Install Project Dependencies

In the Command Prompt, type:
```
npm install
```
Wait for it to finish (it downloads all required libraries).

#### Step 6: Seed the Database (Add Sample Data)

Type:
```
node seed.js
```
This adds 10 sample phones and creates the admin account.

#### Step 7: Start the Server

Type:
```
node server.js
```
You should see:
```
✅ Connected to MongoDB successfully
🚀 KT Phones server running at http://localhost:3000
```

#### Step 8: Open in Browser

The browser should open automatically. If not, open your browser and go to:
```
http://localhost:3000
```

---

## 🔑 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ktphones.com | KtPh0n3s@2024 |

Customers can register their own accounts from the Register page.

### Password Requirements:
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*)
- No repeated characters (like 1111 or aaaa)
- No sequential characters (like 1234 or abcd)

**Example of a good password:** `MyPhone@2024` or `Kt$ecure7x`

---

## 🎨 HOW TO CHANGE COLORS

The colors are defined in one file: `public/css/style.css`

### Current Color Scheme:
- **Primary (Deep Blue):** `#1a237e` — used for navbar, headings, buttons
- **Accent (Orange):** `#ff6f00` — used for highlights, prices, KT branding
- **Background:** `#f5f5f5` — light gray page background
- **White:** `#ffffff` — card backgrounds
- **Text:** `#333333` — body text color

### How to Change:

1. Open `public/css/style.css` in any text editor (Notepad, VS Code)
2. Use **Find and Replace** (Ctrl+H):
   - To change the blue: Replace `#1a237e` with your new color
   - To change the orange: Replace `#ff6f00` with your new color
3. Save the file and refresh the browser

### For the Admin Panel:

The admin colors are inside `views/admin.html` in the `<style>` section at the top:
- Sidebar background: Look for `background:linear-gradient(180deg,#1a237e` — change `#1a237e`
- Accent orange: Search for `#ff6f00` and replace

### Color Examples:
- Mount Kenya University Green: `#006633`
- Red: `#c62828`
- Purple: `#6a1b9a`
- Teal: `#00695c`

**Tip:** Use https://colorhunt.co/ to find nice color combinations.

---

## ✏️ HOW TO CHANGE WORDS/TEXT

### Change the Company Name:

The name "KT Phones" appears in these files:
- `views/index.html` — home page
- `views/login.html` — login page
- `views/register.html` — register page
- `views/recommend.html` — recommendation page
- `views/results.html` — results page
- `views/admin.html` — admin panel

Use **Find and Replace** in your text editor:
- Find: `KT Phones`
- Replace with: `Your Company Name`

### Change the Welcome Message:

Open `views/index.html` and look for:
```html
<h2>🤖 AI-Powered Phone Recommendations</h2>
```
Change the text between `<h2>` and `</h2>`.

### Change Button Text:

Search for `btn` classes in the HTML files. The text between the `<a>` or `<button>` tags is what shows on the button.

### Change the Footer:

In every HTML file, look for:
```html
<footer class="footer">
```
Change the text inside the `<p>` tag.

---

## 📁 Project Structure (What Each File Does)

```
kt-phones/
├── server.js              → Main file that starts everything
├── package.json           → Lists all libraries used
├── .env                   → Database connection settings
├── seed.js                → Adds sample phones + admin account
├── README.md              → This file (instructions)
│
├── /models/               → Database structure definitions
│   ├── Phone.js           → What data a phone has (name, price, etc.)
│   ├── User.js            → What data a user has (email, password, etc.)
│   └── Recommendation.js  → Stores AI recommendation history
│
├── /controllers/          → The brain/logic of the system
│   ├── authController.js  → Login/register logic
│   ├── phoneController.js → Add/edit/delete phones logic
│   └── recommendController.js → ⭐ THE AI ALGORITHM IS HERE
│
├── /routes/               → URL paths (connects URLs to controllers)
│   ├── auth.js            → /api/auth/login, /api/auth/register
│   ├── phones.js          → /api/phones (CRUD)
│   ├── recommend.js       → /api/recommend (AI endpoint)
│   └── report.js          → /api/report (PDF generation)
│
├── /views/                → HTML pages (what users see)
│   ├── index.html         → Home page
│   ├── login.html         → Login page
│   ├── register.html      → Register page
│   ├── recommend.html     → AI recommendation form
│   ├── results.html       → Shows top 3 recommended phones
│   └── admin.html         → Admin dashboard (separate layout)
│
└── /public/               → Static files
    ├── /css/style.css     → All styling/colors
    ├── /js/main.js        → Frontend JavaScript logic
    └── /images/           → Phone images (uploaded here)
```

---

## 🛠️ Tech Stack (What Technologies Are Used)

| Technology | Purpose |
|-----------|---------|
| **HTML/CSS/JavaScript** | Frontend (what users see and interact with) |
| **Node.js** | Backend runtime (runs JavaScript on the server) |
| **Express.js** | Web framework (handles URLs and requests) |
| **MongoDB** | Database (stores phones, users, recommendations) |
| **Mongoose** | Connects Node.js to MongoDB easily |
| **bcryptjs** | Hashes passwords for security |
| **express-session** | Keeps users logged in |
| **multer** | Handles photo uploads |
| **PDFKit** | Generates PDF reports server-side |

---

## 🔧 Troubleshooting

### "MongoDB connection failed"
- Make sure MongoDB is running. On Windows: open Services (search "services" in Start menu), find "MongoDB", make sure it says "Running"

### "Cannot find module" error
- Run `npm install` again in the project folder

### Photos not uploading
- Make sure the `public/images` folder exists
- Make sure you're logged in as admin
- Only JPEG, PNG, GIF, WebP images are accepted

### Port 3000 already in use
- Open `.env` file and change `PORT=3000` to `PORT=4000`
- Then access: `http://localhost:4000`

### Forgot admin password
- Run `node seed.js` again (this resets the database with fresh data)

---

## 📋 Features Summary

### For Customers:
- Register and login
- Fill in preferences (budget, brand, usage, features)
- Get AI-powered top 3 phone recommendations with match %
- Browse all available phones

### For Admin:
- Separate admin dashboard with sidebar navigation
- Add/Edit/Delete phones with photo upload
- View all users
- View all AI recommendation history
- Generate PDF reports (Full Report, Phone Report, Recommendations Report)
- Dashboard with statistics and charts

---

## 📄 License

This project was created for educational purposes — Mount Kenya University College Project.
