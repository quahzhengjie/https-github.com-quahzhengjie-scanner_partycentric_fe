-- seed-data.sql
-- Complete seed data for KYC demo application

-- Clear existing data (be careful with foreign keys)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE csob_activity_logs;
TRUNCATE TABLE csob_submissions;
TRUNCATE TABLE csob_case_document_links;
TRUNCATE TABLE csob_case_party_links;
TRUNCATE TABLE csob_documents;
TRUNCATE TABLE csob_cases;
TRUNCATE TABLE csob_parties;
TRUNCATE TABLE csob_users;
TRUNCATE TABLE csob_accounts;
TRUNCATE TABLE csob_account_signatories;
TRUNCATE TABLE csob_party_risk_factors;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert Users (password is 'password123' encrypted with bcrypt)
-- This hash is for 'password123'
INSERT INTO csob_users (user_id, name, email, password, role, department, is_active, created_at) VALUES
('U001', 'Jane Doe', 'jane.doe@example.com', '$2a$10$z41TNs94HV0grip7RMCcie36dklmHALKnlcpZl9xTG5lxg68PyzBC', 'RM', 'Relationship Management', true, NOW()),
('U002', 'John Smith', 'john.smith@example.com', '$2a$10$z41TNs94HV0grip7RMCcie36dklmHALKnlcpZl9xTG5lxg68PyzBC', 'CHECKER', 'Operations', true, NOW()),
('U004', 'Mary Anne', 'mary.anne@example.com', '$2a$10$z41TNs94HV0grip7RMCcie36dklmHALKnlcpZl9xTG5lxg68PyzBC', 'COMPLIANCE', 'Compliance', true, NOW()),
('U003', 'George Chan', 'george.chan@example.com', '$2a$10$z41TNs94HV0grip7RMCcie36dklmHALKnlcpZl9xTG5lxg68PyzBC', 'GM', 'Management', true, NOW());

-- Insert Parties
INSERT INTO csob_parties (party_id, name, type, residency_status, nationality, date_of_birth, gender, occupation, 
    employer, email, phone, address_line1, address_city, address_postal_code, address_country, 
    is_pep, is_sanctioned, risk_score, created_at, created_by) VALUES
('P001', 'John Tan', 'INDIVIDUAL', 'SINGAPOREAN_PR', 'SG', '1980-05-15', 'Male', 'Director', 
    'TechStart Innovations', 'john.tan@email.com', '+65 9123 4567', '123 Main Street', 'Singapore', '123456', 'SG',
    false, false, 20, NOW(), 'Jane Doe'),
('P002', 'Michael Lim', 'INDIVIDUAL', 'SINGAPOREAN_PR', 'SG', '1975-08-20', 'Male', 'CEO', 
    'LimCorp Holdings', 'michael.lim@email.com', '+65 9234 5678', '456 Orchard Road', 'Singapore', '238888', 'SG',
    false, false, 15, NOW(), 'Jane Doe'),
('P003', 'Sarah Chen', 'INDIVIDUAL', 'FOREIGNER', 'US', '1990-12-10', 'Female', 'Investment Manager', 
    'Global Investments', 'sarah.chen@email.com', '+65 9345 6789', '789 Marina Bay', 'Singapore', '018956', 'SG',
    false, false, 30, NOW(), 'Jane Doe'),
('P004', 'David Lim', 'INDIVIDUAL', 'SINGAPOREAN_PR', 'SG', '1982-03-25', 'Male', 'Partner', 
    'Lim & Tan Associates', 'david.lim@email.com', '+65 9456 7890', '321 Bukit Timah Road', 'Singapore', '259770', 'SG',
    false, false, 25, NOW(), 'Jane Doe'),
('P005', 'Jessica Tan', 'INDIVIDUAL', 'SINGAPOREAN_PR', 'SG', '1985-07-18', 'Female', 'Partner', 
    'Lim & Tan Associates', 'jessica.tan@email.com', '+65 9567 8901', '654 East Coast Road', 'Singapore', '429123', 'SG',
    false, false, 20, NOW(), 'Jane Doe'),
('P006', 'Robert Wang', 'INDIVIDUAL', 'FOREIGNER', 'CN', '1970-11-30', 'Male', 'Government Official', 
    'Foreign Ministry', 'robert.wang@email.com', '+65 9678 9012', '987 Sentosa Cove', 'Singapore', '098297', 'SG',
    true, false, 80, NOW(), 'Jane Doe');

