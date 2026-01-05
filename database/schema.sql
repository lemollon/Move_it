-- Move-it Platform Database Schema
-- PostgreSQL 14+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS & AUTHENTICATION
-- =====================================================

CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'vendor', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    status user_status DEFAULT 'active',
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- =====================================================
-- PROPERTIES
-- =====================================================

CREATE TYPE property_status AS ENUM ('draft', 'active', 'under_contract', 'sold', 'withdrawn');

CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) DEFAULT 'TX',
    zip_code VARCHAR(10) NOT NULL,
    county VARCHAR(100),
    
    -- Property details
    property_type VARCHAR(50), -- single_family, condo, townhouse, etc
    bedrooms INTEGER,
    bathrooms DECIMAL(3,1),
    sqft INTEGER,
    lot_size INTEGER,
    year_built INTEGER,
    
    -- Pricing
    list_price DECIMAL(12,2) NOT NULL,
    ai_suggested_price DECIMAL(12,2),
    
    -- Status
    status property_status DEFAULT 'draft',
    listed_date DATE,
    sold_date DATE,
    sold_price DECIMAL(12,2),
    
    -- AI-generated content
    ai_description TEXT,
    
    -- Auto-populated data (from APIs)
    school_district JSONB, -- {elementary: {name, rating}, middle: {}, high: {}}
    property_taxes DECIMAL(10,2),
    mud_district VARCHAR(100),
    mud_annual_fee DECIMAL(10,2),
    flood_zone VARCHAR(20),
    flood_zone_data JSONB,
    
    -- MLS info (if applicable)
    mls_number VARCHAR(50),
    
    -- Metadata
    view_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_properties_seller ON properties(seller_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_zip ON properties(zip_code);

-- =====================================================
-- PROPERTY PHOTOS
-- =====================================================

CREATE TABLE property_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    s3_key VARCHAR(500),
    caption TEXT,
    display_order INTEGER,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_photos_property ON property_photos(property_id);

-- =====================================================
-- SELLER DISCLOSURE (13 Sections)
-- =====================================================

CREATE TABLE seller_disclosures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    
    -- Section 1: Property Items (stored as JSONB for flexibility)
    section1_items JSONB NOT NULL DEFAULT '{}',
    section1_defects TEXT,
    
    -- Section 2: Defects/Malfunctions
    section2_defects JSONB NOT NULL DEFAULT '{}',
    section2_explanation TEXT,
    
    -- Section 3: Conditions
    section3_conditions JSONB NOT NULL DEFAULT '{}',
    section3_explanation TEXT,
    
    -- Section 4: Repairs Needed
    section4_repairs_needed BOOLEAN DEFAULT FALSE,
    section4_explanation TEXT,
    
    -- Section 5: Flood Zones
    section5_flood_insurance BOOLEAN,
    section5_previous_flooding BOOLEAN,
    section5_floodplain_100yr BOOLEAN,
    section5_floodplain_500yr BOOLEAN,
    section5_floodway BOOLEAN,
    section5_flood_pool BOOLEAN,
    section5_reservoir BOOLEAN,
    section5_explanation TEXT,
    
    -- Section 6: Flood Claims
    section6_filed_flood_claim BOOLEAN,
    section6_explanation TEXT,
    
    -- Section 7: FEMA/SBA Assistance
    section7_received_assistance BOOLEAN,
    section7_explanation TEXT,
    
    -- Section 8: Additional Disclosures
    section8_disclosures JSONB NOT NULL DEFAULT '{}',
    section8_explanation TEXT,
    
    -- Section 9: Inspection Reports
    section9_has_reports BOOLEAN DEFAULT FALSE,
    section9_reports JSONB, -- [{date, type, inspector, pages}]
    
    -- Section 10: Tax Exemptions
    section10_exemptions JSONB, -- ['homestead', 'senior_citizen', etc]
    
    -- Section 11: Insurance Claims (non-flood)
    section11_filed_claim BOOLEAN,
    
    -- Section 12: Unrepairedbr Damage
    section12_unrep aired_damage BOOLEAN,
    section12_explanation TEXT,
    
    -- Section 13: Smoke Detectors
    section13_smoke_detectors VARCHAR(20), -- 'yes', 'no', 'unknown'
    section13_explanation TEXT,
    
    -- Metadata
    completed BOOLEAN DEFAULT FALSE,
    seller_signature TEXT, -- Digital signature data
    seller_signature_date TIMESTAMP,
    buyer_signature TEXT,
    buyer_signature_date TIMESTAMP,
    pdf_url VARCHAR(500), -- Generated PDF location
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_disclosure_property ON seller_disclosures(property_id);

-- =====================================================
-- FSBO CHECKLISTS
-- =====================================================

CREATE TYPE fsbo_status AS ENUM ('not_started', 'in_progress', 'completed');

CREATE TABLE fsbo_checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- Overall status
    status fsbo_status DEFAULT 'not_started',
    completion_percentage INTEGER DEFAULT 0,

    -- Category 1: Property Details
    property_details JSONB NOT NULL DEFAULT '{}',

    -- Category 2: HOA (If Applicable)
    hoa_info JSONB NOT NULL DEFAULT '{}',

    -- Category 3: Ownership & Legal
    ownership_legal JSONB NOT NULL DEFAULT '{}',

    -- Category 4: Pricing
    pricing JSONB NOT NULL DEFAULT '{}',

    -- Category 5: Property Condition
    property_condition JSONB NOT NULL DEFAULT '{}',

    -- Category 6: Photos & Marketing
    photos_marketing JSONB NOT NULL DEFAULT '{}',

    -- Category 7: Showings
    showings JSONB NOT NULL DEFAULT '{}',

    -- Category 8: Offers & Closing
    offers_closing JSONB NOT NULL DEFAULT '{}',

    -- Auto-save tracking
    last_auto_save TIMESTAMP,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fsbo_checklist_property ON fsbo_checklists(property_id);
CREATE INDEX idx_fsbo_checklist_seller ON fsbo_checklists(seller_id);

-- =====================================================
-- OFFERS
-- =====================================================

CREATE TYPE offer_status AS ENUM ('pending', 'accepted', 'rejected', 'countered', 'withdrawn');
CREATE TYPE financing_type AS ENUM ('cash', 'conventional', 'fha', 'va', 'usda', 'other');

CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Offer details
    offer_price DECIMAL(12,2) NOT NULL,
    earnest_money DECIMAL(12,2) NOT NULL,
    financing_type financing_type NOT NULL,
    down_payment DECIMAL(12,2),
    proposed_closing_date DATE NOT NULL,
    option_period_days INTEGER DEFAULT 10,
    
    -- Contingencies
    contingency_inspection BOOLEAN DEFAULT TRUE,
    contingency_appraisal BOOLEAN DEFAULT TRUE,
    contingency_financing BOOLEAN DEFAULT TRUE,
    contingency_other TEXT,
    
    -- Status
    status offer_status DEFAULT 'pending',
    
    -- Counter offer
    counter_price DECIMAL(12,2),
    counter_terms TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP
);

