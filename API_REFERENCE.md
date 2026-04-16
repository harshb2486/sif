# API Reference

Complete API documentation for Field Sales Management System

## Base URL
```
http://localhost:5000
```

## Authentication

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register Company
Creates a new company with admin user.

**Endpoint:** `POST /auth/register/company`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "companyName": "Acme Corporation",
  "companyEmail": "company@acme.com"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Company and admin registered successfully",
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "company_admin",
      "companyId": 1
    }
  }
}
```

---

### Register Sales Person
Registers a sales person (requires company ID).

**Endpoint:** `POST /auth/register/sales`

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "companyId": 1
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Sales person registered successfully. Waiting for admin approval.",
  "data": {
    "user": {
      "id": 2,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "sales",
      "companyId": 1,
      "is_verified": false
    }
  }
}
```

---

### Login
Authenticates user and returns JWT token.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "company_admin",
      "companyId": 1,
      "is_verified": true
    }
  }
}
```

---

## Company Endpoints

### Get Sales Persons
Retrieves sales persons (pending or verified).

**Endpoint:** `GET /companies/sales-persons?status=pending`

**Parameters:**
- `status` (query): `pending` or `verified`

**Authorization:** Required (company_admin role)

**Response (200):**
```json
{
  "success": true,
  "message": "Sales persons retrieved successfully",
  "data": [
    {
      "id": 2,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "sales",
      "is_verified": false,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### Approve Sales Person
Approves/verifies a sales person.

**Endpoint:** `PUT /companies/sales/:id/approve`

**Parameters:**
- `id` (path): Sales person ID

**Authorization:** Required (company_admin role)

**Response (200):**
```json
{
  "success": true,
  "message": "Sales person approved successfully",
  "data": {
    "userId": 2,
    "approved": true
  }
}
```

---

### Get Company Details
Retrieves company information.

**Endpoint:** `GET /companies/:id`

**Parameters:**
- `id` (path): Company ID

**Authorization:** Required

**Response (200):**
```json
{
  "success": true,
  "message": "Company details retrieved successfully",
  "data": {
    "id": 1,
    "name": "Acme Corporation",
    "email": "company@acme.com",
    "created_at": "2024-01-10T08:00:00Z"
  }
}
```

---

## Product Endpoints

### Create Product
Creates a new product.

**Endpoint:** `POST /products`

**Authorization:** Required (company_admin role)

**Request Body:**
```json
{
  "name": "Premium Package",
  "price": 99.99,
  "commissionType": "percentage",
  "commissionValue": 10
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": 1,
    "name": "Premium Package",
    "price": 99.99,
    "commissionType": "percentage",
    "commissionValue": 10
  }
}
```

---

### Get All Products
Retrieves all products for the company.

**Endpoint:** `GET /products`

**Authorization:** Required

**Response (200):**
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Premium Package",
      "price": 99.99,
      "commission_type": "percentage",
      "commission_value": 10,
      "company_id": 1,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### Get Single Product
Retrieves a specific product.

**Endpoint:** `GET /products/:id`

**Parameters:**
- `id` (path): Product ID

**Authorization:** Required

**Response (200):**
```json
{
  "success": true,
  "message": "Product retrieved successfully",
  "data": {
    "id": 1,
    "name": "Premium Package",
    "price": 99.99,
    "commission_type": "percentage",
    "commission_value": 10
  }
}
```

---

### Update Product
Updates product details.

**Endpoint:** `PUT /products/:id`

**Parameters:**
- `id` (path): Product ID

**Authorization:** Required (company_admin role)

**Request Body:**
```json
{
  "name": "Premium Package Plus",
  "price": 119.99,
  "commissionType": "percentage",
  "commissionValue": 12
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "id": 1,
    "name": "Premium Package Plus",
    "price": 119.99,
    "commissionType": "percentage",
    "commissionValue": 12
  }
}
```

---

### Delete Product
Deletes a product.

**Endpoint:** `DELETE /products/:id`

**Parameters:**
- `id` (path): Product ID

**Authorization:** Required (company_admin role)

**Response (200):**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

## Sales Endpoints

### Get Available Products
Gets products for creating sales (sales person only).

**Endpoint:** `GET /sales/products`

**Authorization:** Required (verified sales role)

**Response (200):**
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Premium Package",
      "price": 99.99,
      "commission_type": "percentage",
      "commission_value": 10
    }
  ]
}
```

---

### Create Order
Creates a new sales order.

**Endpoint:** `POST /sales/orders`

**Authorization:** Required (verified sales role)

**Request Body:**
```json
{
  "productId": 1,
  "clientName": "Acme Inc.",
  "amount": 99.99
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "orderId": 5,
    "productId": 1,
    "clientName": "Acme Inc.",
    "amount": 99.99,
    "commission": 9.99
  }
}
```

---

### Get My Orders
Gets orders created by current sales person.

**Endpoint:** `GET /sales/orders`

**Authorization:** Required (verified sales role)

**Response (200):**
```json
{
  "success": true,
  "message": "Orders retrieved successfully",
  "data": [
    {
      "id": 5,
      "client_name": "Acme Inc.",
      "product_name": "Premium Package",
      "amount": 99.99,
      "created_at": "2024-01-15T14:20:00Z"
    }
  ]
}
```

---

### Get My Commissions
Gets commissions earned.

**Endpoint:** `GET /sales/commissions`

**Authorization:** Required (verified sales role)

**Response (200):**
```json
{
  "success": true,
  "message": "Commissions retrieved successfully",
  "data": {
    "commissions": [
      {
        "id": 1,
        "client_name": "Acme Inc.",
        "product_name": "Premium Package",
        "amount": 9.99,
        "created_at": "2024-01-15T14:20:00Z"
      }
    ],
    "total": 29.97
  }
}
```

---

## Report Endpoints

### Get Dashboard Statistics
Gets overview statistics.

**Endpoint:** `GET /reports/dashboard`

**Authorization:** Required

**Response (200):**
```json
{
  "success": true,
  "message": "Dashboard statistics retrieved successfully",
  "data": {
    "totalSales": 299.97,
    "totalOrders": 3,
    "totalCommissionsIssued": 29.97,
    "verifiedSalesPersons": 2,
    "mySales": 99.99,
    "myOrders": 1,
    "myCommissions": 9.99
  }
}
```

---

### Get Sales Report
Gets detailed sales data for company.

**Endpoint:** `GET /reports/sales`

**Authorization:** Required (company_admin role)

**Response (200):**
```json
{
  "success": true,
  "message": "Sales report retrieved successfully",
  "data": {
    "summary": {
      "totalSales": 299.97,
      "totalOrders": 3,
      "averageOrderValue": 99.99
    },
    "details": [
      {
        "id": 5,
        "product_name": "Premium Package",
        "sales_person_name": "Jane Smith",
        "client_name": "Acme Inc.",
        "amount": 99.99,
        "created_at": "2024-01-15T14:20:00Z"
      }
    ]
  }
}
```

---

### Get Commission Report
Gets detailed commission data.

**Endpoint:** `GET /reports/commission`

**Authorization:** Required (company_admin role)

**Response (200):**
```json
{
  "success": true,
  "message": "Commission report retrieved successfully",
  "data": {
    "summary": {
      "totalCommissions": 29.97,
      "totalRecords": 3,
      "averageCommission": 9.99
    },
    "details": [
      {
        "id": 1,
        "sales_person_name": "Jane Smith",
        "product_name": "Premium Package",
        "client_name": "Acme Inc.",
        "amount": 9.99,
        "created_at": "2024-01-15T14:20:00Z"
      }
    ]
  }
}
```

---

### Get Leaderboard
Gets top sales persons by commission.

**Endpoint:** `GET /reports/leaderboard?limit=10`

**Parameters:**
- `limit` (query): Maximum results (default 10)

**Authorization:** Required (company_admin role)

**Response (200):**
```json
{
  "success": true,
  "message": "Leaderboard retrieved successfully",
  "data": [
    {
      "id": 2,
      "name": "Jane Smith",
      "total_commissions": 3,
      "total_amount": 29.97
    }
  ]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "All fields are required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "No token provided. Please login."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Forbidden: You do not have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Product not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Email already registered"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Server error: [error details]"
}
```

---

## Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Permission denied
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists
- `500 Internal Server Error` - Server error

---

## Rate Limiting

Currently no rate limiting. Recommended to add for production.

---

## Pagination

Not yet implemented. Recommended for large datasets.

---

## Filtering

Supported filters:
- `status` - For sales persons (pending/verified)
- `limit` - For leaderboard results

---

## Version History

- **v1.0.0** - Initial release with core functionality
