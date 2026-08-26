package com.castros.api;

import com.castros.booking.*;
import com.castros.shared.config.AppProperties;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.web.bind.annotation.*;
import java.time.*;

@RestController @RequestMapping("/api/v1/bookings")
public class BookingController {
    private final BookingApplicationService application; private final AppProperties properties;
    public BookingController(BookingApplicationService application,AppProperties properties){this.application=application;this.properties=properties;}
    @PostMapping public BookingResponse create(@Valid @RequestBody BookingApplicationService.BookingRequest request){Booking b=application.create(request,ZoneId.of(properties.getBusinessTimezone()));return new BookingResponse(b.id,b.reference,b.status.name(),b.startAt,b.endAt);}
    @GetMapping("/{reference}") public PublicBookingLookup lookup(@PathVariable String reference){Booking b=application.findPublic(reference);return new PublicBookingLookup(b.reference,b.status.name(),b.startAt,b.endAt);}
}
