# Research Publication Management System (RPMS) - Backend

This repository houses the backend codebase for the Research Publication Management System (RPMS). The application manages faculty research submissions, coordinates reviews, generates formatted spreadsheet statistics for administrators, and processes payments via Razorpay.

---

## 1. System Architecture & Tech Stack

The system is constructed with Node.js and Express under a layered **Controller-Service-Repository** pattern:

*   **Server Initialization (`server.js`)**: Configures application environment variables and registers cron schedules.
*   **Express App Core (`src/app.js`)**: Configures middlewares (CORS, body parser) and connects the routing network.
*   **Routing System (`route/`)**: Intercepts HTTP requests and applies security layers (JWT verification).
*   **Controllers (`controller/`)**: Unpacks request payloads, delegates processing to services, and frames HTTP responses.
*   **Services (`service/`)**: Houses core business logic and triggers utility layers (SMTP mail).
*   **Repositories (`repository/`)**: Coordinates SQL transactions with PostgreSQL and operates cloud APIs (AWS S3 and Razorpay).
*   **Database Integration (`db.js`, `schema.SQL`)**: Connects to PostgreSQL using a connection pool.

```mermaid
graph TD
    Client[Client Browser / App]
    subgraph Express Backend
        App[src/app.js]
        Routes[route/ - Routing Layer]
        Auth[middleware/authmiddleware.js]
        Controllers[controller/ - Controller Layer]
        Services[service/ - Service Layer]
        Repos[repository/ - Repository Layer]
    end

    subgraph External Services
        DB[(PostgreSQL Database)]
        AWS[AWS S3 Bucket]
        Razorpay[Razorpay Payment API]
        SSO[SSO Auth Server]
        SMTP[SMTP Gmail Server]
    end

    Client <-->|HTTP Requests| App
    App --> Routes
    Routes -->|Authenticate Token| Auth
    Routes --> Controllers
    Controllers --> Services
    Services --> Repos
    Repos <-->|Query Pool| DB
    Repos <-->|File Storage| AWS
    Repos <-->|Order Creation| Razorpay
    Services <-->|HTTP Validation| SSO
    Services -->|Mail Alerts| SMTP
```

---

## 2. Database Schema & Relationships

The database is built on PostgreSQL with the following core entities:

```mermaid
erDiagram
    users ||--o{ submissions : "submits"
    users ||--o{ user_social_links : "possesses"
    users ||--o{ faculty_activities : "logs"
    users ||--o{ temp_admin_permissions : "delegated"
    users ||--o{ notifications : "receives"
    categories ||--o{ submissions : "categorizes"
    categories ||--o{ payments : "defines cost of"
    submissions ||--o| payments : "paid through"
```

### Table Definitions
1.  **`users`**: Contains faculty and admin profiles. Includes boolean fields `admin` and `temp_admin` to configure roles.
2.  **`categories`**: Stores submission types (e.g., Journal, Conference) along with their respective validation fees.
3.  **`submissions`**: Tracks paper metadata, status (`Pending`, `Completed`), duplicate detection links, and S3 file locations.
4.  **`payments`**: Records Razorpay transaction parameters and status (`PENDING`, `SUCCESS`).
5.  **`temp_admin_permissions`**: Maps granular accessibility controls (e.g. `dashboard`, `submissions_queue`, `delete_manuscript`) to faculty members acting as temporary admins.
6.  **`social_media_master` & `user_social_links`**: Manages configured social profile platforms and users' specific links.
7.  **`notifications`**: Accumulates alert events for users.
8.  **`faculty_activities`**: Logs user login dates and submission counters.

---

## 3. Core Functional Workflows

### Workflow A: Single Sign-On (SSO) Authentication
```mermaid
sequenceDiagram
    autonumber
    participant Client
    participant AuthController
    participant AuthService
    participant SSOServer as External SSO URL
    participant AuthRepo
    participant PostgreSQL

    Client->>AuthController: POST /api/auth/sso-login (payload)
    AuthController->>AuthService: ssoLogin(payload)
    AuthService->>SSOServer: Axios POST (SSO_URL, payload)
    SSOServer-->>AuthService: Return { success, user }
    
    alt Auth Failed
        AuthService-->>AuthController: Throw SSO Authentication Failed
        AuthController-->>Client: HTTP 500 Failure
    else Auth Success
        AuthService->>AuthRepo: findUser(userId)
        AuthRepo->>PostgreSQL: SELECT * FROM users WHERE user_id
        PostgreSQL-->>AuthRepo: Return user data or null
        
        alt User does not exist locally
            AuthService->>AuthRepo: createUser(user)
            AuthRepo->>PostgreSQL: INSERT INTO users VALUES (...)
            PostgreSQL-->>AuthRepo: Return created user row
        end
        
        AuthService->>AuthService: Sign JWT (user_id, role, email) - 7d expiry
        AuthService-->>AuthController: Return token & user profile
        AuthController-->>Client: HTTP 200 { success: true, token, user }
    end
```

