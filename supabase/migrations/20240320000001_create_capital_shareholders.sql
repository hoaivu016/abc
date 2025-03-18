-- Create capital_shareholders table
CREATE TABLE capital_shareholders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    capital_id UUID NOT NULL REFERENCES capitals(id) ON DELETE CASCADE,
    shareholder_name VARCHAR(255) NOT NULL,
    investment_amount DECIMAL(15,2) NOT NULL,
    share_percentage DECIMAL(5,2) NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT valid_percentage CHECK (share_percentage >= 0 AND share_percentage <= 100),
    CONSTRAINT valid_amount CHECK (investment_amount >= 0)
);

-- Create trigger for updating updated_at timestamp
CREATE TRIGGER update_capital_shareholders_updated_at
    BEFORE UPDATE ON capital_shareholders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_capital_shareholders_capital_id ON capital_shareholders(capital_id); 