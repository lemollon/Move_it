# Move-it Implementation Guide

## 🎯 Current Status: Repository Initialized

**What You Have:**
✅ Complete file structure  
✅ Database schema (all tables defined)  
✅ Package.json files (frontend & backend dependencies)  
✅ Server configuration  
✅ Comprehensive documentation  
✅ Seller's Disclosure design document  

**What You Need to Build:**
🔨 All component files  
🔨 All API route handlers  
🔨 Database models (Sequelize)  
🔨 Authentication system  
🔨 API integrations  

---

## 📁 Repository Overview

```
move-it-repo/
├── README.md                          ✅ Complete
├── .gitignore                         ✅ Complete
│
├── frontend/                          
│   ├── package.json                   ✅ Complete
│   ├── vite.config.js                 ✅ Complete
│   ├── tailwind.config.js             ✅ Complete
│   ├── index.html                     🔨 Need to create
│   ├── postcss.config.js              🔨 Need to create
│   │
│   └── src/
│       ├── main.jsx                   🔨 React entry point
│       ├── App.jsx                    🔨 Main app component
│       │
│       ├── components/                🔨 All components
│       │   ├── shared/
│       │   ├── buyer/
│       │   ├── seller/
│       │   │   └── SellerDisclosure/  📋 Priority: Critical
│       │   ├── vendor/
│       │   ├── transaction/
│       │   └── communication/
│       │
│       ├── pages/                     🔨 Page components
│       ├── utils/                     🔨 Utilities
│       ├── hooks/                     🔨 Custom React hooks
│       ├── context/                   🔨 Context providers
│       └── styles/                    🔨 Global styles
│
├── backend/                           
│   ├── package.json                   ✅ Complete
│   ├── server.js                      ✅ Complete
│   ├── .env.example                   ✅ Complete
│   │
│   ├── config/                        🔨 Config files
│   │   └── database.js
│   │
│   ├── models/                        🔨 Sequelize models
│   │   ├── User.js
│   │   ├── Property.js
│   │   ├── SellerDisclosure.js        📋 Priority: Critical
│   │   ├── Offer.js
│   │   ├── Transaction.js
│   │   ├── Vendor.js
│   │   └── Document.js
│   │
│   ├── controllers/                   🔨 Business logic
│   │   ├── authController.js
│   │   ├── propertyController.js
│   │   ├── disclosureController.js    📋 Priority: Critical
│   │   ├── vendorController.js
│   │   └── transactionController.js
│   │
│   ├── routes/                        🔨 API routes
│   │   ├── auth.js
│   │   ├── properties.js
│   │   ├── disclosures.js             📋 Priority: Critical
│   │   ├── vendors.js
│   │   └── transactions.js
│   │
│   ├── middleware/                    🔨 Middleware
│   │   ├── auth.js
│   │   ├── validation.js
│   │   └── errorHandler.js
│   │
│   ├── services/                      🔨 External services
│   │   ├── claudeAPI.js
│   │   ├── stripeService.js
│   │   ├── emailService.js
│   │   ├── pdfGenerator.js
│   │   └── attomDataAPI.js
│   │
│   └── utils/                         🔨 Utilities
│       ├── logger.js
│       └── validators.js
│
├── database/
│   ├── schema.sql                     ✅ Complete
│   ├── migrations/                    🔨 Migration files
│   └── seeds/                         🔨 Seed data
│
└── docs/
    ├── SELLER_DISCLOSURE.md           ✅ Complete
    ├── API.md                         🔨 Need to create
    ├── DATABASE_SCHEMA.md             🔨 Need to create
    ├── LEGAL_COMPLIANCE.md            🔨 Need to create
    └── DEPLOYMENT.md                  🔨 Need to create
```

---

## 🚀 Development Roadmap

### Phase 1: Foundation (Week 1-2)

