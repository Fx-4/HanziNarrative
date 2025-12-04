-- Setup PostgreSQL untuk HanziNarrative
-- Jalankan dengan: psql -U postgres -f setup-postgres.sql

-- Create user if not exists
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_user WHERE usename = 'hanzinarrative'
   ) THEN
      CREATE USER hanzinarrative WITH PASSWORD 'hanzinarrative_dev';
   END IF;
END
$do$;

-- Create database if not exists
SELECT 'CREATE DATABASE hanzinarrative OWNER hanzinarrative'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'hanzinarrative')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE hanzinarrative TO hanzinarrative;

-- Connect to database and create extension
\c hanzinarrative
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
GRANT ALL ON SCHEMA public TO hanzinarrative;
