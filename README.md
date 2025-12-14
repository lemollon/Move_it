# Move-it Platform

**Your Virtual Realtor - 2% Fee, 30-Day Close**

Move-it is a comprehensive real estate marketplace platform connecting buyers, sellers, and service providers in Texas. Save thousands with our 2% transaction fee (vs traditional 6%) and close deals in 30 days.

## 🎯 Platform Overview

- **For Sellers (FSBO):** List properties with AI assistance, manage offers, track transactions
- **For Buyers:** Search homes, submit offers, connect with vendors
- **For Investors/Wholesalers:** Flip properties, wholesale deals efficiently
- **For Vendors:** FREE profile, receive transaction leads, get paid directly

## 🏗️ Architecture

```
Frontend: React + Vite + Tailwind CSS
Backend: Node.js + Express + PostgreSQL
APIs: Claude (AI), Stripe (payments), Attom Data (property info)
```

## 📁 Repository Structure

```
move-it-repo/
├── frontend/          # React application
├── backend/           # Node.js API server
├── database/          # Schema, migrations, seeds
├── docs/              # Documentation
└── scripts/           # Deployment & setup scripts
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/move-it.git
cd move-it

# Install dependencies
cd frontend && npm install
cd ../backend && npm install

# Set up environment variables
cp backend/.env.example backend/.env
# Edit .env with your configuration

# Run database migrations
cd backend && npm run migrate

# Start development servers
npm run dev:all
```

## 🔑 Key Features

### Hybrid Vendor Model
- **FREE:** Basic profile, receive leads, direct payments
- **Standard ($149/mo):** Priority placement, analytics, featured badge
- **Premium ($299/mo):** Top placement, advanced features, API access

### AI-Powered Tools
- Listing creation with auto-populated property data
- Contract information collection for attorneys
- Pricing suggestions based on market comps
- Predictive transaction intelligence

### Direct Payments
- Consumers pay vendors directly (no escrow)
- Multiple payment methods (ACH, Wire, Zelle)
- Transparent fee structure

### Legal Compliance
- Licensed attorneys prepare all contracts
- Comprehensive seller disclosures (13 sections)
- Clear marketplace disclaimers
- Texas-specific legal requirements

## 📖 Documentation

- [API Documentation](docs/API.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [Seller Disclosure Guide](docs/SELLER_DISCLOSURE.md)
- [Legal Compliance](docs/LEGAL_COMPLIANCE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## 🧪 Testing

```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && npm test

# E2E tests
npm run test:e2e
```

## 🚢 Deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for production deployment instructions.

## 📄 License

Proprietary - All Rights Reserved

## 🤝 Contributing

This is a private repository. Contact the team for contribution guidelines.

## 📞 Support

For questions or support, contact: support@moveit.com

---

**Move-it** - Disrupting real estate, one transaction at a time.
