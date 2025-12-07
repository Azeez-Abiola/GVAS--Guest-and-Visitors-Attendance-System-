-- Migration: Create documents table
-- Description: Store visitor document uploads and verification data

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id UUID NOT NULL REFERENCES visitors(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- passport, drivers_license, national_id, etc.
    document_number VARCHAR(100),
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL, -- URL or file system path
    file_size INTEGER, -- File size in bytes
    mime_type VARCHAR(100),
    
    -- Verification status
    verification_status VARCHAR(20) DEFAULT 'pending', -- pending, verified, rejected
    verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_notes TEXT,
    
    -- OCR/extraction results
    extracted_data JSONB, -- Store OCR results, parsed fields, etc.
    
    -- Metadata
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_documents_visitor_id ON documents(visitor_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_status ON documents(verification_status);
CREATE INDEX idx_documents_verified_by ON documents(verified_by);

-- RLS Policies
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Admin and reception can manage all documents
CREATE POLICY "documents_admin_reception_access" ON documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'reception')
        )
    );

-- Security can view all documents
CREATE POLICY "documents_security_read" ON documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'security'
        )
    );

-- Users can view documents they uploaded
CREATE POLICY "documents_uploader_access" ON documents
    FOR SELECT USING (uploaded_by = auth.uid());

-- Function to verify document
CREATE OR REPLACE FUNCTION verify_document(
    p_document_id UUID,
    p_status TEXT,
    p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if user can verify documents
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'reception', 'security')
    ) THEN
        RAISE EXCEPTION 'Insufficient permissions to verify documents';
    END IF;
    
    UPDATE documents
    SET 
        verification_status = p_status,
        verified_by = auth.uid(),
        verified_at = NOW(),
        verification_notes = p_notes,
        updated_at = NOW()
    WHERE id = p_document_id;
    
    -- Log the verification
    PERFORM create_audit_log(
        'VERIFY',
        'documents',
        p_document_id,
        NULL,
        jsonb_build_object('status', p_status, 'notes', p_notes),
        'Document verification: ' || p_status
    );
    
    RETURN TRUE;
END;
$$;