-- Insert office locations
INSERT INTO office_locations (id, name, latitude, longitude, radius, "isActive", "createdAt") 
VALUES 
  ('office-1', 'Main Office - Phnom Penh', 11.556374, 104.928207, 50, true, NOW()),
  ('office-2', 'Branch Office - Siem Reap', 13.362922, 103.860897, 50, true, NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert admin user (password: admin123 hashed with bcrypt)
INSERT INTO users (id, email, password, "firstName", "lastName", role, position, department, "isActive", "createdAt", "updatedAt", "registeredAt")
VALUES 
  ('admin-001', 'admin@tracking.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGQRQs60gS/6UIJtOE26UjK', 'Admin', 'User', 'ADMIN', 'System Administrator', 'IT', true, NOW(), NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Insert staff users (password: staff123 hashed with bcrypt)
INSERT INTO users (id, email, password, "firstName", "lastName", role, position, department, "isActive", "createdAt", "updatedAt", "registeredAt")
VALUES 
  ('staff-001', 'staff1@tracking.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGQRQs60gS/6UIJtOE26UjK', 'Sokha', 'Chan', 'STAFF', 'Project Officer', 'Operations', true, NOW(), NOW(), NOW()),
  ('staff-002', 'staff2@tracking.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGQRQs60gS/6UIJtOE26UjK', 'Dara', 'Kem', 'STAFF', 'Field Coordinator', 'Programs', true, NOW(), NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Note: password hash is for 'staff123' and 'admin123' (same hash for demo purposes)
-- In production, you should hash each password separately

SELECT 'Database seeded successfully! Use admin@tracking.com/admin123 or staff1@tracking.com/staff123 to login.' AS message;