-- Get the actual party IDs (they might be auto-generated)
SET @party1 = (SELECT id FROM csob_parties WHERE party_id = 'P001');
SET @party2 = (SELECT id FROM csob_parties WHERE party_id = 'P002');
SET @party3 = (SELECT id FROM csob_parties WHERE party_id = 'P003');
SET @party4 = (SELECT id FROM csob_parties WHERE party_id = 'P004');
SET @party5 = (SELECT id FROM csob_parties WHERE party_id = 'P005');
SET @party6 = (SELECT id FROM csob_parties WHERE party_id = 'P006');

-- Add risk factors for parties (if table exists)
-- INSERT INTO csob_party_risk_factors (party_id, risk_factor) VALUES
-- (@party3, 'Foreign National'),
-- (@party6, 'PEP'),
-- (@party6, 'Foreign National');

-- Insert Documents
INSERT INTO csob_documents (doc_id, owner_party_id, doc_type, category, file_name, file_size, mime_type, 
    is_verified, verified_by, verified_date, uploaded_at, uploaded_by) VALUES
('DOC001', @party1, 'Identity Document / NRIC / Birth Certificate', 'IDENTITY', 'john_tan_nric.pdf', 2048000, 'application/pdf',
    true, 'Mary Anne', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY), 'Jane Doe'),
('DOC002', @party4, 'Identity Document / NRIC / Birth Certificate', 'IDENTITY', 'david_lim_nric.pdf', 1536000, 'application/pdf',
    true, 'Mary Anne', DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 12 DAY), 'Jane Doe'),
('DOC003', @party5, 'Identity Document / NRIC / Birth Certificate', 'IDENTITY', 'jessica_tan_nric.pdf', 1792000, 'application/pdf',
    true, 'Mary Anne', DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 11 DAY), 'Jane Doe'),
('DOC004', @party6, 'Passport', 'IDENTITY', 'robert_wang_passport.pdf', 3072000, 'application/pdf',
    true, 'Mary Anne', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY), 'Jane Doe');

-- Update documents with additional details
UPDATE csob_documents SET 
    issuer = 'Chinese Government',
    issue_date = '2020-01-15',
    expiry_date = '2030-01-14',
    document_number = 'G12345678'
WHERE doc_id = 'DOC004';

-- Get user IDs
SET @user1 = (SELECT id FROM csob_users WHERE user_id = 'U001');
SET @user2 = (SELECT id FROM csob_users WHERE user_id = 'U002');
SET @user3 = (SELECT id FROM csob_users WHERE user_id = 'U004');
SET @user4 = (SELECT id FROM csob_users WHERE user_id = 'U003');

-- Insert Cases
INSERT INTO csob_cases (case_id, status, risk_level, priority, assigned_to_id, 
    entity_name, entity_type, registration_number, tax_id, 
    registered_address_line1, registered_address_line2, registered_address_city, 
    registered_address_postal_code, registered_address_country,
    industry, business_description, incorporation_date, incorporation_country,
    created_at, updated_at) VALUES
('CASE-2025-001', 'DRAFT', 'MEDIUM', 'NORMAL', @user1,
    'TechStart Innovations Pte Ltd', 'NON_LISTED_COMPANY', '202412345A', '202412345A',
    '71 Ayer Rajah Crescent', '#02-18', 'Singapore', '139951', 'SG',
    'TECHNOLOGY', 'Software development and IT consulting', '2024-01-15', 'SG',
    DATE_SUB(NOW(), INTERVAL 5 DAY), NOW()),
('CASE-2025-002', 'PENDING_CHECKER_REVIEW', 'LOW', 'NORMAL', @user2,
    'Lim & Tan Legal Associates', 'PARTNERSHIP', 'T12PF3456G', 'T12PF3456G',
    '1 Raffles Place', '#44-01', 'Singapore', '048616', 'SG',
    'PROFESSIONAL_SERVICES', 'Legal services and consultancy', NULL, 'SG',
    DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
('CASE-2025-003', 'PENDING_COMPLIANCE_REVIEW', 'HIGH', 'HIGH', @user3,
    'Global Wealth Trust', 'TRUST', 'TRST98765B', 'TRST98765B',
    '8 Marina Blvd', NULL, 'Singapore', '018981', 'SG',
    'BANKING_FINANCIAL_SERVICES', 'Wealth management and trust services', NULL, 'SG',
    DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 6 HOUR));

-- Get case IDs
SET @case1 = (SELECT id FROM csob_cases WHERE case_id = 'CASE-2025-001');
SET @case2 = (SELECT id FROM csob_cases WHERE case_id = 'CASE-2025-002');
SET @case3 = (SELECT id FROM csob_cases WHERE case_id = 'CASE-2025-003');