#### Priority 1: Get Basic App Running
1. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   # Create missing files:
   # - index.html
   # - src/main.jsx
   # - src/App.jsx
   # - src/styles/globals.css
   npm run dev
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your database credentials
   
   # Create database
   createdb moveit_dev
   
   # Run schema
   psql moveit_dev < ../database/schema.sql
   
   npm run dev
   ```

3. **Files to Create First:**
   - `frontend/index.html` - Entry HTML
   - `frontend/src/main.jsx` - React entry
   - `frontend/src/App.jsx` - Main component with routing
   - `frontend/src/styles/globals.css` - Tailwind imports
   - `backend/config/database.js` - Sequelize connection
   - `backend/utils/logger.js` - Winston logger
   - `backend/middleware/errorHandler.js` - Error handling

#### Priority 2: Authentication
4. **User Registration & Login**
   - Backend:
     - `models/User.js` - User model
     - `controllers/authController.js` - Register, login, logout
     - `routes/auth.js` - Auth endpoints
     - `middleware/auth.js` - JWT verification
   
   - Frontend:
     - `context/AuthContext.jsx` - Auth state management
     - `components/auth/Login.jsx`
     - `components/auth/Register.jsx`
     - `hooks/useAuth.js` - Auth hook

5. **Protected Routes**
   - Frontend: Implement route guards
   - Backend: Add auth middleware to protected endpoints

### Phase 2: Core Features (Week 3-4)

#### Priority 3: Property Listings
6. **Seller Creates Listing**
   - Backend:
     - `models/Property.js`
     - `controllers/propertyController.js`
     - `routes/properties.js`
   
   - Frontend:
     - `components/seller/CreateListing.jsx` (4-step wizard)
     - `components/seller/MyListings.jsx`
     - `utils/api.js` - API client

7. **Buyer Views Listings**
   - Frontend:
     - `components/buyer/BuyerSearch.jsx`
     - `components/buyer/PropertyDetailPage.jsx`
     - Auto-populated data components

#### Priority 4: Seller's Disclosure 📋 **CRITICAL**
8. **Seller Disclosure Module**
   - Backend:
     - `models/SellerDisclosure.js` - Model matching schema
     - `controllers/disclosureController.js` - CRUD + PDF generation
     - `routes/disclosures.js` - API endpoints
     - `services/pdfGenerator.js` - Generate TXR-1406 PDF
   
   - Frontend:
     - Create ALL 13 section components (see SELLER_DISCLOSURE.md)
     - `components/seller/SellerDisclosure/index.jsx` - Main wizard
     - `components/seller/SellerDisclosure/Section1PropertyItems.jsx`
     - ... (all 13 sections)
     - `utils/disclosureValidation.js` - Validation logic
     - `utils/autoDetection.js` - Auto-detect required forms

9. **Disclosure Features**
   - Auto-save every 30 seconds
   - Progress tracking
   - Auto-detection (lead paint if pre-1978, etc.)
   - Digital signature capture
   - PDF generation
   - Buyer signature flow

### Phase 3: Transactions (Week 5-6)

#### Priority 5: Offers & Contracts
10. **Offer System**
    - Backend:
      - `models/Offer.js`
      - `controllers/offerController.js`
    - Frontend:
      - `components/buyer/MakeOffer.jsx`
      - `components/seller/SellerOffers.jsx`

11. **AI Contract Info Collector**
    - Backend:
      - `models/ContractInfo.js`
      - `services/claudeAPI.js` - AI integration
    - Frontend:
      - `components/transaction/AIContractInfoCollector.jsx` (6 steps)

#### Priority 6: Transaction Management
12. **Transaction Flow**
    - Backend:
      - `models/Transaction.js`
      - `controllers/transactionController.js`
    - Frontend:
      - `components/transaction/TransactionCenter.jsx`
      - `components/transaction/TransactionTimeline.jsx`
      - `components/transaction/DocumentCenter.jsx`

### Phase 4: Vendor System (Week 7-8)

#### Priority 7: Vendor Management
13. **Vendor Onboarding - FREE Tier**
    - Backend:
      - `models/Vendor.js`
      - `controllers/vendorController.js`
      - `routes/vendors.js`
    - Frontend:
      - `components/vendor/VendorFreeSignup.jsx`
      - `components/vendor/VendorDashboard.jsx`

14. **Vendor Leads & Payments**
    - Backend:
      - `models/TransactionVendor.js` (junction table)
    - Frontend:
      - `components/vendor/VendorLeads.jsx`
      - `components/vendor/VendorLeadDetail.jsx`
      - `components/vendor/VendorPaymentSetup.jsx`

15. **Vendor Upgrades (Hybrid Model)**
    - Backend:
      - `services/stripeService.js` - Subscription billing
    - Frontend:
      - `components/vendor/VendorUpgrade.jsx`

### Phase 5: External Integrations (Week 9-10)

#### Priority 8: Property Data APIs
16. **Auto-Populated Data**
    - Backend:
      - `services/attomDataAPI.js` - Property taxes, comps, history
      - `services/greatSchoolsAPI.js` - School ratings
      - `services/femaAPI.js` - Flood zones
      - Add cron jobs to refresh data

17. **File Storage**
    - Backend:
      - `services/s3Service.js` - AWS S3 uploads
      - `models/Document.js`

18. **Payment Processing**
    - Backend:
      - `services/stripeService.js` - 2% fee + vendor subscriptions
      - Webhook handlers

### Phase 6: Communication (Week 11)

#### Priority 9: Messaging
19. **Multi-Party Messaging**
    - Backend:
      - `models/Message.js`
      - `controllers/messageController.js`
      - WebSocket setup (Socket.io)
    - Frontend:
      - `components/communication/CommunicationHub.jsx`
      - `components/communication/MessageThread.jsx`

20. **Notifications**
    - Backend:
      - `models/Notification.js`
      - `services/emailService.js` - SendGrid
      - `services/smsService.js` - Twilio
    - Frontend:
      - `components/shared/NotificationBell.jsx`

### Phase 7: Polish & Testing (Week 12)

#### Priority 10: Production Readiness
21. **Testing**
    - Write unit tests for critical paths
    - Integration tests for API endpoints
    - E2E tests for key user flows

22. **Security Audit**
    - Input validation
    - SQL injection prevention
    - XSS protection
    - CSRF tokens
    - Rate limiting tuned

23. **Performance**
    - Database indexing optimized
    - API response caching
    - Image optimization
    - Code splitting

24. **Documentation**
    - API documentation (Swagger/OpenAPI)
    - User guides
    - Admin manual

---

## 🔑 Critical Files to Build First

### Week 1 Priority List:

1. **Frontend Entry Point**
   ```jsx
   // frontend/index.html
   // frontend/src/main.jsx
   // frontend/src/App.jsx with React Router
   ```

2. **Backend Database Connection**
   ```javascript
   // backend/config/database.js - Sequelize setup
   // backend/utils/logger.js - Winston
   // backend/middleware/errorHandler.js
   ```

3. **Authentication**
   ```javascript
   // backend/models/User.js
   // backend/controllers/authController.js
   // backend/routes/auth.js
   // backend/middleware/auth.js
   ```

4. **First Frontend Components**
   ```jsx
   // frontend/src/components/shared/Header.jsx
   // frontend/src/components/shared/Footer.jsx
   // frontend/src/components/auth/Login.jsx
   // frontend/src/components/auth/Register.jsx
   // frontend/src/pages/HomePage.jsx
   ```

---

## 🧪 Testing Strategy

### Unit Tests
- All controllers
- Validation functions
- Utility functions

### Integration Tests
- API endpoints
- Database operations
- Authentication flow

### E2E Tests (Playwright or Cypress)
- Complete seller flow (listing → disclosure → offer → transaction)
- Complete buyer flow (search → offer → transaction)
- Complete vendor flow (signup → lead → accept)

---

## 📊 Database Migration Strategy

**DO NOT use Sequelize auto-sync in production!**

### Migration Flow:
1. Use `schema.sql` for initial database creation
2. Create migration files for any schema changes
3. Version control all migrations
4. Run migrations in order in all environments

```bash
# Initial setup
psql moveit_dev < database/schema.sql

