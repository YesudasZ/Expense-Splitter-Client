# Group Expense Splitter Frontend

This frontend application is built to work with your existing Group Expense Splitter backend API.

## Project Structure

```
expense-splitter-frontend/
├── src/
│   ├── components/
│   │   └── Navbar.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── CreateUser.tsx
│   │   ├── CreateGroup.tsx
│   │   ├── GroupDetails.tsx
│   │   └── AddExpense.tsx
│   ├── services/
│   │   └── api.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── package.json
└── vite.config.ts
```

## Key Components

1. **Dashboard** - Displays all groups and navigation options
2. **CreateUser** - Form for adding new users
3. **CreateGroup** - Interface for creating new groups and selecting members
4. **GroupDetails** - Shows group information, expenses, and balance calculations
5. **AddExpense** - Form for adding new expenses with flexible splitting options

## API Integration

The `api.ts` service handles all communication with your backend API endpoints:

- `/api/user/create` - For creating new users
- `/api/groups` - For group management
- `/api/expenses` - For creating and retrieving expenses
- `/api/groups/:groupId/balances` - For calculating balances with optional transitive parameter