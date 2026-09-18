CREATE TABLE loan_payments (
    id BIGSERIAL PRIMARY KEY,
    installment_id BIGINT NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    payment_date DATE NOT NULL,
    recorded_by BIGINT,
    reference_number VARCHAR(100),
    notes VARCHAR(500),

    CONSTRAINT fk_payment_installment
        FOREIGN KEY (installment_id)
        REFERENCES loan_installments(id),

    CONSTRAINT fk_payment_recorded_by
        FOREIGN KEY (recorded_by)
        REFERENCES users(id),

    CONSTRAINT chk_payment_amount
        CHECK (amount > 0)
);