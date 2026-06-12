# KT Phones - System Diagrams

## AI-Based Mobile Phone Recommendation Management Information System

---

## 1. Context Diagram (Level 0 DFD)

Shows the system as a single process and its interaction with external entities.

```mermaid
graph TD
    Customer([👤 Customer/Retail User])
    Admin([🔒 Administrator])
    System[🤖 KT Phones AI Recommendation System]
    DB[(MongoDB Database)]

    Customer -->|Register/Login| System
    Customer -->|Submit Preferences| System
    System -->|Top 3 Phone Recommendations| Customer
    System -->|Browse Phones| Customer

    Admin -->|Login| System
    Admin -->|Manage Phones CRUD| System
    Admin -->|Generate Reports| System
    System -->|PDF Reports| Admin
    System -->|Users & Recommendations Data| Admin

    System <-->|Store/Retrieve Data| DB
```

---

## 2. Data Flow Diagram (DFD Level 1)

Shows the main processes within the system and how data flows between them.

```mermaid
graph TD
    %% External Entities
    Customer([👤 Customer])
    Admin([🔒 Admin])

    %% Processes
    P1[1.0 User Authentication<br/>Register/Login/Logout]
    P2[2.0 AI Recommendation Engine<br/>Score & Rank Phones]
    P3[3.0 Phone Management<br/>Add/Edit/Delete Phones]
    P4[4.0 Report Generation<br/>Generate PDF Reports]
    P5[5.0 Browse Phones<br/>View Phone Catalog]

    %% Data Stores
    D1[(D1: Users)]
    D2[(D2: Phones)]
    D3[(D3: Recommendations)]

    %% Customer flows
    Customer -->|Registration Data| P1
    Customer -->|Login Credentials| P1
    Customer -->|Preferences: Budget, Brand, Usage, Features| P2
    P2 -->|Top 3 Recommended Phones + Match %| Customer
    P5 -->|Phone List with Specs| Customer

    %% Admin flows
    Admin -->|Login Credentials| P1
    Admin -->|Phone Data + Photo| P3
    Admin -->|Report Request| P4
    P4 -->|PDF Report File| Admin
    P3 -->|CRUD Confirmation| Admin

    %% Data Store flows
    P1 <-->|Read/Write User Data| D1
    P2 -->|Read In-Stock Phones| D2
    P2 -->|Save Recommendation History| D3
    P3 <-->|Read/Write Phone Data| D2
    P4 -->|Read All Data| D1
    P4 -->|Read All Data| D2
    P4 -->|Read All Data| D3
    P5 -->|Read Phones| D2
```

---

## 3. Use Case Diagram

Shows what each actor (Customer and Admin) can do in the system.

```mermaid
graph LR
    %% Actors
    Customer([👤 Customer/Retail User])
    Admin([🔒 Administrator])

    %% System boundary
    subgraph KT Phones System
        UC1[Register Account]
        UC2[Login]
        UC3[Logout]
        UC4[Forgot Password]
        UC5[Browse All Phones]
        UC6[View Featured Phones]
        UC7[Fill AI Recommendation Form]
        UC8[View Top 3 Recommendations]
        UC9[View Recommendation History]

        UC10[Manage Phones - Add]
        UC11[Manage Phones - Edit]
        UC12[Manage Phones - Delete]
        UC13[Upload Phone Photo]
        UC14[View All Users]
        UC15[View All Recommendations]
        UC16[View Dashboard Statistics]
        UC17[Generate PDF Report - Full]
        UC18[Generate PDF Report - Phones]
        UC19[Generate PDF Report - Recommendations]
    end

    %% Customer relationships
    Customer --- UC1
    Customer --- UC2
    Customer --- UC3
    Customer --- UC4
    Customer --- UC5
    Customer --- UC6
    Customer --- UC7
    Customer --- UC8
    Customer --- UC9

    %% Admin relationships
    Admin --- UC2
    Admin --- UC3
    Admin --- UC10
    Admin --- UC11
    Admin --- UC12
    Admin --- UC13
    Admin --- UC14
    Admin --- UC15
    Admin --- UC16
    Admin --- UC17
    Admin --- UC18
    Admin --- UC19
```

---

## 4. Activity Diagram - Customer Getting AI Recommendation

Shows the step-by-step flow when a customer uses the AI recommendation feature.

```mermaid
flowchart TD
    Start([Start]) --> A[Customer visits KT Phones website]
    A --> B{Already registered?}
    B -->|No| C[Register new account]
    C --> D[Fill: Name, Email, Password]
    D --> E{Valid input?}
    E -->|No| D
    E -->|Yes| F[Account created]
    F --> G[Login]
    B -->|Yes| G
    G --> H[Enter email and password]
    H --> I{Credentials correct?}
    I -->|No| J{Forgot password?}
    J -->|Yes| K[Reset password via email]
    K --> H
    J -->|No| H
    I -->|Yes| L[Redirected to Home Page]
    L --> M[Click 'Get AI Recommendation']
    M --> N[Fill Recommendation Form]
    N --> N1[Select Budget Range]
    N1 --> N2[Select Preferred Brand]
    N2 --> N3[Check Usage Types]
    N3 --> N4[Check Important Features]
    N4 --> O[Click 'Find My Phone']
    O --> P[AI Scoring Algorithm Runs]
    P --> P1[Score each phone out of 100]
    P1 --> P2[Budget Match: 30 points]
    P2 --> P3[Brand Match: 20 points]
    P3 --> P4[Usage Match: 30 points]
    P4 --> P5[Feature Match: 20 points]
    P5 --> Q[Sort phones by score descending]
    Q --> R[Select Top 3 phones]
    R --> S[Save recommendation to database]
    S --> T[Display Results Page]
    T --> U[Show Top 3 phones with match %]
    U --> V{Satisfied?}
    V -->|No| M
    V -->|Yes| End([End])
```

