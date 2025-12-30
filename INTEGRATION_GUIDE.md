# 🔗 Backend-Frontend Integration Guide

This guide will help you connect your PostgreSQL database to both backend and frontend.

---

## 📋 Prerequisites Checklist

- [x] PostgreSQL installed and running
- [x] Database `asset_management` created in pgAdmin
- [x] Database schema executed (`database/schema.sql`)
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Admin user created in database

---

## 🗄️ Step 1: Verify Database Setup

### 1.1 Open pgAdmin and verify:

1. Database `asset_management` exists
2. Tables are created (users, assets, requests, etc.)
3. Schema is complete

### 1.2 Create Initial Admin User

Run this SQL in pgAdmin Query Tool:

```sql
-- Password is "admin123" (hashed with bcrypt)
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

### 1.3 Add Sample Data (Optional)

```sql
-- Sample Departments
INSERT INTO departments (name, code, description) VALUES
('IT', 'IT', 'Information Technology'),
('HR', 'HR', 'Human Resources'),
('Finance', 'FIN', 'Finance Department');

-- Sample Locations
INSERT INTO locations (name, code, city, state, country) VALUES
('Mumbai Office', 'MUM', 'Mumbai', 'Maharashtra', 'India'),
('Delhi Office', 'DEL', 'Delhi', 'Delhi', 'India'),
('Bangalore Office', 'BLR', 'Bangalore', 'Karnataka', 'India');

-- Sample Asset Categories
INSERT INTO asset_categories (name, segment, description, depreciation_rate, useful_life_years) VALUES
('Laptops', 'IT', 'Laptop computers', 20.00, 5),
('Desktops', 'IT', 'Desktop computers', 20.00, 5),
('Furniture', 'NON_IT', 'Office furniture', 10.00, 10);
```

---

## 🔧 Step 2: Setup Backend

### 2.1 Navigate to Backend Directory

```powershell
cd "C:\Users\HP\OneDrive\Desktop\Asset management\asset-management\backend"
```

### 2.2 Install Python Dependencies

```powershell
pip install -r requirements.txt
```

Expected packages:
- fastapi
- uvicorn
- sqlalchemy
- psycopg2-binary
- python-jose[cryptography]
- passlib[bcrypt]
- python-dotenv
- pydantic-settings

### 2.3 Configure Database Connection

Edit `backend/.env` file and update your PostgreSQL password:

```env
DB_PASSWORD=YOUR_ACTUAL_POSTGRES_PASSWORD
```

### 2.4 Test Database Connection

Run this test script:

```powershell
python -c "from database import test_connection; print(test_connection())"
```

Expected output: `(True, 'Database connection successful')`

### 2.5 Start Backend Server

```powershell
python main.py
```

Or:

```powershell
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2.6 Verify Backend is Running

Open browser and check:
- ✅ Health Check: http://localhost:8000/health
- ✅ API Docs: http://localhost:8000/api/docs

Expected response from health endpoint:
```json
{
  "status": "healthy",
  "database": "Database connection successful",
  "version": "1.0.0"
}
```

---

## 🎨 Step 3: Setup Frontend

### 3.1 Navigate to Frontend Directory

```powershell
cd "C:\Users\HP\OneDrive\Desktop\Asset management\asset-management\frontend"
```

### 3.2 Verify Environment Variables

Check that `frontend/.env.local` exists with:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 3.3 Start Frontend Server

```powershell
npm run dev
```

Frontend should start on http://localhost:3000

---

## 🔐 Step 4: Test Authentication

### 4.1 Test Login via API Docs

1. Go to http://localhost:8000/api/docs
2. Click on `POST /api/auth/login`
3. Click "Try it out"
4. Enter credentials:
   ```
   username: admin@company.com
   password: admin123
   ```
5. Click "Execute"
6. You should receive an access token

### 4.2 Test Login via Frontend

1. Go to http://localhost:3000
2. Login with:
   - Email: `admin@company.com`
   - Password: `admin123`
3. You should be redirected to the dashboard

---

## 🧪 Step 5: Test Integration

### 5.1 Test Asset Creation

**Via API (Swagger UI):**
1. Login first to get token
2. Click "Authorize" button and paste token
3. Go to `POST /api/assets/`
4. Create a test asset:

```json
{
  "asset_tag": "AST-001",
  "name": "Dell Laptop",
  "segment": "IT",
  "status": "available",
  "category_id": 1,
  "location_id": 1,
  "purchase_cost": 50000,
  "current_value": 50000,
  "specifications": {
    "cpu": "Intel i7",
    "ram": "16GB",
    "storage": "512GB SSD"
  }
}
```