### Workflow B: Manuscript Submission (Faculty Side)
```mermaid
sequenceDiagram
    autonumber
    participant Faculty as Faculty Client
    participant SubController as SubmissionController
    participant SubService as SubmissionService
    participant SubRepo as SubmissionRepository
    participant PostgreSQL
    participant S3 as AWS S3 Bucket

    Faculty->>SubController: POST /api/faculty/submission/create (manuscript PDF, title, category_id)
    SubController->>SubService: createSubmission(userId, data, file)
    SubService->>SubRepo: createSubmission(userId, data, file)
    
    SubRepo->>PostgreSQL: Query user details (department, institution_id)
    PostgreSQL-->>SubRepo: Return user details
    
    SubRepo->>PostgreSQL: Case-insensitive search on title to check duplicates
    PostgreSQL-->>SubRepo: Duplicate list
    Note over SubRepo: Sets is_duplicate = true & duplicate_of = original_id if matches found
    
    SubRepo->>PostgreSQL: Query count of total, institution, & user papers
    PostgreSQL-->>SubRepo: Returns counts
    Note over SubRepo: Formats Custom ID: INST-overallCount-instCount-facCount
    
    SubRepo->>S3: Upload manuscript to manuscripts/
    S3-->>SubRepo: Return S3 PDF URL
    
    SubRepo->>PostgreSQL: INSERT INTO submissions (status = 'Pending')
    PostgreSQL-->>SubRepo: Return inserted row
    SubRepo-->>SubService: Return submission data
    SubService-->>SubController: Return submission data
    SubController-->>Faculty: HTTP 201 { success: true, data }
```

### Workflow C: Review Upload & Completion (Admin Side)
```mermaid
sequenceDiagram
    autonumber
    participant Admin as Admin Client
    participant RevController as ReviewController
    participant RevService as ReviewService
    participant RevRepo as ReviewRepository
    participant S3 as AWS S3 Bucket
    participant PostgreSQL
    participant Mail as MailService
    participant SMTP as Nodemailer SMTP

    Admin->>RevController: PUT /api/admin/submission/view/:id/review (reviewPdf)
    RevController->>RevService: uploadReview(customPublicationId, file)
    RevService->>RevRepo: uploadReview(customPublicationId, file)
    
    RevRepo->>S3: Upload review file to reviews/
    S3-->>RevRepo: Return S3 PDF URL
    
    RevRepo->>PostgreSQL: UPDATE submissions SET review_pdf_url, status = 'Completed'
    PostgreSQL-->>RevRepo: Return updated submission
    
    RevRepo->>PostgreSQL: Fetch author details (name, email, paper title)
    PostgreSQL-->>RevRepo: Faculty details
    
    RevRepo->>Mail: sendFacultyReviewMail(email, name, title, publicationId)
    Mail->>SMTP: transporter.sendMail(...)
    SMTP-->>Mail: Dispatch email alert to Faculty
    
    RevRepo-->>RevService: Return updated row
    RevService-->>RevController: Return updated row
    RevController-->>Admin: HTTP 200 { success: true, message, data }
```

### Workflow D: Payment Order Generation (Razorpay)
```mermaid
sequenceDiagram
    autonumber
    participant Client
    participant PayController as PaymentController
    participant PayService as PaymentService
    participant PayRepo as PaymentRepository
    participant PostgreSQL
    participant Razorpay as Razorpay API

    Client->>PayController: POST /api/payment/create-order/:custom_publication_id
    PayController->>PayService: createOrder(custom_publication_id)
    PayService->>PayRepo: createOrder(custom_publication_id)
    
    PayRepo->>PostgreSQL: SELECT fees, category_id, publication_id FROM categories & submissions
    PostgreSQL-->>PayRepo: Return payment criteria
    
    PayRepo->>Razorpay: orders.create({ amount: fees * 100, currency: 'INR', receipt })
    Razorpay-->>PayRepo: Return Razorpay Order details
    
    PayRepo->>PostgreSQL: INSERT INTO payments (status = 'PENDING', razorpay_order_id)
    PostgreSQL-->>PayRepo: Return payment entry
    
    PayRepo-->>PayService: Return details (order_id, amount, currency)
    PayService-->>PayController: Return details
    PayController-->>Client: HTTP 200 { success: true, data }
```

---

