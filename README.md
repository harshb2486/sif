# Field Sales Management System

A production-ready, multi-tenant SaaS platform for managing field sales teams, products, and commissions. Built with React, Node.js/Express, and MySQL.

## 🎯 Features

### Core Features
- ✅ Multi-company (multi-tenant) architecture
- ✅ Role-based access control (RBAC)
- ✅ Sales person verification system
- ✅ Commission tracking and calculation
- ✅ JWT-based authentication
- ✅ Responsive design

### User Roles
1. **Company Admin** - Manage products, approve sales persons, view reports
2. **Sales Person** - Create orders, track commissions, view personal performance
3. **Platform Admin** - System-wide management (optional)

---

## 🏗️ Architecture

### Tech Stack
- **Frontend:** React 18, Axios, React Router
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Authentication:** JWT
- **Security:** bcryptjs for password hashing

### Project Structure

```
sif/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   ├── roleMiddleware.js
│   │   │   └── verificationMiddleware.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Company.js
│   │   │   ├── Product.js
│   │   │   ├── Order.js
│   │   │   └── Commission.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── companyController.js
│   │   │   ├── productController.js
│   │   │   ├── salesController.js
│   │   │   └── reportController.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── companyRoutes.js
│   │   │   ├── productRoutes.js
│   │   │   ├── salesRoutes.js
│   │   │   └── reportRoutes.js
│   │   ├── utils/
│   │   │   └── helpers.js
│   │   └── server.js
│   ├── database.sql
│   ├── package.json
│   ├── .env
│   └── .gitignore
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Header.js
    │   │   ├── Sidebar.js
    │   │   ├── ProtectedRoute.js
    │   │   └── index.js
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── LoginPage.js
    │   │   ├── RegisterPage.js
    │   │   ├── DashboardPage.js
    │   │   ├── ProductsPage.js
    │   │   ├── SalesPersonsPage.js
    │   │   ├── ReportsPage.js
    │   │   ├── CreateOrderPage.js
    │   │   ├── MyOrdersPage.js
    │   │   ├── MyCommissionsPage.js
    │   │   ├── WaitingApprovalPage.js
    │   │   └── index.js
    │   ├── services/
    │   │   └── api.js
    │   ├── App.js
    │   ├── App.css
    │   └── index.js
    ├── public/
    │   └── index.html
    ├── package.json
    ├── .env
    └── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn
- MySQL (v5.7+)

### Installation

#### 1. Clone or Download the Project
```bash
cd d:\Project\sif
```

#### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
# Edit .env file with your database credentials
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=field_sales_db

# Create database and tables
mysql -u root -p < database.sql
# When prompted, enter your MySQL password

# Start development server
npm run dev
# Server will run on http://localhost:5000
```

#### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm start
# App will open on http://localhost:3000
```

---

## 📋 Database Schema

### Tables Created

1. **companies** - Company information
2. **users** - User accounts with roles
3. **products** - Products with commission configuration
4. **orders** - Sales orders
5. **commissions** - Commission records

All tables include indexes for optimal query performance.

---

## 🔐 Authentication Flow

1. **Register** - Create company admin or sales person account
2. **Login** - Get JWT token
3. **Token Storage** - Token stored in localStorage
4. **Protected Routes** - Token validated on each request
5. **Auto Logout** - Redirected to login on token expiration

### Environment Variables

**Backend (.env)**
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=field_sales_db
DB_PORT=3306
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
API_URL=http://localhost:5000
```

**Frontend (.env)**
```env
REACT_APP_API_URL=http://localhost:5000
```

---

## 📡 API Endpoints

### Authentication
- `POST /auth/register/company` - Register company with admin
- `POST /auth/register/sales` - Register sales person
- `POST /auth/login` - Login user

### Company Management
- `GET /companies/:id` - Get company details
- `GET /companies/sales-persons?status=pending` - Get sales persons
- `PUT /companies/sales/:id/approve` - Approve sales person

### Products
- `POST /products` - Create product (admin)
- `GET /products` - Get all products
- `GET /products/:id` - Get single product
- `PUT /products/:id` - Update product (admin)
- `DELETE /products/:id` - Delete product (admin)

### Sales
- `GET /sales/products` - Get products for sales person
- `POST /sales/orders` - Create order
- `GET /sales/orders` - Get my orders
- `GET /sales/commissions` - Get my commissions

