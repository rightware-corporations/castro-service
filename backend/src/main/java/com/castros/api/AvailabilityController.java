package com.castros.api;

import com.castros.availability.AvailabilityService;
import jakarta.validation.constraints.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.UUID;

@RestController @RequestMapping("/api/v1/availability")
public class AvailabilityController {
    private final AvailabilityService availability; public AvailabilityController(AvailabilityService availability){this.availability=availability;}
    @GetMapping public AvailabilityService.AvailabilityResult slots(@RequestParam String bookableType,@RequestParam UUID bookableId,@RequestParam @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate date,@RequestParam @Min(1) int durationMinutes){return availability.slots(bookableType,bookableId,date,durationMinutes);}
}
