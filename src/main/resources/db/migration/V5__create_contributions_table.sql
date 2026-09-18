CREATE TABLE contributions (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT NOT NULL,
    cycle_id BIGINT NOT NULL,
    meeting_id BIGINT NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    contribution_date DATE NOT NULL,
    recorded_by BIGINT,

    CONSTRAINT fk_contribution_member
        FOREIGN KEY (member_id)
        REFERENCES members(id),

    CONSTRAINT fk_contribution_cycle
        FOREIGN KEY (cycle_id)
        REFERENCES financial_cycles(id),

    CONSTRAINT fk_contribution_meeting
        FOREIGN KEY (meeting_id)
        REFERENCES meetings(id),

    CONSTRAINT fk_contribution_recorded_by
        FOREIGN KEY (recorded_by)
        REFERENCES users(id),

    CONSTRAINT chk_contribution_amount
        CHECK (amount > 0)
);