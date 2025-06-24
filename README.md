# Granada: Operating System for Impact

A comprehensive, AI-powered platform designed to empower NGOs, social enterprises, and mission-driven startups to streamline their entire operational lifecycle.

## 🚀 Quick Start

### Frontend (React Dashboard)
```bash
npm install
npm run dev
```
The frontend will be available at `http://localhost:5173`

### Backend (FastAPI)
```bash
# Install Python dependencies
pip install -r requirements.txt

# Start the backend server
python run_backend.py
```
The API will be available at `http://localhost:8000`
API Documentation: `http://localhost:8000/docs`

### Full Stack with Docker
```bash
# Start all services (PostgreSQL, Redis, Backend, Celery)
docker-compose up -d

# View logs
docker-compose logs -f backend
```

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons
- **Vite** for development and building

### Backend Stack
- **FastAPI** (Python) - High-performance async API
- **PostgreSQL** with pgVector for AI embeddings
- **Redis** for caching and task queues
- **Celery** for background tasks
- **SQLAlchemy** for database ORM
- **OpenAI API** for AI capabilities

## 📊 Key Features

### 🎯 Granada Pulse Dashboard
- Real-time organizational metrics
- AI-powered insights and recommendations
- Interactive data visualizations
- Contextual notifications

### 📝 Proposal Management
- AI-assisted proposal writing
- Version control and collaboration
- Automated compliance checking
- Performance analytics

### 🔍 Intelligent Donor Matching
- Semantic matching with funding opportunities
- AI-powered opportunity scoring
- Donor relationship management
- Trend analysis and forecasting

### 🤖 AI Assistant
- Natural language chat interface
- Context-aware recommendations
- Automated content generation
- Predictive analytics

### 📈 Project Execution & M&E
- Integrated project management
- Real-time monitoring & evaluation
- Collaborative workspaces
- Impact reporting

## 🔧 Development

### Environment Setup
1. Copy `.env.example` to `.env` and configure your settings
2. Set up PostgreSQL and Redis (or use Docker)
3. Install dependencies for both frontend and backend
4. Run database migrations
5. Start both frontend and backend servers

### Database Setup
```bash
# Using Docker (recommended)
docker-compose up -d db redis

# Or install PostgreSQL locally and create database
createdb granada_db
```

### API Endpoints
- `GET /api/health` - Health check
- `POST /api/auth/login` - User authentication
- `GET /api/dashboard/pulse` - Dashboard metrics
- `GET /api/proposals/` - List proposals
- `GET /api/donors/calls/matched` - Matched funding opportunities
- `POST /api/ai/chat` - Chat with AI assistant

## 🎨 Design System

Granada uses a custom design system built on Tailwind CSS:
- **Primary Colors**: Blue gradient (#0ea5e9 to #0284c7)
- **Accent Colors**: Orange gradient (#f97316 to #ea580c)
- **Typography**: Inter font family
- **Components**: Custom card system with hover effects
- **Animations**: Smooth transitions using Framer Motion

## 🔐 Security

- JWT-based authentication
- Role-based access control (RBAC)
- Input validation and sanitization
- CORS protection
- Environment-based configuration

## 📱 Responsive Design

Granada is fully responsive and optimized for:
- Desktop (1920px+)
- Laptop (1024px+)
- Tablet (768px+)
- Mobile (320px+)

## 🚀 Deployment

### Production Deployment
```bash
# Build frontend
npm run build

# Deploy with Docker
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables
Key environment variables to configure:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `OPENAI_API_KEY` - OpenAI API key for AI features
- `SECRET_KEY` - JWT signing secret

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the API documentation at `/docs`
- Review the codebase documentation
- Open an issue on GitHub

---

**Granada: Transforming how impact-driven organizations operate, one intelligent workflow at a time.**