CREATE TABLE expenses (
    id BIGSERIAL PRIMARY KEY,
    cycle_id BIGINT NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    expense_date DATE NOT NULL,
    description VARCHAR(500) NOT NULL,
    recorded_by BIGINT,

    CONSTRAINT fk_expense_cycle
        FOREIGN KEY (cycle_id)
        REFERENCES financial_cycles(id),

    CONSTRAINT fk_expense_recorded_by
        FOREIGN KEY (recorded_by)
        REFERENCES users(id),

    CONSTRAINT chk_expense_amount
        CHECK (amount > 0)
);