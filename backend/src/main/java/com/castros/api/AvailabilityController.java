package com.castros.api;

import com.castros.availability.AvailabilityService;
import com.castros.booking.BookableType;
import com.castros.shared.exception.ProblemDetailResponse;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.constraints.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.UUID;

@RestController @RequestMapping("/api/v1/availability")
public class AvailabilityController {
    private final AvailabilityService availability; public AvailabilityController(AvailabilityService availability){this.availability=availability;}
    @GetMapping
    @ApiResponses({@ApiResponse(responseCode="200", description="Availability calculated"), @ApiResponse(responseCode="400", content=@Content(schema=@Schema(implementation=ProblemDetailResponse.class))), @ApiResponse(responseCode="409", content=@Content(schema=@Schema(implementation=ProblemDetailResponse.class)))})
    public AvailabilityService.AvailabilityResult slots(@RequestParam BookableType bookableType,@RequestParam UUID bookableId,@RequestParam @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate date,@RequestParam @Min(1) int durationMinutes){return availability.slots(bookableType,bookableId,date,durationMinutes);}
}