### Reports
- `GET /reports/dashboard` - Dashboard statistics
- `GET /reports/sales` - Sales report
- `GET /reports/commission` - Commission report
- `GET /reports/leaderboard` - Leaderboard

---

## 🎨 Frontend Pages

### Public Pages
- **Login** - User authentication
- **Register** - Create new account (company admin or sales person)

### Protected Pages
- **Dashboard** - Overview with key metrics
- **Products** (Admin) - Manage products
- **Sales Team** (Admin) - Manage and approve sales persons
- **Reports** (Admin) - View sales and commission reports
- **Create Sale** (Sales) - Create new order
- **My Orders** (Sales) - View personal orders
- **My Commissions** (Sales) - View earned commissions
- **Waiting Approval** (Sales) - Account pending approval

---

## 💼 Business Logic

### Commission Calculation
```
IF commission_type = 'fixed'
  commission = commission_value

IF commission_type = 'percentage'
  commission = (product_price * commission_value) / 100
```

### Multi-tenant Rules
- Every query filters by `company_id`
- Users can only access their company's data
- Sales persons can only see their own records

### Verification Workflow
1. Sales person registers
2. Account created with `is_verified = FALSE`
3. Company admin reviews and approves
4. Sales person can now create orders

---

## 🧪 Testing the Application

### Test Account 1 - Company Admin
1. Go to Register page
2. Select "Company Admin" tab
3. Fill form and register
4. Login and create products
5. Create sales person account with Company ID = 1

### Test Account 2 - Sales Person
1. Go to Register page
2. Select "Sales Person" tab
3. Enter Company ID = 1
4. Register and login
5. Wait for admin approval
6. After approval, create sales

---

## 📊 Key Features Explained

### 1. Multi-tenancy
- Each company has isolated data
- Users belong to a company
- All queries are company-specific

### 2. Role-Based Access
- **company_admin**: Can manage products, approve staff, view reports
- **sales**: Can create orders and track commissions (only if verified)
- **platform_admin**: Future use for system-wide administration

### 3. Commission Tracking
- Automatic calculation on order creation
- Commission records tied to salesperson
- Easy leaderboard generation

### 4. Security
- Passwords hashed with bcryptjs (10 salt rounds)
- JWT tokens with 7-day expiration
- Input validation on all endpoints
- CORS enabled

---

## 🚨 Common Issues & Solutions

### Issue: Database connection failed
**Solution:** Check MySQL is running and .env credentials are correct
```bash
mysql -u root -p -e "SHOW DATABASES;"
```

### Issue: CORS error
**Solution:** Ensure backend is running on port 5000 and frontend on 3000

### Issue: 401 Unauthorized
**Solution:** Token might be expired. Clear localStorage and login again
```javascript
localStorage.clear();
```

### Issue: Port already in use
**Solution:** Change port in .env or kill process using the port

---

## 📈 Performance Optimizations

- Database indexes on foreign keys
- Indexed queries for common filters
- JWT token caching in localStorage
- Axios interceptors for token management
- Lazy loading in React routing

---

## 🔄 Next Steps / Enhancements

Possible features to add:
- [ ] Email notifications for approvals
- [ ] File upload for product images
- [ ] Monthly performance reports
- [ ] Multi-level commission structures
- [ ] Commission dispute resolution
- [ ] Mobile app (React Native)
- [ ] Analytics dashboard
- [ ] CSV import/export
- [ ] API rate limiting
- [ ] Two-factor authentication

---

## 📝 API Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/new-feature`
2. Commit changes: `git commit -am 'Add new feature'`
3. Push to branch: `git push origin feature/new-feature`
4. Submit pull request

---

## 📄 License

MIT License - Feel free to use this project for your applications

---

## 💬 Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check database schema
4. Review console logs (both frontend and backend)

---

## 🎓 Learning Resources

- Express.js: https://expressjs.com/
- React: https://react.dev/
- MySQL: https://dev.mysql.com/doc/
- JWT: https://jwt.io/introduction
- bcryptjs: https://github.com/dcodeIO/bcrypt.js

---

## ✨ Created with ❤️ for Sales Teams

This is a complete, production-ready application designed for scalability and ease of use. Happy selling! 🚀
