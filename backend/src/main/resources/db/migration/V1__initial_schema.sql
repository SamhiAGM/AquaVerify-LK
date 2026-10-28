-- =============================================================================
-- AquaVerify LK — Database Schema Migration V1
-- Description: Core tables, relational constraints, and performance indexes
-- Target DBMS: PostgreSQL 15+ (Running PostgreSQL 18)
-- =============================================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(25) NOT NULL,
    district VARCHAR(50) NOT NULL,
    role VARCHAR(30) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_user_role CHECK (role IN ('CITIZEN', 'OFFICER', 'LAB_TECHNICIAN', 'ADMIN'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_district ON users(district);

-- 2. WATER SOURCES TABLE
CREATE TABLE IF NOT EXISTS water_sources (
    id BIGSERIAL PRIMARY KEY,
    source_name VARCHAR(150) NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    district VARCHAR(50) NOT NULL,
    location_description TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_source_type CHECK (source_type IN (
        'TAP_LINE', 'SHALLOW_WELL', 'DEEP_TUBE_WELL', 'COMMUNITY_TANK',
        'NATURAL_SPRING', 'RIVER_RESERVOIR', 'RAINWATER_HARVEST'
    ))
);

CREATE INDEX IF NOT EXISTS idx_water_sources_district ON water_sources(district);
CREATE INDEX IF NOT EXISTS idx_water_sources_type ON water_sources(source_type);

-- 3. COMPLAINTS TABLE
CREATE TABLE IF NOT EXISTS complaints (
    id BIGSERIAL PRIMARY KEY,
    complaint_reference VARCHAR(50) NOT NULL UNIQUE,
    citizen_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    water_source_id BIGINT REFERENCES water_sources(id) ON DELETE SET NULL,
    assigned_officer_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    complaint_category VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_complaint_category CHECK (complaint_category IN (
        'ODOR', 'TASTE', 'COLOR_DISCOLORATION', 'SUSPECTED_CONTAMINATION',
        'SEDIMENT', 'PIPE_CORROSION', 'OTHER'
    )),
    CONSTRAINT chk_complaint_status CHECK (status IN (
        'PENDING', 'UNDER_INVESTIGATION', 'TESTING_REQUESTED', 'RESOLVED', 'REJECTED'
    ))
);

CREATE INDEX IF NOT EXISTS idx_complaints_citizen ON complaints(citizen_id);
CREATE INDEX IF NOT EXISTS idx_complaints_officer ON complaints(assigned_officer_id);
CREATE INDEX IF NOT EXISTS idx_complaints_source ON complaints(water_source_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_created ON complaints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaints_deleted ON complaints(deleted_at);

-- 4. WATER TESTS TABLE
CREATE TABLE IF NOT EXISTS water_tests (
    id BIGSERIAL PRIMARY KEY,
    water_source_id BIGINT NOT NULL REFERENCES water_sources(id) ON DELETE CASCADE,
    laboratory_technician_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    sample_date DATE NOT NULL,
    ph_value NUMERIC(4,2) NOT NULL,
    turbidity_ntu NUMERIC(6,2) NOT NULL,
    tds_ppm NUMERIC(7,2),
    conductivity_us_cm NUMERIC(7,2),
    nitrate_mg_l NUMERIC(6,2),
    e_coli_presence BOOLEAN DEFAULT FALSE,
    laboratory_reference VARCHAR(100) NOT NULL,
    verification_status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    verified_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_test_ph CHECK (ph_value >= 0.00 AND ph_value <= 14.00),
    CONSTRAINT chk_test_turbidity CHECK (turbidity_ntu >= 0.00),
    CONSTRAINT chk_test_verification_status CHECK (verification_status IN (
        'DRAFT', 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED'
    ))
);

CREATE INDEX IF NOT EXISTS idx_water_tests_source ON water_tests(water_source_id);
CREATE INDEX IF NOT EXISTS idx_water_tests_tech ON water_tests(laboratory_technician_id);
CREATE INDEX IF NOT EXISTS idx_water_tests_status ON water_tests(verification_status);
CREATE INDEX IF NOT EXISTS idx_water_tests_sample_date ON water_tests(sample_date DESC);

-- 5. COMPLAINT UPDATES TABLE (Audit timeline & progress history)
CREATE TABLE IF NOT EXISTS complaint_updates (
    id BIGSERIAL PRIMARY KEY,
    complaint_id BIGINT NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    updated_by BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    previous_status VARCHAR(50) NOT NULL,
    new_status VARCHAR(50) NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_complaint_updates_complaint ON complaint_updates(complaint_id);
CREATE INDEX IF NOT EXISTS idx_complaint_updates_created ON complaint_updates(created_at ASC);

-- 6. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    actor_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100),
    details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
