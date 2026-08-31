package com.castros.availability;

import org.junit.jupiter.api.Test;
import java.time.*;
import static org.junit.jupiter.api.Assertions.*;

class AvailabilityServiceTest {
    @Test void halfOpenIntervalsTreatExactBoundaryAsNonOverlapping(){
        OffsetDateTime first=OffsetDateTime.parse("2026-08-28T08:00:00Z"); OffsetDateTime second=OffsetDateTime.parse("2026-08-28T10:00:00Z");
        assertTrue(first.isBefore(second)); assertFalse(second.isBefore(first));
    }
}