---

## 5. Activity Diagram - Admin Managing System

Shows the admin workflow for managing the system.

```mermaid
flowchart TD
    Start([Start]) --> A[Admin visits /admin]
    A --> B{Logged in as Admin?}
    B -->|No| C[Redirect to Login page]
    C --> D[Enter admin credentials]
    D --> E{Valid admin?}
    E -->|No| C
    E -->|Yes| F[Admin Dashboard Loaded]
    B -->|Yes| F
    F --> G{Select Action}

    G -->|Manage Phones| H[View Phone Table]
    H --> H1{Action?}
    H1 -->|Add| I[Fill Add Phone Form]
    I --> I1[Enter name, brand, price, specs]
    I1 --> I2[Upload phone photo]
    I2 --> I3[Select usage types]
    I3 --> I4[Click Add Phone]
    I4 --> I5{Valid data?}
    I5 -->|No| I
    I5 -->|Yes| I6[Phone saved to database]
    I6 --> H

    H1 -->|Edit| J[Click Edit on phone]
    J --> J1[Modify phone details]
    J1 --> J2[Save changes]
    J2 --> H

    H1 -->|Delete| K[Click Delete on phone]
    K --> K1{Confirm delete?}
    K1 -->|No| H
    K1 -->|Yes| K2[Phone removed from database]
    K2 --> H

    G -->|View Users| L[Display all registered users]
    G -->|View Recommendations| M[Display AI recommendation history]
    G -->|Generate Reports| N{Report Type?}
    N -->|Full Report| O[Generate Full System PDF]
    N -->|Phone Report| P[Generate Phone Inventory PDF]
    N -->|Recommendations Report| Q[Generate Recommendations PDF]
    O --> R[PDF downloaded via PDFKit]
    P --> R
    Q --> R

    G -->|Logout| S[Session destroyed]
    S --> End([End])
```

---

## 6. Entity Relationship Diagram (ERD)

Shows the database structure and relationships between collections.

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        String fullName
        String email UK
        String password
        String role
        Date createdAt
    }

    PHONE {
        ObjectId _id PK
        String name
        String brand
        Number price
        Number ram
        Number storage
        Number battery
        Number camera
        Array usageType
        Boolean inStock
        Boolean featured
        String image
        String description
    }

    RECOMMENDATION {
        ObjectId _id PK
        ObjectId userId FK
        Object preferences
        Array recommendedPhones
        Date createdAt
    }

    USER ||--o{ RECOMMENDATION : "makes"
    PHONE ||--o{ RECOMMENDATION : "recommended in"
```

---

## 7. System Architecture Diagram

Shows the technical layers of the application.

```mermaid
graph TB
    subgraph Client Layer - Browser
        HTML[HTML Pages<br/>index, login, register,<br/>recommend, results, admin]
        CSS[CSS Stylesheet<br/>style.css]
        JS[JavaScript<br/>main.js + admin inline]
    end

    subgraph Server Layer - Node.js + Express
        Routes[Routes Layer<br/>auth.js, phones.js,<br/>recommend.js, report.js]
        Controllers[Controllers Layer<br/>authController.js<br/>phoneController.js<br/>recommendController.js]
        AI[AI Engine<br/>calculateScore function<br/>Rule-based scoring algorithm]
        PDF[PDF Generator<br/>PDFKit library]
        Auth[Authentication<br/>bcrypt + express-session]
        Upload[File Upload<br/>Multer middleware]
    end

    subgraph Database Layer - MongoDB
        UsersCol[(Users Collection)]
        PhonesCol[(Phones Collection)]
        RecsCol[(Recommendations Collection)]
    end

    HTML --> Routes
    CSS --> HTML
    JS --> Routes
    Routes --> Controllers
    Controllers --> AI
    Controllers --> PDF
    Controllers --> Auth
    Controllers --> Upload
    Controllers --> UsersCol
    Controllers --> PhonesCol
    Controllers --> RecsCol
```

---

## How to View These Diagrams

1. **GitHub** — Push this file to GitHub, it renders Mermaid diagrams automatically
2. **VS Code** — Install the "Markdown Preview Mermaid Support" extension
3. **Online** — Paste the mermaid code at https://mermaid.live/
4. **PDF Export** — Use a Markdown-to-PDF tool that supports Mermaid

---

*KT Phones © 2024 - AI-Based Mobile Phone Recommendation Management Information System*