# Future changes
npm run migrate
```

---

## 🚨 Legal Compliance Checklist

Before launch, ensure:

- [ ] Disclaimer modal on first load (✅ in prototype)
- [ ] "Marketplace" language on every page footer
- [ ] Attorney review of all disclosure templates
- [ ] E&O insurance in place
- [ ] Terms of Service drafted by attorney
- [ ] Privacy Policy CCPA/GDPR compliant
- [ ] Broker partnership agreement signed (for MLS access)
- [ ] All contracts prepared by licensed attorneys
- [ ] No AI-generated legal documents

---

## 🔐 Security Checklist

- [ ] All passwords hashed with bcrypt
- [ ] JWT tokens with expiration
- [ ] HTTPS everywhere in production
- [ ] SQL injection prevention (use parameterized queries)
- [ ] XSS protection (helmet.js configured)
- [ ] CSRF tokens for sensitive operations
- [ ] Rate limiting on all endpoints
- [ ] File upload validation (type, size)
- [ ] S3 bucket access control
- [ ] Database backups automated
- [ ] Environment variables never committed
- [ ] API keys rotated regularly

---

## 📱 Mobile Responsiveness

All components must be responsive:
- Breakpoints: 320px, 768px, 1024px, 1280px
- Touch-friendly buttons (min 44x44px)
- Optimized for iOS and Android
- Consider React Native for native apps later

---

## 💰 Revenue Implementation

### 2% Transaction Fee:
- Charged to seller at closing
- Collected via Stripe
- Held in escrow until transaction complete

### Vendor Subscriptions:
- Free tier: No charge
- Standard ($149/mo): Stripe subscription
- Premium ($299/mo): Stripe subscription
- Handle via Stripe Billing Portal

---

## 🎨 Design System

Use Tailwind classes consistently:
- Primary blue: `blue-600`, `blue-700`
- Success green: `green-600`
- Warning yellow: `yellow-600`
- Error red: `red-600`
- Gray scale: `gray-50` to `gray-900`

---

## 🤖 AI Integration Points

### Claude API Usage:
1. **Listing Descriptions**
   - Generate from photos + basic details
   - Tone: Professional, warm, honest

2. **Contract Info Collection**
   - Conversational interface
   - Extract structured data
   - Validate completeness

3. **Pricing Suggestions** (Future)
   - Analyze comps
   - Suggest list price

4. **PTIS (Predictive Transaction Intelligence)** (Future)
   - Predict delays
   - Auto-intervene
   - Patent-ready system

---

## 📈 Success Metrics to Track

### Platform Metrics:
- Active listings
- Transactions completed
- Average close time
- User satisfaction (NPS)

### Financial Metrics:
- Transaction fee revenue
- Vendor subscription revenue
- Monthly Recurring Revenue (MRR)
- Customer Acquisition Cost (CAC)

### Performance Metrics:
- Page load times
- API response times
- Error rates
- Uptime percentage

---

## 🎯 Next Immediate Action

**Run this command to get started:**

```bash
# 1. Install dependencies
cd frontend && npm install
cd ../backend && npm install

# 2. Set up database
createdb moveit_dev
psql moveit_dev < ../database/schema.sql

# 3. Configure environment
cd backend
cp .env.example .env
# Edit .env with your values

# 4. Start development
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm run dev
```

**Then build these files in order:**
1. Logger & error handler
2. Database connection
3. User model & auth
4. Basic frontend (login, register)
5. Property listing basics
6. **Seller's Disclosure module** (this is the complex one!)

---

## 📞 Need Help?

**Priority order for getting help:**
1. Check documentation in `/docs`
2. Review database schema comments
3. Read SELLER_DISCLOSURE.md for disclosure specifics
4. Reference prototype code from previous sessions

---

**You're ready to build! Start with Phase 1, Week 1 priorities. 🚀**