CREATE INDEX idx_offers_property ON offers(property_id);
CREATE INDEX idx_offers_buyer ON offers(buyer_id);
CREATE INDEX idx_offers_status ON offers(status);

-- =====================================================
-- TRANSACTIONS
-- =====================================================

CREATE TYPE transaction_status AS ENUM (
    'offer_accepted',
    'under_contract',
    'inspection_period',
    'appraisal_ordered',
    'title_search',
    'final_walkthrough',
    'closing',
    'closed',
    'cancelled'
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    accepted_offer_id UUID REFERENCES offers(id),
    
    -- Transaction details
    purchase_price DECIMAL(12,2) NOT NULL,
    earnest_money_amount DECIMAL(12,2) NOT NULL,
    closing_date DATE NOT NULL,
    
    -- Status
    status transaction_status DEFAULT 'offer_accepted',
    
    -- Move-it fee (2%)
    platform_fee DECIMAL(12,2) NOT NULL,
    platform_fee_paid BOOLEAN DEFAULT FALSE,
    
    -- Important dates
    option_period_end DATE,
    title_due_date DATE,
    appraisal_due_date DATE,
    inspection_due_date DATE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP
);

CREATE INDEX idx_transactions_property ON transactions(property_id);
CREATE INDEX idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX idx_transactions_seller ON transactions(seller_id);
CREATE INDEX idx_transactions_status ON transactions(status);

-- =====================================================
-- VENDORS
-- =====================================================

CREATE TYPE vendor_type AS ENUM ('title_company', 'home_inspector', 'attorney', 'appraiser');
CREATE TYPE vendor_tier AS ENUM ('free', 'standard', 'premium');

CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Business info
    business_name VARCHAR(255) NOT NULL,
    vendor_type vendor_type NOT NULL,
    license_number VARCHAR(100) NOT NULL,
    license_verified BOOLEAN DEFAULT FALSE,
    years_in_business INTEGER,
    
    -- Contact
    business_phone VARCHAR(20),
    business_email VARCHAR(255),
    business_address TEXT,
    website VARCHAR(255),
    
    -- Service areas (array of cities)
    service_areas TEXT[] DEFAULT '{}',
    service_radius INTEGER, -- miles
    
    -- Payment options
    payment_methods JSONB, -- {ach: {routing, account}, zelle: email, other: text}
    
    -- Subscription
    tier vendor_tier DEFAULT 'free',
    subscription_start DATE,
    subscription_end DATE,
    stripe_customer_id VARCHAR(100),
    stripe_subscription_id VARCHAR(100),
    
    -- Performance metrics
    avg_rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    total_transactions INTEGER DEFAULT 0,
    avg_response_time_hours DECIMAL(5,2),
    completion_rate DECIMAL(5,2),
    
    -- Profile
    bio TEXT,
    logo_url VARCHAR(500),
    
    -- Status
    active BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vendors_user ON vendors(user_id);
