# Asset Management Module

This is a complete Asset Management Dashboard and Frontend UI for an ITSM platform, built with Python (FastAPI) and Next.js.

## Project Structure

```
/asset-management
    /backend            # FastAPI Backend
        main.py         # Entry point
        /routers        # API Endpoints
        /models         # Internal Models
        /schemas        # Pydantic Schemas
        /services       # Business Logic
    /frontend           # Next.js Frontend
        /pages          # Routes
        /components     # Reusable UI
        /styles         # Tailwind CSS
```

## Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

## 1. Backend Setup (Python FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd asset-management/backend
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the server:
   ```bash
   uvicorn main:app --reload
   ```
   
   The API will be available at `http://localhost:8000`.
   API Documentation (Swagger UI) is at `http://localhost:8000/docs`.

## 2. Frontend Setup (Next.js)

1. Navigate to the frontend directory:
   ```bash
   cd asset-management/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`.

## Features

- **Dashboard**: Overview of asset status, warranty risks, and recent items.
- **Asset Inventory**: Searchable and filterable table of all assets.
- **Asset Details**: Comprehensive view of asset specs, history, and ownership.
- **Asset Assignment**: Assign assets to users and locations.
- **Add Asset**: Form to register new hardware/software.
- **Mock Data**: The backend comes pre-loaded with mock data for testing.

## API Endpoints

- `GET /assets`: List all assets
- `POST /assets`: Create a new asset
- `GET /assets/{id}`: Get asset details
- `PATCH /assets/{id}/assign`: Assign asset
- `PATCH /assets/{id}/status`: Update status
- `GET /assets/stats`: Get dashboard statistics
