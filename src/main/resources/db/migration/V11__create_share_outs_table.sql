CREATE TABLE share_outs (
    id BIGSERIAL PRIMARY KEY,
    cycle_id BIGINT NOT NULL UNIQUE,
    total_contributions NUMERIC(15,2) NOT NULL,
    total_profit NUMERIC(15,2) NOT NULL,
    total_expenses NUMERIC(15,2) NOT NULL,
    total_share_out NUMERIC(15,2) NOT NULL,
    share_out_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    notes VARCHAR(500),

    CONSTRAINT fk_share_out_cycle
        FOREIGN KEY (cycle_id)
        REFERENCES financial_cycles(id),

    CONSTRAINT chk_share_out_contributions
        CHECK (total_contributions >= 0),

    CONSTRAINT chk_share_out_profit
        CHECK (total_profit >= 0),

    CONSTRAINT chk_share_out_expenses
        CHECK (total_expenses >= 0),

    CONSTRAINT chk_share_out_total
        CHECK (total_share_out >= 0)
);