CREATE INDEX idx_vendors_type ON vendors(vendor_type);
CREATE INDEX idx_vendors_tier ON vendors(tier);
CREATE INDEX idx_vendors_active ON vendors(active);

-- =====================================================
-- TRANSACTION VENDORS (Junction Table)
-- =====================================================

CREATE TYPE vendor_selection_status AS ENUM ('invited', 'accepted', 'declined', 'completed');

CREATE TABLE transaction_vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    vendor_type vendor_type NOT NULL,
    
    -- Payment
    service_fee DECIMAL(10,2),
    payment_status VARCHAR(20) DEFAULT 'pending', -- pending, paid, refunded
    payment_method VARCHAR(50),
    paid_at TIMESTAMP,
    
    -- Status
    status vendor_selection_status DEFAULT 'invited',
    
    -- Metadata
    invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX idx_transaction_vendors_transaction ON transaction_vendors(transaction_id);
CREATE INDEX idx_transaction_vendors_vendor ON transaction_vendors(vendor_id);

-- =====================================================
-- DOCUMENTS
-- =====================================================

CREATE TYPE document_type AS ENUM (
    'purchase_agreement',
    'seller_disclosure',
    'inspection_report',
    'appraisal',
    'title_commitment',
    'closing_disclosure',
    'deed',
    'other'
);

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES users(id),
    
    -- Document info
    document_type document_type NOT NULL,
    filename VARCHAR(255) NOT NULL,
    s3_key VARCHAR(500) NOT NULL,
    url VARCHAR(500) NOT NULL,
    file_size INTEGER, -- bytes
    mime_type VARCHAR(100),
    
    -- E-signature
    requires_signature BOOLEAN DEFAULT FALSE,
    buyer_signed BOOLEAN DEFAULT FALSE,
    seller_signed BOOLEAN DEFAULT FALSE,
    buyer_signature_date TIMESTAMP,
    seller_signature_date TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_documents_transaction ON documents(transaction_id);
CREATE INDEX idx_documents_type ON documents(document_type);

-- =====================================================
-- CONTRACT INFO (AI-Collected Data)
-- =====================================================

CREATE TABLE contract_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    
    -- Step 1: Purchase Price & Terms
    purchase_price DECIMAL(12,2),
    earnest_money DECIMAL(12,2),
    closing_date DATE,
    
    -- Step 2: Financing
    financing_type financing_type,
    down_payment DECIMAL(12,2),
    loan_amount DECIMAL(12,2),
    
    -- Step 3: Option Period & Contingencies
    option_period_days INTEGER,
    contingency_inspection BOOLEAN,
    contingency_appraisal BOOLEAN,
    contingency_financing BOOLEAN,
    
    -- Step 4: Title Company
    title_company_selection VARCHAR(50), -- 'buyer', 'seller', 'mutual'
    selected_title_company_id UUID REFERENCES vendors(id),
    
    -- Step 5: Additional Terms
    additional_terms TEXT,
    repairs_requested TEXT,
    items_included TEXT,
    items_excluded TEXT,
    
    -- Status
    completed BOOLEAN DEFAULT FALSE,
    sent_to_attorney BOOLEAN DEFAULT FALSE,
    attorney_id UUID REFERENCES users(id),
    sent_to_attorney_at TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contract_info_transaction ON contract_info(transaction_id);

-- =====================================================
-- MESSAGES
-- =====================================================

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id),
    
    -- Message content
    message TEXT NOT NULL,
    attachments JSONB, -- [{filename, url, size}]
    
    -- Recipients (multi-party)
    recipients UUID[] NOT NULL, -- Array of user_ids
    
    -- Status
    read_by UUID[] DEFAULT '{}', -- Array of user_ids who have read
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_transaction ON messages(transaction_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);

-- =====================================================
-- REVIEWS
-- =====================================================

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES users(id), -- buyer or seller
    
    -- Rating
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    
    -- Specific ratings
    professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
    timeliness_rating INTEGER CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    
    -- Status
    approved BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_vendor ON reviews(vendor_id);
CREATE INDEX idx_reviews_transaction ON reviews(transaction_id);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

CREATE TYPE notification_type AS ENUM (
    'new_offer',
    'offer_accepted',
    'offer_rejected',
    'message_received',
    'document_uploaded',
    'vendor_request',
    'milestone_approaching',
    'payment_required'
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification details
    notification_type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_url VARCHAR(500),
    
    -- Related entities
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    
    -- Status
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    sent_email BOOLEAN DEFAULT FALSE,
    sent_sms BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- =====================================================
-- FAVORITES
-- =====================================================

CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, property_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_property ON favorites(property_id);

-- =====================================================
-- AUDIT LOG
-- =====================================================

CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_created ON audit_log(created_at);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seller_disclosures_updated_at BEFORE UPDATE ON seller_disclosures FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON offers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contract_info_updated_at BEFORE UPDATE ON contract_info FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fsbo_checklists_updated_at BEFORE UPDATE ON fsbo_checklists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
