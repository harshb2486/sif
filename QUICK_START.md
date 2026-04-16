# Quick Start Guide

Get the Field Sales Management System running in 5 minutes!

## Prerequisites
- Node.js installed
- MySQL installed and running
- Text editor (VS Code recommended)

## Step 1: Setup Database (2 min)

```bash
# Open MySQL command line
mysql -u root -p

# Paste the contents of backend/database.sql
# OR run this command:
mysql -u root -p < path/to/backend/database.sql

# Verify database created
USE field_sales_db;
SHOW TABLES;
```

## Step 2: Setup Backend (2 min)

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Edit .env file with your database credentials
# Windows:
notepad .env
# Mac/Linux:
nano .env

# Update these values:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=field_sales_db

# Start server
npm run dev

# You should see:
# ╔════════════════════════════════════╗
# ║ Field Sales Management API Server  ║
# ║ Running on: http://localhost:5000  ║
# ╚════════════════════════════════════╝
```

## Step 3: Setup Frontend (1 min)

```bash
# Open new terminal
cd frontend

# Install dependencies
npm install

# Start React app
npm start

# Browser will open at http://localhost:3000
```

## Step 4: First Login (Immediate)

### Create Company Admin
1. Click "Register" on login page
2. Select "Company Admin" tab
3. Fill form:
   - Your Name: John Doe
   - Your Email: john@company.com
   - Password: password123
   - Company Name: Tech Corp
   - Company Email: company@techcorp.com
4. Click "Register Company"
5. You're logged in! ✅

### Create Sales Person
1. Still logged in as admin
2. Open new tab: `http://localhost:3000/register`
3. Select "Sales Person" tab
4. Fill form:
   - Name: Jane Smith
   - Email: jane@company.com
   - Company ID: 1 (from admin account)
   - Password: password123
5. Click "Register as Sales Person"
6. Go back to admin account and approve her

## Step 5: Test the Flow

### As Admin:
1. ✅ Dashboard - View stats
2. ✅ Products - Create a product
   - Name: Premium Package
   - Price: $99.99
   - Commission: 10% (percentage)
3. ✅ Sales Team - Approve Jane
4. ✅ Reports - View commission data

### As Sales Person:
1. Logout from admin account
2. Login as Jane (jane@company.com)
3. Approve notification should show ✅
4. ✅ Dashboard - View pending approval
5. Wait for admin to approve
6. After approval:
   - ✅ Create Sale - Sell the Premium Package
   - ✅ My Orders - View your sales
   - ✅ My Commissions - See earned commission

## Troubleshooting

### Backend won't start
```bash
# Check port 5000 is free
# Windows:
netstat -ano | findstr :5000

# If occupied, kill process:
taskkill /PID <PID> /F

# Or change port in backend/.env
PORT=5001
```

### Frontend won't load
```bash
# Clear npm cache
npm cache clean --force

# Reinstall
rm -rf node_modules package-lock.json
npm install
npm start
```

### Can't connect to database
```bash
# Check MySQL is running
# Windows:
sc query MySQL

# Mac:
brew services list

# Verify credentials in .env
# Test connection:
mysql -u root -p -h localhost
```

### Can't find company ID
```bash
# Check in MySQL:
mysql -u root -p
USE field_sales_db;
SELECT id, name FROM companies;
```

## Default Test Credentials

After setup, you can use:
- **Admin Email:** john@company.com
- **Admin Password:** password123
- **Sales Email:** jane@company.com
- **Sales Password:** password123

## Next Steps

1. ✅ Create more products
2. ✅ Register more sales persons
3. ✅ Approve them as admin
4. ✅ Create sales and track commissions
5. ✅ View reports and leaderboard

## Useful Commands

```bash
# Backend
npm run dev        # Start with auto-reload
npm start          # Start production

# Frontend
npm start          # Start development server
npm build          # Build for production
npm test           # Run tests

# Database
# Connect to MySQL:
mysql -u root -p field_sales_db

# Common queries:
SELECT * FROM users;
SELECT * FROM companies;
SELECT * FROM products;
SELECT * FROM orders;
SELECT * FROM commissions;

# Drop database if needed:
DROP DATABASE field_sales_db;
```

## API Testing

Test API endpoints with Postman or curl:

```bash
# Register
curl -X POST http://localhost:5000/auth/register/company \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin Name",
    "email": "admin@test.com",
    "password": "pass123",
    "confirmPassword": "pass123",
    "companyName": "Test Corp",
    "companyEmail": "test@corp.com"
  }'

# Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "pass123"
  }'
```

## File Structure Quick Reference

```
sif/
├── backend/
│   ├── src/server.js          ← Start backend here
│   ├── database.sql           ← SQL schema
│   ├── package.json           ← Backend dependencies
│   └── .env                   ← Database config
│
└── frontend/
    ├── src/index.js           ← React entry point
    ├── package.json           ← Frontend dependencies
    └── .env                   ← API URL config
```

## Performance Tips

1. **Backend:** Use `npm run dev` for development
2. **Frontend:** Clear browser cache if styles look wrong
3. **Database:** Indexes are pre-created for fast queries
4. **Requests:** Avoid rapid consecutive requests

## Security Reminder

⚠️ **For production deployment:**
1. Change `JWT_SECRET` in backend/.env
2. Use environment variables properly
3. Enable HTTPS
4. Add rate limiting
5. Implement proper error logging
6. Use strong database passwords

---

**You're all set! Happy selling! 🚀**

Need help? Check the main README.md or API_REFERENCE.md
