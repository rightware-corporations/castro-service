package com.castros.api;

import com.castros.booking.*;
import com.castros.shared.config.AppProperties;
import com.castros.shared.exception.ProblemDetailResponse;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.web.bind.annotation.*;
import java.time.*;

@RestController @RequestMapping("/api/v1/bookings")
public class BookingController {
    private final BookingApplicationService application; private final AppProperties properties;
    public BookingController(BookingApplicationService application,AppProperties properties){this.application=application;this.properties=properties;}
    @PostMapping
    @ApiResponses({@ApiResponse(responseCode="200", description="Booking created"), @ApiResponse(responseCode="400", content=@Content(schema=@Schema(implementation=ProblemDetailResponse.class))), @ApiResponse(responseCode="409", content=@Content(schema=@Schema(implementation=ProblemDetailResponse.class)))})
    public BookingResponse create(@RequestHeader(value="Idempotency-Key", required=false) String idempotencyKey, @Valid @RequestBody BookingApplicationService.BookingRequest request){Booking b=application.create(request,ZoneId.of(properties.getBusinessTimezone()),idempotencyKey);return new BookingResponse(b.id,b.reference,b.status.name(),b.startAt,b.endAt);}
    @GetMapping("/{reference}")
    @ApiResponses({@ApiResponse(responseCode="200", description="Booking found"), @ApiResponse(responseCode="404", content=@Content(schema=@Schema(implementation=ProblemDetailResponse.class)))})
    public PublicBookingLookup lookup(@PathVariable String reference){Booking b=application.findPublic(reference);return new PublicBookingLookup(b.reference,b.status.name(),b.startAt,b.endAt);}
}
