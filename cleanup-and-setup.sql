-- Cleanup database lama dan setup fresh
-- Jalankan dengan: psql -U postgres -f cleanup-and-setup.sql

-- Disconnect semua koneksi ke database hanzinarrative (jika ada)
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'hanzinarrative'
  AND pid <> pg_backend_pid();

-- Drop database jika sudah ada (hapus yang lama)
DROP DATABASE IF EXISTS hanzinarrative;

-- Drop user jika sudah ada
DROP USER IF EXISTS hanzinarrative;

-- Create user baru
CREATE USER hanzinarrative WITH PASSWORD 'hanzinarrative_dev';

-- Create database baru
CREATE DATABASE hanzinarrative OWNER hanzinarrative;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE hanzinarrative TO hanzinarrative;

-- Connect ke database
\c hanzinarrative

-- Create extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO hanzinarrative;

-- Success message
\echo '✓ Database cleanup dan setup selesai!'
\echo '✓ Database: hanzinarrative'
\echo '✓ User: hanzinarrative'
\echo '✓ Password: hanzinarrative_dev'
