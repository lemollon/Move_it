# Move-it Repository - Setup Guide

## 🎉 What You Have

**Complete Production-Ready Structure:**
- ✅ Database schema (13 tables, all relationships)
- ✅ Backend server with authentication
- ✅ Frontend React app with routing
- ✅ Comprehensive documentation
- ✅ Seller's Disclosure design document
- ✅ Environment configuration
- ✅ All dependencies defined

**What's Implemented:**
- User registration & login (with JWT)
- Database models (User model complete)
- API routing structure
- Auth middleware & protection
- Error handling
- Logging system
- Frontend auth context
- Tailwind CSS setup

**What Needs Building:**
- All other models (Property, Disclosure, Vendor, etc.)
- Business logic controllers
- Frontend components (pages, forms, etc.)
- External API integrations
- Seller's Disclosure module (13 sections)

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
```bash
# Check you have these installed:
node --version    # Should be v18 or higher
npm --version     # Should be v9 or higher
psql --version    # PostgreSQL 14+
```

### 1. Extract the Repository
```bash
tar -xzf move-it-repo.tar.gz
cd move-it-repo
```

### 2. Database Setup
```bash
# Create database
createdb moveit_dev

# Run schema
psql moveit_dev < database/schema.sql

# Verify tables created
psql moveit_dev -c "\dt"
# You should see 18 tables
```

### 3. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env - MINIMUM required:
nano .env
# Set:
# JWT_SECRET=your_random_secret_key_here
# DB_PASSWORD=your_postgres_password
# Save and exit

# Create logs directory
mkdir -p logs

# Start server
npm run dev

# You should see:
# ✅ Database connection established successfully
# Move-it API server running on port 5000
```

### 4. Frontend Setup (New Terminal)
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# You should see:
# ➜  Local:   http://localhost:3000/
```

### 5. Test It
```bash
# Visit http://localhost:3000
# You should see the app (though many components are placeholders)

# Test API:
curl http://localhost:5000/health
# Should return: {"status":"ok",...}

# Test registration:
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123","role":"buyer","first_name":"Test","last_name":"User"}'

# Should return JWT token and user object
```

---

## 📁 File Structure Explanation

```
move-it-repo/
│
├── frontend/                     # React Application
│   ├── src/
│   │   ├── App.jsx              ✅ Main app with routing
│   │   ├── main.jsx             ✅ React entry point
│   │   ├── context/
│   │   │   └── AuthContext.jsx  ✅ Authentication state
│   │   ├── components/          🔨 Build components here
│   │   ├── pages/               🔨 Build pages here
│   │   ├── utils/               🔨 API client, helpers
│   │   └── styles/
│   │       └── globals.css      ✅ Tailwind setup
│   ├── package.json             ✅ Dependencies
│   └── vite.config.js           ✅ Vite configuration
│
├── backend/                      # Express API Server
│   ├── server.js                ✅ Main server file
│   ├── config/
│   │   └── database.js          ✅ Sequelize connection
│   ├── models/
│   │   └── User.js              ✅ User model (complete)
│   ├── controllers/
│   │   └── authController.js    ✅ Auth logic (complete)
│   ├── routes/
│   │   ├── auth.js              ✅ Auth routes (complete)
│   │   └── *.js                 🔨 Other routes (placeholders)
│   ├── middleware/
│   │   ├── auth.js              ✅ JWT protection
│   │   └── errorHandler.js      ✅ Error handling
│   ├── utils/
│   │   └── logger.js            ✅ Winston logger
│   └── package.json             ✅ Dependencies
│
├── database/
│   └── schema.sql               ✅ Complete schema (18 tables)
│
└── docs/
    ├── SELLER_DISCLOSURE.md     ✅ Disclosure implementation guide
    └── IMPLEMENTATION_GUIDE.md  ✅ Development roadmap
```

---

## 🛠️ Development Workflow

### Creating a New Feature

Let's say you want to build the "Create Property Listing" feature:

**1. Backend - Create Model**
```javascript
// backend/models/Property.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Property = sequelize.define('Property', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  // ... other fields from schema.sql
});

export default Property;
```

**2. Backend - Create Controller**
```javascript
// backend/controllers/propertyController.js
import { asyncHandler } from '../middleware/errorHandler.js';
import Property from '../models/Property.js';

export const createProperty = asyncHandler(async (req, res) => {
  const property = await Property.create({
    seller_id: req.user.id,
    ...req.body,
  });
  
  res.status(201).json({ success: true, property });
});

export const getProperties = asyncHandler(async (req, res) => {
  const properties = await Property.findAll();
  res.json({ success: true, properties });
});
```

