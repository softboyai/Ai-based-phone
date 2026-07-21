# KT Phones - System Diagrams

---

## 1. Context Diagram

```mermaid
graph LR
    Customer([Customer])
    Seller([KT Phones Staff - Seller])
    Admin([System Administrator])
    KTPhones[KT Phones AI Recommendation System]
    MongoDB[(MongoDB Database)]

    Customer -->|Submit Preferences| KTPhones
    KTPhones -->|Phone Recommendations| Customer

    Seller -->|Add / Update / Remove Phone Listings| KTPhones

    Admin -->|Monitor System, Manage All Phones & Users| KTPhones
    KTPhones -->|PDF Reports & System Stats| Admin

    KTPhones <-->|Store and Retrieve Data| MongoDB
```

---

## 2. Data Flow Diagram (Level 1)

```mermaid
graph TD
    Customer([Customer])
    Seller([Seller])
    Admin([Administrator])

    Authentication[Authentication Process]
    AIRecommendation[AI Recommendation Engine]
    PhoneManagement[Phone Management]
    ReportGeneration[Report Generation]

    UsersStore[(Users Store)]
    PhonesStore[(Phones Store)]
    RecommendationsStore[(Recommendations Store)]

    Customer -->|Login / Register as Customer| Authentication
    Seller -->|Login / Register as Seller| Authentication
    Admin -->|Login| Authentication

    Customer -->|Budget, Brand, Usage, Features| AIRecommendation
    AIRecommendation -->|Top 3 Phones with Match Percentage| Customer

    Seller -->|Phone Details and Photo| PhoneManagement
    Admin -->|Oversight: Edit / Delete Any Phone| PhoneManagement
    Admin -->|Report Request| ReportGeneration
    ReportGeneration -->|PDF Report| Admin

    Authentication <-->|Read and Write| UsersStore
    AIRecommendation -->|Read Available Phones| PhonesStore
    AIRecommendation -->|Save History| RecommendationsStore
    PhoneManagement <-->|Add Edit Delete| PhonesStore
    PhoneManagement -->|Track addedBy Seller| UsersStore
    ReportGeneration -->|Read| UsersStore
    ReportGeneration -->|Read| PhonesStore
    ReportGeneration -->|Read| RecommendationsStore
```

---

## 3. Use Case Diagram

```mermaid
graph LR
    Customer([Customer])
    Seller([Seller])
    Admin([Administrator])

    subgraph KT Phones System
        Register[Register Account]
        Login[Login]
        ResetPassword[Reset Password]
        BrowsePhones[Browse Phones]
        GetRecommendation[Get AI Recommendation]
        ViewResults[View Recommendation Results]

        AddPhone[Add Phone Listing]
        EditOwnPhone[Edit Own Listing]
        DeleteOwnPhone[Delete Own Listing]
        ViewOwnListings[View My Listings]

        ManageAllPhones[Override Edit / Delete Any Phone]
        ViewAllUsers[View All Users and Sellers]
        ViewSellers[Monitor Seller Activity]
        ViewRecommendations[View Recommendation History]
        GenerateReport[Generate PDF Report]
    end

    Customer --- Register
    Customer --- Login
    Customer --- ResetPassword
    Customer --- BrowsePhones
    Customer --- GetRecommendation
    Customer --- ViewResults

    Seller --- Register
    Seller --- Login
    Seller --- ResetPassword
    Seller --- AddPhone
    Seller --- EditOwnPhone
    Seller --- DeleteOwnPhone
    Seller --- ViewOwnListings

    Admin --- Login
    Admin --- ManageAllPhones
    Admin --- ViewAllUsers
    Admin --- ViewSellers
    Admin --- ViewRecommendations
    Admin --- GenerateReport
```

---

## 4. Activity Diagram - System Flow

```mermaid
flowchart LR
    Start([Start]) --> Auth{Authenticated?}
    Auth -->|No| Login[Login or Register]
    Login --> Auth
    Auth -->|Yes| Role{Role?}

    Role -->|Customer| Prefs[Submit Preferences]
    Role -->|Seller| Manage[Manage My Listings]
    Role -->|Admin| Monitor[Monitor System]

    Prefs --> AI[AI Scores All Phones]
    AI --> Results[Return Top 3 with Match %]
    Results --> Save[Save to Recommendation History]
    Save --> End([End])

    Manage --> CRUD[Add / Edit / Delete Own Phones]
    CRUD --> End

    Monitor --> Overview[View Stats, Users, Reports]
    Monitor --> Override[Edit or Delete Any Phone]
    Override --> End
    Overview --> End
```

---

## 5. Role-Based Access Control Diagram

```mermaid
graph TD
    Request[Incoming Request]
    Request --> SessionCheck{Session Active?}
    SessionCheck -->|No| Reject401[401 Unauthorized]
    SessionCheck -->|Yes| RoleCheck{User Role?}

    RoleCheck -->|admin| AdminAccess[Full Access: All Phones, Users, Reports]
    RoleCheck -->|seller| SellerCheck{Owns This Resource?}
    RoleCheck -->|customer| CustomerAccess[Read Only: Browse and Recommend]

    SellerCheck -->|Yes| SellerAccess[Allowed: Add / Edit / Delete Own Phone]
    SellerCheck -->|No| Reject403[403 Forbidden]
```

---

## 6. Entity Relationship Diagram

```mermaid
erDiagram
    USER {
        ObjectId _id
        String fullName
        String email
        String password
        String role
        Date createdAt
    }

    PHONE {
        ObjectId _id
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
        ObjectId addedBy
        Date createdAt
        Date updatedAt
    }

    RECOMMENDATION {
        ObjectId _id
        ObjectId userId
        Object preferences
        Array recommendedPhones
        Date createdAt
    }

    USER ||--o{ RECOMMENDATION : makes
    USER ||--o{ PHONE : lists
    PHONE ||--o{ RECOMMENDATION : included_in
```

---

## 7. System Architecture Diagram

```mermaid
graph TD
    Browser[Browser HTML CSS JS]

    subgraph Express Server
        AuthRoutes[/api/auth]
        PhoneRoutes[/api/phones]
        RecommendRoutes[/api/recommend]
        ReportRoutes[/api/report]
        AuthMiddleware[middleware/auth.js isAdmin isSeller isAdminOrSeller]
    end

    subgraph Controllers
        AuthCtrl[authController.js]
        PhoneCtrl[phoneController.js]
        RecommendCtrl[recommendController.js]
    end

    subgraph Models
        UserModel[User.js]
        PhoneModel[Phone.js]
        RecModel[Recommendation.js]
    end

    MongoDB[(MongoDB)]

    Browser --> AuthRoutes
    Browser --> PhoneRoutes
    Browser --> RecommendRoutes
    Browser --> ReportRoutes

    PhoneRoutes --> AuthMiddleware
    AuthMiddleware --> PhoneCtrl

    AuthRoutes --> AuthCtrl
    RecommendRoutes --> RecommendCtrl

    AuthCtrl --> UserModel
    PhoneCtrl --> PhoneModel
    RecommendCtrl --> PhoneModel
    RecommendCtrl --> RecModel

    UserModel --> MongoDB
    PhoneModel --> MongoDB
    RecModel --> MongoDB
```

---

*View diagrams interactively at https://mermaid.live — paste any code block above.*
