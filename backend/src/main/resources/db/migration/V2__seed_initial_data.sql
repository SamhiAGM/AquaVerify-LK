-- =============================================================================
-- AquaVerify LK — Database Seed Data Migration V2
-- Description: Baseline academic demonstration data across all 4 system roles
-- All demo passwords:
--   Admin:          Admin@123
--   Officer:        Officer@123
--   Lab Tech:       Lab@123
--   Citizen:        Citizen@123
-- =============================================================================

-- 1. SEED USERS
INSERT INTO users (id, full_name, email, password_hash, phone, district, role, enabled, created_at, updated_at)
VALUES
(1, 'Kavinda Perera', 'admin@aquaverify.lk', '$2a$10$wdfW/7QZzbaCZ3hVn0omQOyUjMjEHAeOFzlwHuKvPGxMHDN5psp/G', '+94771234567', 'Colombo', 'ADMIN', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Dilhani Senanayake', 'officer@aquaverify.lk', '$2a$10$zNKaDuI0aAObohCvlU5QZ.DTiBJHhWcXQAEEdeCkxPHmvCH5vtL7y', '+94712345678', 'Kandy', 'OFFICER', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'Nuwan Jayawardena', 'lab@aquaverify.lk', '$2a$10$O/O1MgsaFhKALWXiQRjMtu9HTyb9KUaB6jd3mLZdnJi6OmyAuyMrK', '+94763456789', 'Colombo', 'LAB_TECHNICIAN', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'Chamari Wickramasinghe', 'citizen@aquaverify.lk', '$2a$10$ymnHQ73i8Ruty3gNv/oCAO0YsvOYlzB/evC98hNIuE0aCcDafqrxO', '+94754567890', 'Gampaha', 'CITIZEN', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Reset sequence for users
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users));

-- 2. SEED WATER SOURCES
INSERT INTO water_sources (id, source_name, source_type, district, location_description, latitude, longitude, created_at, updated_at)
VALUES
(1, 'Kelani River Intake Plant #2', 'RIVER_RESERVOIR', 'Colombo', 'Ambatale Water Treatment Station Intake Basin, Kelani River corridor', 6.9412, 79.9234, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Peradeniya Community Gravity Tank', 'COMMUNITY_TANK', 'Kandy', 'Main distribution reservoir serving Mahakanda and Peradeniya south', 7.2589, 80.5982, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'Negombo Coastal Deep Well #4', 'DEEP_TUBE_WELL', 'Gampaha', 'Dalupotha public tube-well facility near community health center', 7.2144, 79.8458, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'Wakwella Public Spring Network', 'NATURAL_SPRING', 'Galle', 'Protected natural freshwater spring catchment along Wakwella hills', 6.0782, 80.2014, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Reset sequence for water_sources
SELECT setval('water_sources_id_seq', (SELECT COALESCE(MAX(id), 1) FROM water_sources));

-- 3. SEED COMPLAINTS
INSERT INTO complaints (id, complaint_reference, citizen_id, water_source_id, assigned_officer_id, title, description, complaint_category, status, created_at, updated_at, resolved_at)
VALUES
(1, 'AQV-2026-00101', 4, 3, 2, 'Unusual brown sedimentation in morning tap line', 'Noticed heavy brownish-orange sediment settling in drinking cups from the community supply. Odor resembles metallic iron.', 'SEDIMENT', 'UNDER_INVESTIGATION', CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '1 day', NULL),
(2, 'AQV-2026-00102', 4, 1, 2, 'Strong chemical chlorine odor after rainfall', 'Pungent disinfectant smell detectable across several households in the low-lying neighborhood following heavy monsoon runoff.', 'ODOR', 'RESOLVED', CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence for complaints
SELECT setval('complaints_id_seq', (SELECT COALESCE(MAX(id), 1) FROM complaints));

-- 4. SEED COMPLAINT UPDATES (Audit timeline)
INSERT INTO complaint_updates (id, complaint_id, updated_by, previous_status, new_status, note, created_at)
VALUES
(1, 1, 4, 'NONE', 'PENDING', 'Complaint lodged by citizen with detailed photo and observation report.', CURRENT_TIMESTAMP - INTERVAL '3 days'),
(2, 1, 2, 'PENDING', 'UNDER_INVESTIGATION', 'Assigned officer Dilhani Senanayake initiated preliminary site inspection and scheduled sampling.', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(3, 2, 4, 'NONE', 'PENDING', 'Initial citizen report received concerning excessive chlorine odor.', CURRENT_TIMESTAMP - INTERVAL '7 days'),
(4, 2, 2, 'PENDING', 'UNDER_INVESTIGATION', 'Officer dispatched for field chlorine residual testing.', CURRENT_TIMESTAMP - INTERVAL '5 days'),
(5, 2, 2, 'UNDER_INVESTIGATION', 'RESOLVED', 'Treatment plant dosage calibrated; repeat tests confirmed residual chlorine within safe SLS 614 thresholds.', CURRENT_TIMESTAMP - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence for complaint_updates
SELECT setval('complaint_updates_id_seq', (SELECT COALESCE(MAX(id), 1) FROM complaint_updates));

-- 5. SEED WATER TESTS
INSERT INTO water_tests (id, water_source_id, laboratory_technician_id, sample_date, ph_value, turbidity_ntu, tds_ppm, conductivity_us_cm, nitrate_mg_l, e_coli_presence, laboratory_reference, verification_status, verified_by, verified_at, created_at, updated_at)
VALUES
(1, 1, 3, CURRENT_DATE - INTERVAL '2 days', 7.20, 1.45, 142.00, 220.00, 4.20, false, 'LAB-COL-2026-049', 'VERIFIED', 1, CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(2, 3, 3, CURRENT_DATE - INTERVAL '1 day', 6.65, 4.80, 290.00, 480.00, 18.50, false, 'LAB-GAM-2026-052', 'PENDING_VERIFICATION', NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence for water_tests
SELECT setval('water_tests_id_seq', (SELECT COALESCE(MAX(id), 1) FROM water_tests));

-- 6. SEED AUDIT LOGS
INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, details, created_at)
VALUES
(1, 1, 'VERIFY_TEST_RECORD', 'WATER_TEST', '1', 'Admin verified laboratory report LAB-COL-2026-049 for public publication', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(2, 2, 'RESOLVE_COMPLAINT', 'COMPLAINT', '2', 'Officer resolved complaint AQV-2026-00102 after dosage calibration inspection', CURRENT_TIMESTAMP - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence for audit_logs
SELECT setval('audit_logs_id_seq', (SELECT COALESCE(MAX(id), 1) FROM audit_logs));
