# Finance Tracker - Project Documentation

## 1. Project Overview
**Finance Tracker** is a modern, comprehensive personal finance management application built to help users track their income, expenses, loans (EMIs), and budgets. It leverages the power of Next.js 16 for a fast, server-side rendered experience, combined with a robust MongoDB backend and Clerk for secure authentication.

## 2. Technology Stack

| Category | Technology | Description |
|----------|------------|-------------|
| **Framework** | Next.js 16 (App Router) | React framework for production, handling routing and SSR. |
| **Language** | TypeScript | Strictly typed JavaScript for better maintainability. |
| **Styling** | Tailwind CSS v4 | Utility-first CSS framework. |
| **UI Components** | Shadcn/UI | Reusable, accessible components built on Radix UI. |
| **Database** | MongoDB | NoSQL database for flexible data storage. |
| **ORM** | Mongoose | ODM library for MongoDB connection and modeling. |
| **Authentication** | Clerk | Complete user management and authentication solution. |
| **Form Handling** | React Hook Form + Zod | Efficient form validation and handling. |
| **Icons** | Lucide React | Clean, consistent icon set. |
| **Utilities** | date-fns, Recharts | Date manipulation and charting libraries. |

## 3. Project Structure

The project follows a standard Next.js App Router structure with a clear separation of concerns.

```
/
├── .clerk/             # Clerk specific configuration
├── .next/              # Next.js build output
├── app/                # Main Application Directory (App Router)
│   ├── (auth)/         # Authentication routes (Sign In/Up)
│   ├── (root)/         # Protected application routes
│   │   ├── admin/      # Admin panel for management
│   │   ├── ai-chat/    # AI Assistant interface
│   │   ├── analytics/  # Detailed financial reports
│   │   ├── dashboard/  # Main user overview
│   │   ├── emis/       # Loan and EMI management
│   │   ├── transactions/ # Transaction history and management
│   │   └── user-profile/ # User settings
│   ├── api/            # API Routes (Cron jobs, seeds, specialized endpoints)
│   ├── maintenance/    # Maintenance mode page
│   ├── globals.css     # Global styles and Tailwind imports
│   └── layout.tsx      # Root layout wrapper
├── components/         # React Components
│   ├── ui/             # Generic UI components (Buttons, Inputs, Dialogs)
│   └── shared/         # Application-specific components (Forms, Charts)
├── lib/                # Core Logic & Utilities
│   ├── actions/        # Server Actions (Business Logic Layer)
│   │   ├── bank.actions.ts
│   │   ├── budget.actions.ts
│   │   ├── emi.actions.ts
│   │   ├── transaction.actions.ts
│   │   └── user.actions.ts
│   ├── database/       # Database Configuration
│   │   ├── models/     # Mongoose Schemas (User, Transaction, Bank, etc.)
│   │   └── mongoose.ts # DB Connection Helper
│   ├── hooks/          # Custom React Hooks
│   ├── utils.ts        # Helper functions (e.g., class merging)
│   └── validator.ts    # Zod validation schemas
├── public/             # Static Assets (Images, Icons)
├── scripts/            # Database seeding and maintenance scripts
├── .env.local          # Local environment variables
├── middleware.ts       # Clerk middleware for route protection
├── next.config.ts      # Next.js configuration
└── package.json        # Project dependencies and scripts
```

## 4. Key Features

### 4.1 Dashboard
The command center of the application. It provides:
- **Balance Overview**: Total Income, Expenses, and Current Balance.
- **Charts**: Visual representation of spending over the last 6 months.
- **Recent Activity**: Quick view of the latest 5 transactions.

### 4.2 Transactions Management
Full CRUD (Create, Read, Update, Delete) capabilities for financial records:
- **Tracking**: Categorize as Income or Expense.
- **Filtering**: Filter by date, type, or category.
- **Bank Integration**: Link transactions to specific bank accounts or mark as Cash.

### 4.3 EMI Tracker
Dedicated module for tracking loans:
- **Loan Details**: Record total loan amount, interest rate, and tenure.
- **Schedule**: View amortization schedule.
- **Tracking**: Mark EMIs as paid and see remaining liability.

### 4.4 Analytics
Deep dive into financial health:
- **Category Breakdown**: Pie charts showing where money goes.
- **Monthly Trends**: Bar charts comparing income vs. expenses month-over-month.
- **Payment Methods**: Analysis of spending via Cash vs. Online/Bank.

### 4.5 Automation & Integrations
- **Databases Synchronization**: Automatically syncs Clerk users to MongoDB via webhooks/actions.
- **System Logs**: Internal logging system for tracking critical events.

## 5. Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account (or local instance)
- Clerk Account (for authentication)

### Installation
1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Finance-Tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env.local` file in the root directory and add the following variables:
   ```env
   # Database
   MONGODB_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/finance-tracker

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

   # Optional Configuration
   NEXT_PUBLIC_MAINTENANCE_MODE=false
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Access the app:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 6. Database Models (Mongoose)

- **User**: Stores user profile data linked to Clerk ID. (Fields: `clerkId`, `email`, `username`, `firstName`, `lastName`)
- **Transaction**: The core financial record. (Fields: `amount`, `type` (income/expense), `category`, `bankAccount`, `date`)
- **Bank**: Master list of banks (linked to `BankAccount`).
- **BankAccount**: User's specific accounts (linked to `User` and `Bank`).
- **EMI**: Loan records with schedule details.
- **SystemLog**: Application-level logs for debugging.
- **Notification**: In-app and push notifications (Fields: `userId`, `title`, `message`, `type`, `isRead`)
- **UserDevice**: FCM tokens for push notifications (Fields: `userId`, `fcmToken`, `deviceInfo`, `isActive`)
- **NotificationPreference**: User notification settings (Fields: `userId`, `pushEnabled`, `categories`, `quietHours`)

## 7. Scripts

- `npm run dev`: Starts the local development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs ESLint for code quality checks.
- `npm run notification:indexes`: Creates MongoDB indexes for notification system.
- `npm run notification:cleanup`: Cleans up old notifications and inactive devices.

## 8. Notification System

Finance Tracker includes a complete notification system with:
- **Web Push Notifications** using Firebase Cloud Messaging
- **In-App Notification Center** with bell icon and dropdown
- **User Preferences** for granular control
- **Multi-Device Support** for seamless experience across devices

### Quick Start
```bash
# Install dependencies
npm install @radix-ui/react-scroll-area firebase firebase-admin

# Create database indexes
npm run notification:indexes
```

### Documentation
- **Architecture & Design**: See [`docs/notification-system/IMPLEMENTATION_PLAN.md`](./docs/notification-system/IMPLEMENTATION_PLAN.md)
- **Production Deployment**: See [`docs/notification-system/PRODUCTION_CHECKLIST.md`](./docs/notification-system/PRODUCTION_CHECKLIST.md)
- **Quick Reference**: See [`docs/notification-system/README.md`](./docs/notification-system/README.md)

## 9. Deployment

The application is optimized for deployment on **Vercel**.
1. Push your code to a Git repository.
2. Import the project into Vercel.
3. Add the Environment Variables in the Vercel Project Settings.
4. Deploy!
