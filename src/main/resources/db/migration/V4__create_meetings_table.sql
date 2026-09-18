CREATE TABLE meetings (
    id BIGSERIAL PRIMARY KEY,
    cycle_id BIGINT NOT NULL,
    meeting_date DATE NOT NULL,
    meeting_number INTEGER NOT NULL,
    notes VARCHAR(500),

    CONSTRAINT fk_meeting_cycle
        FOREIGN KEY (cycle_id)
        REFERENCES financial_cycles(id),

    CONSTRAINT uq_meeting_cycle_number
        UNIQUE (cycle_id, meeting_number)
);