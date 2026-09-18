CREATE TABLE loans (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT NOT NULL,
    cycle_id BIGINT NOT NULL,

    principal_amount NUMERIC(15,2) NOT NULL,
    interest_rate NUMERIC(5,2) NOT NULL,
    interest_amount NUMERIC(15,2) NOT NULL,
    total_amount NUMERIC(15,2) NOT NULL,

    loan_date DATE NOT NULL,
    due_date DATE NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT fk_loan_member
        FOREIGN KEY (member_id)
        REFERENCES members(id),

    CONSTRAINT fk_loan_cycle
        FOREIGN KEY (cycle_id)
        REFERENCES financial_cycles(id),

    CONSTRAINT chk_loan_principal
        CHECK (principal_amount > 0),

    CONSTRAINT chk_loan_interest_rate
        CHECK (interest_rate >= 0),

    CONSTRAINT chk_loan_interest_amount
        CHECK (interest_amount >= 0),

    CONSTRAINT chk_loan_total_amount
        CHECK (total_amount > 0),

    CONSTRAINT chk_loan_dates
        CHECK (due_date > loan_date)
);