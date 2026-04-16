# Backend Setup Guide

## Prerequisites
- Node.js (v18 or higher)
- MySQL 5.7+ installed and running
- npm or yarn package manager

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create/update the `.env` file in the backend directory:

```env
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=<your_mysql_password>
DB_NAME=field_sales_db
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# API Configuration
API_URL=http://localhost:5000

# Email Configuration (optional for development)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=noreply@fieldsales.com
```

### 3. Initialize Database

#### Windows (Command Prompt):
```cmd
mysql -u root -p < database.sql
```

#### Windows (PowerShell):
```powershell
Get-Content database.sql | mysql -u root -p
```

#### Linux/Mac:
```bash
mysql -u root -p < database.sql
```

When prompted, enter your MySQL root password.

**Alternative**: Manually create the database:
1. Open MySQL Workbench or mysql command line
2. Create the database: `CREATE DATABASE field_sales_db;`
3. Import the schema: `source /path/to/database.sql;`

### 4. Start Development Server
```bash
npm run dev
```

The server will start on `http://localhost:5000` and display:
```
╔════════════════════════════════════════╗
║ Field Sales Management API Server      ║
║ Running on: http://localhost:5000      ║
║ Environment: DEVELOPMENT               ║
╚════════════════════════════════════════╝
```

### 5. Verify Setup
Test the API health endpoint:
```bash
curl http://localhost:5000/health
```

Expected response: `{"status":"ok"}`

## Database Schema

The database includes the following tables:
- **companies** - Tenant organizations
- **users** - System users with roles (platform_admin, company_admin, sales, client)
- **products** - Sales products
- **orders** - Sales orders
- **commissions** - Commission tracking
- **audit_logs** - Change audit trail

All tables are multi-tenant (filtered by company_id).

## Troubleshooting

### Database Connection Failed
- Verify MySQL is running: `mysqladmin -u root -p status`
- Check DB_HOST, DB_USER, DB_PASSWORD in .env match your MySQL setup
- Ensure the database `field_sales_db` exists: `mysql -u root -p -e "SHOW DATABASES;"`

### Port Already in Use
- Change PORT in .env to an available port
- Or kill the process using port 5000

### Dependencies Installation Failed
- Clear npm cache: `npm cache clean --force`
- Delete node_modules: `rm -rf node_modules` (or `rmdir /s node_modules` on Windows)
- Reinstall: `npm install`

## Development Commands

```bash
# Start dev server with auto-reload
npm run dev

# Start production server
npm start

# Run linter (if configured)
npm run lint

# View logs
npm run logs
```

## API Documentation

See [API_REFERENCE.md](../API_REFERENCE.md) for complete endpoint documentation.

## Next Steps
- Start the frontend: See [frontend/README.md](../frontend/README.md)
- Create your first company and user
- Test API endpoints in Postman or VS Code REST Client
