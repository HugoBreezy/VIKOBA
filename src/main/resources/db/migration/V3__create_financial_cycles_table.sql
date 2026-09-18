CREATE TABLE financial_cycles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',

    CONSTRAINT chk_financial_cycle_dates
        CHECK (end_date > start_date)
);