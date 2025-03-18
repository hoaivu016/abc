-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create capitals table
CREATE TABLE IF NOT EXISTS capitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shareholder_name VARCHAR(255) NOT NULL,
    capital_amount NUMERIC(15,2) NOT NULL,
    share_percentage NUMERIC(5,2) NOT NULL,
    annual_profit NUMERIC(15,2) NOT NULL DEFAULT 0,
    profit_share NUMERIC(15,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Create trigger function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating updated_at timestamp
CREATE TRIGGER update_capitals_updated_at
    BEFORE UPDATE ON capitals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 