## 4. API Endpoints Dictionary

| HTTP Method | Route | Authentication | Purpose |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/sso-login` | None | Authenticates user against external SSO server and returns JWT. |
| **GET** | `/api/admin/profile` | JWT Auth | Returns details of the logged-in administrator. |
| **GET** | `/api/faculty/profile` | JWT Auth | Returns faculty details and enabled social media links. |
| **PUT** | `/api/faculty/social-links/profile/social-links` | JWT Auth | Rewrites social media URLs for the faculty member. |
| **GET** | `/api/admin/social-links` | None | Lists global social media platform definitions. |
| **POST** | `/api/admin/social-links` | None | Defines a new global social platform configuration. |
| **PUT** | `/api/admin/social-links/:id` | None | Enables/disables a global social media platform. |
| **DELETE**| `/api/admin/social-links:id` | None | Deletes a global social media configuration. |
| **POST** | `/api/admin/category-control/category` | JWT Auth | Adds a new submission category and fee tier. |
| **GET** | `/api/admin/category-control/categories` | JWT Auth | Lists all publication categories. |
| **PUT** | `/api/admin/category-control/category/:categoryId` | JWT Auth | Edits a category's name or processing fee. |
| **DELETE**| `/api/admin/category-control/category/:categoryId` | JWT Auth | Removes a category (only if unused by submissions). |
| **POST** | `/api/faculty/submission/create` | JWT Auth | Uploads manuscript, checks title duplicates, returns record. |
| **POST** | `/api/payment/create-order/:custom_publication_id` | JWT Auth | Generates a Razorpay transaction order. |
| **GET** | `/api/admin/submissionqueue` | JWT Auth | Lists all submissions sorted by uploaded date. |
| **GET** | `/api/admin/submission/view/:customPublicationId` | JWT Auth | Fetches granular details of a specific paper for evaluation. |
| **PUT** | `/api/admin/submission/view/:customPublicationId/review` | JWT Auth | Uploads feedback file and moves status to `Completed`. |
| **GET** | `/api/admin/tempadmin/faculties` | JWT Auth | Lists faculty candidates for temporary admin delegation. |
| **POST** | `/api/admin/tempadmin/grant-access` | JWT Auth | Converts faculty to temp admin and assigns access permissions. |
| **GET** | `/api/admin/tempadmin/permissions/:userId` | JWT Auth | Fetches delegated permission metrics. |
| **DELETE**| `/api/admin/tempadmin/revoke-access/:userId` | JWT Auth | Revokes temporary admin privileges. |
| **GET** | `/api/admin/dashboard` | JWT Auth | Renders dashboard summary counters and trend logs. |
| **GET** | `/api/admin/dashboard/export` | JWT Auth | Compiles an Excel workbook and returns download URL. |
| **GET** | `/api/admin/faculty-profiles` | JWT Auth | Catalogs faculty members alongside submission counts. |
| **GET** | `/api/admin/faculty-profile/:userId` | JWT Auth | Displays faculty profiles alongside individual paper tracks. |
| **GET** | `/api/my-publications` | JWT Auth | Retrieves user publications (Admin/Temp Admin sees all). |
| **GET** | `/api/my-publications/:customPublicationId` | JWT Auth | Displays individual publication data. |
| **GET** | `/api/notifications/admin/count` | JWT Auth | Counts unread notifications. |
| **GET** | `/api/notifications/faculty` | JWT Auth | Displays notifications stack sorted chronologically. |
| **PUT** | `/api/notifications/read/:notificationId` | JWT Auth | Sets notification state to read. |
| **GET** | `/test/test-mail` | None | Fires a debug email to verify SMTP network configuration. |

---

## 5. Background Tasks (Cron Job)

The application handles recurring compilation services:
*   **Daily Submission Report (`jobs/adminmailreport.js`)**: Executes daily at **6:00 PM** (`0 18 * * *`). It pulls a list of uploads from the previous 24 hours and emails an HTML summary directly to the admin (`process.env.ADMIN_EMAIL`).

---

## 6. Known Developer Findings & Critical Gaps

1.  **Missing Payment Hook Validation**: The payments system generates orders but does not provide API hooks or signature check logic to capture successful customer checkouts. Orders will remain in `PENDING` indefinitely.
2.  **Dormant Notification System**: The notification engine routes and database structures are complete, but in-app actions (e.g. file submissions, review uploads) never make calls to trigger the notifications.
3.  **Implicit Admin Guard Checks**: Routes nested under `/api/admin` rely on generic `authMiddleware` that verifies token presence but doesn't validate if `admin` or `temp_admin` flags are true on the user row, presenting a potential authorization issue.
