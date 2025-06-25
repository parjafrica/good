# Granada OS Admin System

## Complete Admin Architecture

This is a standalone admin system with its own FastAPI backend and HTML frontend, completely separate from the main application.

### Structure
```
admin/
├── backend/
│   └── main.py          # FastAPI admin server
└── frontend/
    └── templates/       # HTML templates
        ├── base.html    # Base template with navigation
        ├── dashboard.html
        ├── users.html
        ├── opportunities.html
        ├── bots.html
        └── system.html
```

### Features
- **Dashboard**: Real-time statistics and quick actions
- **User Management**: View, search, activate/deactivate users
- **Opportunities**: Manage and verify funding opportunities
- **Bot Management**: Control and monitor scraping bots
- **System Logs**: View and monitor system activity

### Access
- **URL**: http://localhost:9000/admin
- **Port**: 9000 (separate from main app)
- **API Docs**: http://localhost:9000/docs

### Starting the Admin System
```bash
cd admin/backend
python3 -m uvicorn main:app --host 0.0.0.0 --port 9000 --reload
```

### API Endpoints
- `GET /admin` - Dashboard page
- `GET /admin/users` - Users management page
- `GET /admin/opportunities` - Opportunities page
- `GET /admin/bots` - Bots management page
- `GET /admin/system` - System logs page
- `GET /api/admin/dashboard` - Dashboard data
- `GET /api/admin/users` - Users data with pagination
- `GET /api/admin/opportunities` - Opportunities data
- `GET /api/admin/bots` - Bot status and stats
- `POST /api/admin/users/{id}/toggle-status` - Toggle user status
- `POST /api/admin/opportunities/{id}/verify` - Verify opportunity
- `POST /api/admin/bots/{id}/run` - Run specific bot

### Database Integration
All admin functions connect directly to PostgreSQL using the DATABASE_URL environment variable with proper error handling and connection pooling.

The admin system is completely independent and can operate without the main application running.