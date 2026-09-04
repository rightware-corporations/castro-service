package com.castros.api;

import com.castros.booking.Booking;
import com.castros.booking.BookingRescheduleService;
import com.castros.user.UserAccount;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/operations/bookings")
public class BookingScheduleAdminController {
    private final BookingRescheduleService rescheduleService;

    public BookingScheduleAdminController(BookingRescheduleService rescheduleService) {
        this.rescheduleService = rescheduleService;
    }

    @PatchMapping("/{id}/schedule")
    @PreAuthorize("hasAuthority('booking.update')")
    public BookingScheduleResponse reschedule(@PathVariable UUID id, @Valid @RequestBody BookingScheduleInput input,
                                              Authentication authentication) {
        Booking booking = rescheduleService.reschedule(organizationId(authentication), id, input.date(), input.startTime(), input.endTime());
        return new BookingScheduleResponse(booking.id, booking.reference, booking.status.name(), booking.startAt, booking.endAt);
    }

    private UUID organizationId(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserAccount user) || user.organizationId == null)
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Organization context unavailable");
        return user.organizationId;
    }

    public record BookingScheduleInput(@NotNull LocalDate date, @NotNull LocalTime startTime, @NotNull LocalTime endTime) { }
    public record BookingScheduleResponse(UUID id, String reference, String status, OffsetDateTime startAt, OffsetDateTime endAt) { }
}