**Via Frontend:**
1. Navigate to Assets page
2. Click "Add Asset"
3. Fill in the form
4. Submit

### 5.2 Test Dashboard Stats

1. Go to http://localhost:8000/api/dashboard/stats (should require auth)
2. Or visit frontend dashboard
3. Verify statistics are displayed

---

## 🔍 Step 6: Verify Complete Integration

### ✅ Backend Checklist

- [ ] Backend server running on port 8000
- [ ] Health check returns "healthy"
- [ ] Can login via API docs
- [ ] Can fetch assets via API
- [ ] Can create assets via API
- [ ] Dashboard stats endpoint works

### ✅ Frontend Checklist

- [ ] Frontend running on port 3000
- [ ] Can access login page
- [ ] Can login with admin credentials
- [ ] Dashboard displays (even if empty/mock data)
- [ ] Can navigate between pages

### ✅ Database Checklist

- [ ] PostgreSQL running
- [ ] Database `asset_management` exists
- [ ] All tables created
- [ ] Admin user exists
- [ ] Can query users table in pgAdmin

---

## 🐛 Troubleshooting

### Issue: Backend won't start

**Error:** `ModuleNotFoundError: No module named 'pydantic_settings'`

**Solution:**
```powershell
pip install pydantic-settings
```

---

### Issue: Database connection failed

**Error:** `Database connection failed: connection refused`

**Solutions:**
1. Check PostgreSQL is running
2. Verify credentials in `.env`
3. Check database exists:
   ```sql
   SELECT datname FROM pg_database WHERE datname = 'asset_management';
   ```

---

### Issue: CORS error in frontend

**Error:** `Access to fetch at 'http://localhost:8000/api/...' has been blocked by CORS policy`

**Solution:**
Backend already configured for CORS. Verify:
1. Backend `.env` has: `FRONTEND_URL=http://localhost:3000`
2. Frontend is running on port 3000
3. Restart backend after changing `.env`

---

### Issue: Login returns 401 Unauthorized

**Solutions:**
1. Verify admin user exists in database
2. Check password hash is correct
3. Try creating user again with SQL above
4. Check backend logs for errors

---

### Issue: Frontend shows "Network Error"

**Solutions:**
1. Verify backend is running (http://localhost:8000/health)
2. Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local`
3. Clear browser cache
4. Check browser console for errors

---

## 📡 API Testing Tools

### Using cURL

**Test Login:**
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@company.com&password=admin123"
```

**Test Get Assets (with token):**
```bash
curl -X GET "http://localhost:8000/api/assets/" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman

1. Import API from http://localhost:8000/api/docs
2. Create environment variable for base URL and token
3. Test all endpoints

---

## 🎯 Next Steps After Integration

1. **Create More Users:**
   - Create users with different roles (end_user, it_support, etc.)
   - Test role-based access control

2. **Add Sample Assets:**
   - Create assets via API or frontend
   - Test asset lifecycle operations

3. **Test Workflows:**
   - Create requests
   - Test approval/rejection flow

4. **Customize Frontend:**
   - Update branding
   - Modify dashboard layouts
   - Add custom features

---

## 📚 Useful Commands

### Backend

```powershell
# Start backend
python main.py

# Check Python version
python --version

# List installed packages
pip list

# Install specific package
pip install package-name
```

### Frontend

```powershell
# Start frontend
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Database

```sql
-- Check all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Count users
SELECT COUNT(*) FROM users;

-- View all users
SELECT id, email, first_name, last_name, role FROM users;

-- View all assets
SELECT id, asset_tag, name, status FROM assets WHERE is_deleted = false;
```

---

## ✅ Success Criteria

You've successfully integrated everything when:

1. ✅ Backend runs without errors
2. ✅ Frontend runs without errors
3. ✅ You can login via frontend
4. ✅ Dashboard shows some data (even if test data)
5. ✅ You can create/view assets
6. ✅ API documentation is accessible
7. ✅ Database queries work in pgAdmin

---

## 🆘 Getting Help

If you encounter issues:

1. Check backend logs in terminal
2. Check frontend console in browser (F12)
3. Verify database connection in pgAdmin
4. Review error messages carefully
5. Check the README files in backend and database folders

---

## 🎉 You're All Set!

Your Asset Management platform is now fully connected:

```
PostgreSQL Database (port 5432)
         ↕
FastAPI Backend (port 8000)
         ↕
React Frontend (port 3000)
```

Start building your application! 🚀