-- Insert Case-Party Links
INSERT INTO csob_case_party_links (case_id, party_id, relationship_type, ownership_percentage, is_primary, start_date) VALUES
(@case1, @party1, 'Director', NULL, true, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(@case2, @party4, 'Partner', 50.00, true, DATE_SUB(NOW(), INTERVAL 7 DAY)),
(@case2, @party5, 'Partner', 50.00, true, DATE_SUB(NOW(), INTERVAL 7 DAY)),
(@case3, @party6, 'Settlor', NULL, true, DATE_SUB(NOW(), INTERVAL 10 DAY));

-- Insert Case-Document Links
INSERT INTO csob_case_document_links (link_id, case_id, requirement_id, requirement_type, is_mandatory, created_at) VALUES
('LNK-INIT-1', @case1, 'req-party-P001-0', 'STANDARD', true, DATE_SUB(NOW(), INTERVAL 5 DAY));

-- Get document link ID
SET @doclink1 = (SELECT id FROM csob_case_document_links WHERE link_id = 'LNK-INIT-1');
SET @doc1 = (SELECT id FROM csob_documents WHERE doc_id = 'DOC001');

-- Insert Submissions
INSERT INTO csob_submissions (submission_id, document_link_id, master_doc_id, status, 
    submitted_at, submitted_by, submission_method, 
    compliance_reviewed_at, compliance_reviewed_by) VALUES
('SUB-INIT-1', @doclink1, @doc1, 'VERIFIED', 
    DATE_SUB(NOW(), INTERVAL 4 DAY), 'Jane Doe', 'UPLOAD',
    DATE_SUB(NOW(), INTERVAL 2 DAY), 'Mary Anne');

-- Insert Activity Logs
INSERT INTO csob_activity_logs (case_id, timestamp, actor_id, actor_name, actor_role, 
    action, action_type, entity_type, entity_id) VALUES
(@case1, DATE_SUB(NOW(), INTERVAL 5 DAY), @user1, 'Jane Doe', 'RM', 
    'Case Created', 'CREATE', 'CASE', 'CASE-2025-001'),
(@case1, DATE_SUB(NOW(), INTERVAL 4 DAY), @user1, 'Jane Doe', 'RM', 
    'Document Submitted', 'UPLOAD', 'DOCUMENT', 'DOC001'),
(@case1, DATE_SUB(NOW(), INTERVAL 2 DAY), @user3, 'Mary Anne', 'COMPLIANCE', 
    'Document Verified', 'APPROVE', 'DOCUMENT', 'DOC001'),
(@case2, DATE_SUB(NOW(), INTERVAL 7 DAY), @user1, 'Jane Doe', 'RM', 
    'Case Created', 'CREATE', 'CASE', 'CASE-2025-002'),
(@case2, DATE_SUB(NOW(), INTERVAL 1 DAY), @user1, 'Jane Doe', 'RM', 
    'Submitted for Review', 'SUBMIT', 'CASE', 'CASE-2025-002'),
(@case3, DATE_SUB(NOW(), INTERVAL 10 DAY), @user1, 'Jane Doe', 'RM', 
    'Case Created', 'CREATE', 'CASE', 'CASE-2025-003'),
(@case3, DATE_SUB(NOW(), INTERVAL 6 HOUR), @user2, 'John Smith', 'CHECKER', 
    'Checker Approved', 'APPROVE', 'CASE', 'CASE-2025-003');

-- Create some accounts for testing
INSERT INTO csob_accounts (account_type, currency, purpose, status, primary_holder_id, created_at) VALUES
('CURRENT', 'SGD', 'Business Operations', 'PROPOSED', @party1, NOW()),
('SAVINGS', 'SGD', 'Company Reserves', 'ACTIVE', @party4, DATE_SUB(NOW(), INTERVAL 30 DAY));

-- Get account IDs
SET @acc1 = (SELECT id FROM csob_accounts ORDER BY id DESC LIMIT 1 OFFSET 1);
SET @acc2 = (SELECT id FROM csob_accounts ORDER BY id DESC LIMIT 1);

-- Add account signatories
INSERT INTO csob_account_signatories (account_id, party_id, signature_rule) VALUES
(@acc1, @party1, 'Any one'),
(@acc2, @party4, 'Any two'),
(@acc2, @party5, 'Any two');

-- Verify the data
SELECT 'Users:' as 'Table', COUNT(*) as 'Count' FROM csob_users
UNION ALL
SELECT 'Parties:', COUNT(*) FROM csob_parties
UNION ALL
SELECT 'Cases:', COUNT(*) FROM csob_cases
UNION ALL
SELECT 'Documents:', COUNT(*) FROM csob_documents
UNION ALL
SELECT 'Accounts:', COUNT(*) FROM csob_accounts;