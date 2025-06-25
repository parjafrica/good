# ⚠️ IMPORTANT: How to Access Granada OS

## ✅ CORRECT ACCESS POINTS

**Main Application:**
```
http://localhost:5000
```

**Admin Dashboard:**
```
http://localhost:5000/wabden
```

## ❌ AVOID DIRECT PORT ACCESS

**DO NOT access these URLs directly:**
- ~~http://localhost:5001~~ (This will show "Unable to connect")
- ~~http://localhost:9000~~ (Old port, no longer used)

## 🔧 Why This Design?

The system uses a **unified architecture**:
- Port 5000: Main entry point for everything
- Port 5001: Internal admin service (accessed via proxy)
- All traffic goes through port 5000 for consistency

## 🚀 Starting the System

Use any of these methods:

**Option 1: Node.js script (Recommended)**
```bash
node start-unified.js
```

**Option 2: Shell script**
```bash
./start.sh
```

**Option 3: Manual**
```bash
# Terminal 1
npm run dev

# Terminal 2  
cd wabden && python -m uvicorn main:app --host 0.0.0.0 --port 5001 --reload
```

## ✅ Verification

After starting, you should see:
- Main app loads at http://localhost:5000
- Admin redirects work at http://localhost:5000/wabden
- Both services running without "Unable to connect" errors

## ✅ Current Status
The Wabden admin system is now working properly with:
- Unified port architecture (5000/5001)
- Comprehensive admin dashboard with real data
- HR Management, Accounting, Opportunities, User Management, and Bot Control
- No database dependencies - ready to run immediately