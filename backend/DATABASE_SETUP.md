# Database Setup Guide

## PostgreSQL Configuration

The backend is configured to use PostgreSQL. Create a `.env` file in the `backend` directory with the following:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=ITSM
DATABASE_USER=postgres
DATABASE_PASSWORD=1234

# Alternative: Use full DATABASE_URL (will override individual settings above)
# DATABASE_URL=postgresql+psycopg2://postgres:1234@localhost:5432/ITSM
```

## Important Notes

1. **Driver**: The code uses `psycopg2` (synchronous) driver. If you provide `postgresql+asyncpg://` in DATABASE_URL, it will be automatically converted to `psycopg2` for compatibility.

2. **Schemas**: The models use the `asset` schema. Make sure to run `setup_database.py` to create the necessary schemas:
   ```bash
   python setup_database.py
   ```

3. **Database Setup**: Before running the application, ensure:
   - PostgreSQL is running
   - The database `ITSM` exists
   - The user has proper permissions

## Running Database Setup

```bash
# Create schemas and tables
python setup_database.py

# Populate with mock data (optional)
python populate_mock_data.py
```

