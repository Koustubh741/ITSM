# Backend Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies

```powershell
cd "C:\Users\HP\OneDrive\Desktop\Asset management\asset-management\backend"
pip install -r requirements.txt
```

### 2. Configure Database Connection

Edit the `.env` file and update your PostgreSQL password:

```env
DB_PASSWORD=your_actual_password
```

### 3. Create Initial Admin User

Run this SQL in pgAdmin to create your first admin user:

```sql
-- Hash for password "admin123" (change this!)
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
VALUES (
    'admin@company.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLaOYKGO',
    'System',
    'Administrator',
    'system_admin',
    true
);
```

**Default Login Credentials:**
- Email: `admin@company.com`
- Password: `admin123`

⚠️ **IMPORTANT:** Change the password immediately after first login!

### 4. Run the Backend Server

```powershell
python main.py
```

Or using uvicorn directly:

```powershell
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Verify Installation

Open your browser and visit:
- API Documentation: http://localhost:8000/api/docs
- Health Check: http://localhost:8000/health

---

## 📁 Project Structure

```
backend/
├── main.py              # FastAPI application entry point
├── config.py            # Configuration settings
├── database.py          # Database connection
├── models.py            # SQLAlchemy ORM models
├── .env                 # Environment variables (DO NOT COMMIT)
├── requirements.txt     # Python dependencies
└── routers/
    ├── __init__.py
    ├── auth.py          # Authentication (login/logout)
    ├── users.py         # User management
    ├── assets.py        # Asset CRUD operations
    ├── requests.py      # Request management
    ├── dashboard.py     # Dashboard statistics
    ├── departments.py   # Departments
    └── locations.py     # Locations
```

---

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout

### Assets
- `GET /api/assets/` - List all assets (with filters)
- `GET /api/assets/{id}` - Get single asset
- `POST /api/assets/` - Create new asset
- `PUT /api/assets/{id}` - Update asset
- `DELETE /api/assets/{id}` - Delete asset
- `GET /api/assets/stats/summary` - Asset statistics

### Requests
- `GET /api/requests/` - List requests
- `POST /api/requests/` - Create request
- `PUT /api/requests/{id}/approve` - Approve request
- `PUT /api/requests/{id}/reject` - Reject request

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/assets-by-location` - Asset distribution
- `GET /api/dashboard/recent-assets` - Recent assets

### Users
- `GET /api/users/` - List users
- `GET /api/users/{id}` - Get user
- `POST /api/users/` - Create user (admin only)

### Master Data
- `GET /api/departments/` - List departments
- `GET /api/locations/` - List locations

---

## 🧪 Testing the API

### 1. Using Swagger UI

Visit http://localhost:8000/api/docs and test endpoints interactively.

### 2. Using cURL

**Login:**
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@company.com&password=admin123"
```

**Get Assets:**
```bash
curl -X GET "http://localhost:8000/api/assets/" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Using Postman

Import the API from http://localhost:8000/api/docs and test all endpoints.

---

## 🔐 Authentication Flow

1. **Login:** POST to `/api/auth/login` with email & password
2. **Receive Token:** Get JWT access token in response
3. **Use Token:** Include in Authorization header for all subsequent requests
   ```
   Authorization: Bearer <your_token_here>
   ```
4. **Token Expiry:** Access tokens expire in 30 minutes (configurable)

---

## 👥 User Roles

| Role | Access Level |
|------|-------------|
| `end_user` | View assigned assets, create requests |
| `it_support` | Process requests, assign assets |
| `inventory_manager` | Manage inventory, procurement |
| `asset_owner` | Verify and manage specific assets |
| `system_admin` | Full system access |

---

## 🗄️ Database Schema

The backend uses the PostgreSQL schema from `database/schema.sql`. Key tables:

- `users` - User accounts and authentication
- `assets` - Asset inventory
- `asset_categories` - Asset categorization
- `requests` - Service/asset requests
- `workflows` - Approval workflows
- `audit_logs` - Complete audit trail
- `notifications` - User notifications

---

## 🐛 Troubleshooting

### Issue: "ModuleNotFoundError: No module named 'pydantic_settings'"

**Solution:**
```powershell
pip install pydantic-settings
```

### Issue: "Database connection failed"

**Solutions:**
1. Verify PostgreSQL is running
2. Check credentials in `.env` file
3. Ensure database `ITSM` exists
4. Test connection in pgAdmin

### Issue: "Port 8000 already in use"

**Solution:** Change port in `.env`:
```env
PORT=8001
```

### Issue: "CORS error in frontend"

**Solution:** Verify `FRONTEND_URL` in `.env` matches your frontend URL.

---

## 📊 Seeding Sample Data

To add sample data for testing:

```sql
-- In pgAdmin, run:

-- Sample Department
INSERT INTO departments (name, code, description) VALUES
('IT', 'IT', 'Information Technology'),
('HR', 'HR', 'Human Resources'),
('Finance', 'FIN', 'Finance Department');

-- Sample Location
INSERT INTO locations (name, code, city, state, country) VALUES
('Mumbai Office', 'MUM', 'Mumbai', 'Maharashtra', 'India'),
('Delhi Office', 'DEL', 'Delhi', 'Delhi', 'India');

-- Sample Asset Category
INSERT INTO asset_categories (name, segment, description) VALUES
('Laptops', 'IT', 'Laptop computers'),
('Furniture', 'NON_IT', 'Office furniture');
```

---

## 🔄 Next Steps

1. ✅ Backend is running
2. 🔄 Connect frontend to backend (see frontend setup)
3. 🔄 Add more sample data
4. 🔄 Test authentication flow
5. 🔄 Implement additional features

---

## 📝 Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | localhost |
| `DB_PORT` | PostgreSQL port | 5432 |
| `DB_NAME` | Database name | ITSM |
| `DB_USER` | Database user | postgres |
| `DB_PASSWORD` | Database password | (required) |
| `PORT` | Backend server port | 8000 |
| `DEBUG` | Debug mode | True |
| `SECRET_KEY` | JWT secret key | (change in production) |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 |

---

## 🚀 Production Deployment

For production deployment:

1. Set `DEBUG=False` in `.env`
2. Change `SECRET_KEY` to a strong random value
3. Use environment variables instead of `.env` file
4. Set up proper database backups
5. Use a process manager (e.g., systemd, Docker)
6. Enable HTTPS
7. Set up monitoring and logging

---

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