**3. Backend - Update Routes**
```javascript
// backend/routes/properties.js
import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { createProperty, getProperties } from '../controllers/propertyController.js';

const router = express.Router();

router.get('/', getProperties);
router.post('/', protect, authorize('seller'), createProperty);

export default router;
```

**4. Frontend - Create Component**
```jsx
// frontend/src/components/seller/CreateListing.jsx
import { useState } from 'react';
import axios from 'axios';

export default function CreateListing() {
  const [formData, setFormData] = useState({
    address_line1: '',
    city: '',
    zip_code: '',
    list_price: '',
    bedrooms: '',
    bathrooms: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/properties', formData);
      console.log('Property created:', response.data);
      // Redirect or show success
    } catch (error) {
      console.error('Error creating property:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2 className="section-title">Create Listing</h2>
      {/* Form fields */}
    </form>
  );
}
```

---

## 📋 Next Steps - Development Phases

### Phase 1: Core Functionality (This Week)
- [ ] Build basic HomePage component
- [ ] Build Login/Register pages
- [ ] Create Property model & basic listing
- [ ] Test full auth flow (register → login → create listing)

### Phase 2: Seller's Disclosure (Next Week) 📋 **PRIORITY**
- [ ] Read `docs/SELLER_DISCLOSURE.md` thoroughly
- [ ] Create `SellerDisclosure` model
- [ ] Build all 13 section components
- [ ] Implement auto-save functionality
- [ ] Add validation logic
- [ ] Test disclosure flow end-to-end

### Phase 3: Vendor System (Week 3)
- [ ] Create Vendor model
- [ ] Build vendor onboarding (free tier)
- [ ] Implement vendor lead system
- [ ] Add payment setup

### Phase 4: Transactions (Week 4)
- [ ] Build offer system
- [ ] Create transaction management
- [ ] Add AI contract info collector

---

## 🧪 Testing Checklist

Before moving to next phase:
- [ ] Server starts without errors
- [ ] Database connection works
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] JWT token is saved and used
- [ ] Protected routes work
- [ ] Frontend connects to backend
- [ ] No console errors

---

## ⚠️ Common Issues & Solutions

### Issue: "Database connection failed"
```bash
# Check PostgreSQL is running
pg_isready

# Check credentials in .env
cat backend/.env | grep DB_

# Try connecting manually
psql -U your_username -d moveit_dev
```

### Issue: "Port 5000 already in use"
```bash
# Find what's using port 5000
lsof -i :5000

# Kill the process or change PORT in .env
```

### Issue: "Module not found"
```bash
# Make sure you installed dependencies
cd backend && npm install
cd ../frontend && npm install
```

### Issue: "JWT_SECRET not defined"
```bash
# Make sure you copied .env.example
cd backend
cp .env.example .env

# Generate a secure secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add it to .env
echo "JWT_SECRET=<generated_secret>" >> .env
```

---

## 📚 Key Documentation Files

1. **IMPLEMENTATION_GUIDE.md** - Complete development roadmap
2. **SELLER_DISCLOSURE.md** - Disclosure module design (critical!)
3. **schema.sql** - Database structure with comments
4. **.env.example** - All environment variables explained

---

## 💡 Pro Tips

1. **Always check the logs:**
   ```bash
   tail -f backend/logs/combined.log
   ```

2. **Use the API health check:**
   ```bash
   curl http://localhost:5000/health
   ```

3. **Test auth endpoints:**
   ```bash
   # Register
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","password":"test123","role":"buyer"}'
   
   # Login
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","password":"test123"}'
   ```

4. **Check database state:**
   ```bash
   psql moveit_dev -c "SELECT * FROM users;"
   ```

---

## 🎯 Focus on Seller's Disclosure First

**This is the most complex feature.** Read `docs/SELLER_DISCLOSURE.md` before building it.

It has:
- 13 sections
- 100+ questions
- Auto-detection logic
- PDF generation
- Digital signatures
- Legal compliance requirements

**Start simple:** Build Section 1 (Property Items) first, test it thoroughly, then build the rest.

---

## 🚀 Ready to Build!

You now have a production-ready foundation. Follow the Implementation Guide in `docs/IMPLEMENTATION_GUIDE.md` for the complete development roadmap.

**Your first goal:** Get auth working end-to-end (register → login → access protected route).

**Questions? Check:**
1. Implementation Guide
2. Seller Disclosure Doc
3. Database schema comments
4. This setup guide

---

Good luck building Move-it! 🏠✨
