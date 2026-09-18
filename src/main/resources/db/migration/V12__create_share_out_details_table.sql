CREATE TABLE share_out_details (
    id BIGSERIAL PRIMARY KEY,
    share_out_id BIGINT NOT NULL,
    member_id BIGINT NOT NULL,

    member_contribution NUMERIC(15,2) NOT NULL,
    contribution_percentage NUMERIC(7,4) NOT NULL,
    member_profit NUMERIC(15,2) NOT NULL,
    share_out_amount NUMERIC(15,2) NOT NULL,

    payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    paid_date DATE,
    notes VARCHAR(500),

    CONSTRAINT fk_share_out_detail_share_out
        FOREIGN KEY (share_out_id)
        REFERENCES share_outs(id),

    CONSTRAINT fk_share_out_detail_member
        FOREIGN KEY (member_id)
        REFERENCES members(id),

    CONSTRAINT uq_share_out_detail_member
        UNIQUE (share_out_id, member_id),

    CONSTRAINT chk_member_contribution
        CHECK (member_contribution >= 0),

    CONSTRAINT chk_contribution_percentage
        CHECK (contribution_percentage >= 0),

    CONSTRAINT chk_member_profit
        CHECK (member_profit >= 0),

    CONSTRAINT chk_share_out_amount
        CHECK (share_out_amount >= 0)
);