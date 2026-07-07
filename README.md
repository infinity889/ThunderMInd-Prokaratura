# Qogam Analyze AI

## Overview
Qogam Analyze AI is a comprehensive data analysis and AI-powered insights platform designed to process and visualize geospatial and structured data. It combines a powerful Python/Django backend with a modern React frontend to deliver an intuitive user experience for data analysis and mapping.

## Project Structure

### Backend
Located in `/backend`, the backend is built with:
- **Framework:** Django 6.0.3 with Django REST Framework 3.17.0
- **Key Features:**
  - RESTful API endpoints with Swagger documentation (drf-yasg)
  - JWT authentication (djangorestframework_simplejwt)
  - CORS support for cross-origin requests
  - Data filtering and querying capabilities

**Key Dependencies:**
- Django ORM with database support
- Pandas 3.0.1 for data analysis
- NumPy 2.4.3 for numerical computing
- Groq API integration for AI-powered analysis
- Document processing with python-docx and striprtf
- Pydantic for data validation

**Core Modules:**
- `analytics/` - Analytics and data processing logic
- `core/` - Core application settings and utilities
- `map_data/` - Geospatial data management
- `users/` - User authentication and management

### Frontend
Located in `/frontend`, the frontend is built with:
- **Framework:** React 19.2.4 with TypeScript
- **Build Tool:** Vite 8.0.1
- **Styling:** Tailwind CSS 4.2.2

**Key Features:**
- Interactive geospatial mapping with Leaflet and React-Leaflet
- Map editing capabilities with Leaflet Geoman
- Data querying with TanStack React Query
- Client-side routing with React Router
- Type-safe development with TypeScript

**Key Dependencies:**
- leaflet@^1.9.4 - Open-source mapping library
- @geoman-io/leaflet-geoman-free@^2.19.2 - Map drawing tools
- react-router-dom@^7.9.1 - Client routing
- lucide-react@^0.542.0 - Icon library
- clsx@^2.1.1 - Utility for className management

## Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- npm or yarn

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend API at `http://localhost:8000`.

## Available Scripts

### Frontend
- `npm run dev` - Start development server with Vite
- `npm run build` - Build for production with TypeScript checking
- `npm run lint` - Run ESLint on the codebase
- `npm run preview` - Preview production build

### Backend
- `python manage.py runserver` - Start development server
- `python manage.py migrate` - Apply database migrations
- `python manage.py createsuperuser` - Create admin user

## Technology Stack

### Backend
- **Server:** Django 6.0.3
- **API:** Django REST Framework
- **Database:** SQLite (default), configurable
- **Authentication:** JWT tokens
- **Documentation:** Swagger/OpenAPI via drf-yasg
- **Data Processing:** Pandas, NumPy
- **AI Integration:** Groq API

### Frontend
- **UI Framework:** React 19.2.4
- **Language:** TypeScript 5.9.3
- **Styling:** Tailwind CSS with PostCSS
- **Mapping:** Leaflet.js with React bindings
- **State Management:** TanStack Query (React Query)
- **Routing:** React Router v7
- **Linting:** ESLint with TypeScript support
- **Build:** Vite 8.0.1

## Configuration

### Environment Variables
Create a `.env` file in the frontend directory (see `.env.example` for reference):
```
VITE_API_URL=http://localhost:8000
```

### Backend Configuration
Configure Django settings in `backend/` directory:
- Database settings
- Allowed hosts
- CORS origins
- API documentation

## Data Formats

### Geospatial Data
- GeoJSON format support via Leaflet
- OpenStreetMap (OSM) data integration
- Custom map data in `backend/map_data/`

### Document Processing
- RTF (Rich Text Format) support
- DOCX (Microsoft Word) support
- Excel file support (XLSX)

## Contributing
We welcome contributions! Please ensure:
- Code follows PEP 8 style guide
- Frontend code passes ESLint checks
- Backend code is properly tested
- Documentation is updated accordingly

## Support
For issues and questions, please open an issue on the GitHub repository.
