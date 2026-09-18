CREATE TABLE penalties (
    id BIGSERIAL PRIMARY KEY,
    installment_id BIGINT NOT NULL,
    penalty_rate NUMERIC(5,2) NOT NULL,
    penalty_amount NUMERIC(15,2) NOT NULL,
    penalty_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    notes VARCHAR(500),

    CONSTRAINT fk_penalty_installment
        FOREIGN KEY (installment_id)
        REFERENCES loan_installments(id),

    CONSTRAINT chk_penalty_rate
        CHECK (penalty_rate >= 0),

    CONSTRAINT chk_penalty_amount
        CHECK (penalty_amount > 0)
);