CREATE TABLE loan_installments (
    id BIGSERIAL PRIMARY KEY,
    loan_id BIGINT NOT NULL,
    installment_number INTEGER NOT NULL,
    due_date DATE NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',

    CONSTRAINT fk_installment_loan
        FOREIGN KEY (loan_id)
        REFERENCES loans(id),

    CONSTRAINT uq_loan_installment_number
        UNIQUE (loan_id, installment_number),

    CONSTRAINT chk_installment_number
        CHECK (installment_number BETWEEN 1 AND 12),

    CONSTRAINT chk_installment_amount
        CHECK (amount > 0)
);