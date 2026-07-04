-- ==========================================
-- USERS TABLE
-- ==========================================

CREATE TABLE users (
    user_id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(100) NOT NULL,
    department VARCHAR(255),
    phone_number VARCHAR(20),
    institution_name VARCHAR(255),
    institution_id VARCHAR(100),

    temp_admin BOOLEAN DEFAULT FALSE,
    admin BOOLEAN DEFAULT FALSE,

    first_login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- CATEGORIES TABLE
-- ==========================================

CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(255) UNIQUE NOT NULL,
    fees NUMERIC(10,2) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ==========================================
-- SUBMISSIONS TABLE
-- ==========================================

CREATE TABLE submissions (
    publication_id SERIAL PRIMARY KEY,

    custom_publication_id VARCHAR(100) UNIQUE NOT NULL,

    user_id VARCHAR(100) NOT NULL,

    department VARCHAR(255),

    payment_id INTEGER,

    title TEXT NOT NULL,

    category_id INTEGER,

    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    status VARCHAR(100) DEFAULT 'Submitted',

    is_duplicate BOOLEAN DEFAULT FALSE,

    duplicate_of VARCHAR(100),

    manuscript_pdf_url TEXT,

    review_pdf_url TEXT,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	
    CONSTRAINT fk_submission_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_submission_payment
        FOREIGN KEY (payment_id)
        REFERENCES payments(payment_id),

    CONSTRAINT fk_submission_category
        FOREIGN KEY (category_id)
        REFERENCES categories(category_id)

);


-- ==========================================
-- USER SOCIAL LINKS TABLE
-- ==========================================

CREATE TABLE social_media_master (
    id SERIAL PRIMARY KEY,
    social_media_name VARCHAR(100) UNIQUE NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE user_social_links (
    id SERIAL PRIMARY KEY, 

    user_id VARCHAR(100) NOT NULL,

    social_media_name VARCHAR(100) NOT NULL,

    social_media_link TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_social_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);


-- ==========================================
-- FACULTY ACTIVITIES TABLE
-- ==========================================

CREATE TABLE faculty_activities (
    activity_id SERIAL PRIMARY KEY,

    user_id VARCHAR(100) NOT NULL,

    user_name VARCHAR(255),

    institution_name VARCHAR(255),

    institution_id VARCHAR(100),

    login_date TIMESTAMP,

    submission_count INTEGER DEFAULT 0,

    recent_submission_date TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_faculty_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- ==========================================
-- AUTO UPDATE updated_at TIMESTAMP
-- ==========================================

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_submissions_updated
BEFORE UPDATE ON submissions
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

CREATE INDEX idx_users_email
ON users(email);

CREATE INDEX idx_submissions_user
ON submissions(user_id);

CREATE INDEX idx_submissions_payment
ON submissions(payment_id);

CREATE INDEX idx_submissions_category
ON submissions(category_id);

CREATE INDEX idx_faculty_user
ON faculty_activities(user_id);
 


-- ==========================================
-- PAYMENTS TABLE
-- ==========================================

CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,

    publication_id INTEGER NOT NULL,

    category_id INTEGER NOT NULL,

    amount NUMERIC(10,2) NOT NULL,

    razorpay_order_id VARCHAR(255),

    razorpay_payment_id VARCHAR(255),

    razorpay_signature TEXT,

    payment_status VARCHAR(50) DEFAULT 'PENDING',

    invoice_url TEXT,

    payment_date TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_payment_submission
        FOREIGN KEY (publication_id)
        REFERENCES submissions(publication_id),

    CONSTRAINT fk_payment_category
        FOREIGN KEY (category_id)
        REFERENCES categories(category_id)
);


-- ==========================================
-- TEMP ADMIN PERMISSIONS TABLE
-- ==========================================

CREATE TABLE temp_admin_permissions (
    id SERIAL PRIMARY KEY,

    user_id VARCHAR(100) NOT NULL,

    dashboard BOOLEAN DEFAULT FALSE,
    evaluation_console BOOLEAN DEFAULT FALSE,
    my_publications BOOLEAN DEFAULT FALSE,
    submissions_queue BOOLEAN DEFAULT FALSE,
    upload_manuscript BOOLEAN DEFAULT FALSE,
    assign_access BOOLEAN DEFAULT FALSE,

    evaluate_manuscript BOOLEAN DEFAULT FALSE,
    export_data BOOLEAN DEFAULT FALSE,
    delete_manuscript BOOLEAN DEFAULT FALSE,
    manage_users BOOLEAN DEFAULT FALSE,

    assigned_by VARCHAR(100),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_permission_user
    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE
);

CREATE TABLE notifications (

    notification_id SERIAL PRIMARY KEY,

    user_id VARCHAR(100) NOT NULL,

    title VARCHAR(255) NOT NULL,

    message TEXT,

    type VARCHAR(100),

    is_read BOOLEAN DEFAULT FALSE,

    reference_id VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notification_user
    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE
);