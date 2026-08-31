package com.castros.availability;

import com.castros.booking.BookableType;
import com.castros.user.UserAccount;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/operations/availability")
public class AvailabilityAdminController {
    private final AvailabilityRuleRepository rules;
    private final AvailabilityExceptionRepository exceptions;
    private final BlockedPeriodRepository blockedPeriods;

    public AvailabilityAdminController(AvailabilityRuleRepository rules,
                                       AvailabilityExceptionRepository exceptions,
                                       BlockedPeriodRepository blockedPeriods) {
        this.rules = rules;
        this.exceptions = exceptions;
        this.blockedPeriods = blockedPeriods;
    }

    @GetMapping("/rules")
    @PreAuthorize("hasAuthority('availability.read')")
    public List<RuleResponse> rules(Authentication authentication) {
        return rules.findAllByOrganizationIdOrderByBookableTypeAscBookableIdAscDayOfWeekAsc(organizationId(authentication))
            .stream().map(this::toRule).toList();
    }

    @PostMapping("/rules")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('availability.manage')")
    public RuleResponse createRule(@Valid @RequestBody RuleInput input, Authentication authentication) {
        validateWindow(input.opensAt(), input.closesAt());
        AvailabilityRule rule = new AvailabilityRule();
        apply(rule, input, organizationId(authentication));
        return toRule(rules.save(rule));
    }

    @PutMapping("/rules/{id}")
    @PreAuthorize("hasAuthority('availability.manage')")
    public RuleResponse updateRule(@PathVariable UUID id, @Valid @RequestBody RuleInput input, Authentication authentication) {
        validateWindow(input.opensAt(), input.closesAt());
        UUID organizationId = organizationId(authentication);
        AvailabilityRule rule = rules.findByOrganizationIdAndId(organizationId, id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Availability rule not found"));
        apply(rule, input, organizationId);
        return toRule(rules.save(rule));
    }

    @DeleteMapping("/rules/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('availability.manage')")
    public void deleteRule(@PathVariable UUID id, Authentication authentication) {
        AvailabilityRule rule = rules.findByOrganizationIdAndId(organizationId(authentication), id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Availability rule not found"));
        rules.delete(rule);
    }

    @GetMapping("/exceptions")
    @PreAuthorize("hasAuthority('availability.read')")
    public List<ExceptionResponse> exceptions(Authentication authentication) {
        return exceptions.findAllByOrganizationIdOrderByDateDesc(organizationId(authentication)).stream().map(this::toException).toList();
    }

    @PostMapping("/exceptions")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('availability.manage')")
    public ExceptionResponse createException(@Valid @RequestBody ExceptionInput input, Authentication authentication) {
        validateException(input);
        AvailabilityExceptionEntity item = new AvailabilityExceptionEntity();
        apply(item, input, organizationId(authentication));
        return toException(exceptions.save(item));
    }

    @PutMapping("/exceptions/{id}")
    @PreAuthorize("hasAuthority('availability.manage')")
    public ExceptionResponse updateException(@PathVariable UUID id, @Valid @RequestBody ExceptionInput input, Authentication authentication) {
        validateException(input);
        UUID organizationId = organizationId(authentication);
        AvailabilityExceptionEntity item = exceptions.findByOrganizationIdAndId(organizationId, id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Availability exception not found"));
        apply(item, input, organizationId);
        return toException(exceptions.save(item));
    }

    @DeleteMapping("/exceptions/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('availability.manage')")
    public void deleteException(@PathVariable UUID id, Authentication authentication) {
        AvailabilityExceptionEntity item = exceptions.findByOrganizationIdAndId(organizationId(authentication), id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Availability exception not found"));
        exceptions.delete(item);
    }

    @GetMapping("/blocked-periods")
    @PreAuthorize("hasAuthority('availability.read')")
    public List<BlockedPeriodResponse> blockedPeriods(Authentication authentication) {
        return blockedPeriods.findAllByOrganizationIdOrderByStartAtDesc(organizationId(authentication)).stream().map(this::toBlockedPeriod).toList();
    }

    @PostMapping("/blocked-periods")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('availability.manage')")
    public BlockedPeriodResponse createBlockedPeriod(@Valid @RequestBody BlockedPeriodInput input, Authentication authentication) {
        validateRange(input.startAt(), input.endAt());
        BlockedPeriod item = new BlockedPeriod();
        apply(item, input, organizationId(authentication));
        return toBlockedPeriod(blockedPeriods.save(item));
    }

    @PutMapping("/blocked-periods/{id}")
    @PreAuthorize("hasAuthority('availability.manage')")
    public BlockedPeriodResponse updateBlockedPeriod(@PathVariable UUID id, @Valid @RequestBody BlockedPeriodInput input, Authentication authentication) {
        validateRange(input.startAt(), input.endAt());
        UUID organizationId = organizationId(authentication);
        BlockedPeriod item = blockedPeriods.findByOrganizationIdAndId(organizationId, id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Blocked period not found"));
        apply(item, input, organizationId);
        return toBlockedPeriod(blockedPeriods.save(item));
    }

    @DeleteMapping("/blocked-periods/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('availability.manage')")
    public void deleteBlockedPeriod(@PathVariable UUID id, Authentication authentication) {
        BlockedPeriod item = blockedPeriods.findByOrganizationIdAndId(organizationId(authentication), id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Blocked period not found"));
        blockedPeriods.delete(item);
    }

    private void apply(AvailabilityRule rule, RuleInput input, UUID organizationId) {
        rule.organizationId = organizationId;
        rule.bookableType = parseBookableType(input.bookableType());
        rule.bookableId = input.bookableId();
        rule.dayOfWeek = input.dayOfWeek();
        rule.opensAt = input.opensAt();
        rule.closesAt = input.closesAt();
        rule.slotIntervalMinutes = input.slotIntervalMinutes();
        rule.bufferBeforeMinutes = input.bufferBeforeMinutes();
        rule.bufferAfterMinutes = input.bufferAfterMinutes();
        rule.minimumNoticeMinutes = input.minimumNoticeMinutes();
        rule.maximumAdvanceDays = input.maximumAdvanceDays();
        rule.active = input.active();
    }

    private void apply(AvailabilityExceptionEntity item, ExceptionInput input, UUID organizationId) {
        item.organizationId = organizationId;
        item.bookableType = parseBookableType(input.bookableType());
        item.bookableId = input.bookableId();
        item.date = input.date();
        item.closed = input.closed();
        item.opensAt = input.closed() ? null : input.opensAt();
        item.closesAt = input.closed() ? null : input.closesAt();
    }

    private void apply(BlockedPeriod item, BlockedPeriodInput input, UUID organizationId) {
        item.organizationId = organizationId;
        item.bookableType = parseBookableType(input.bookableType());
        item.bookableId = input.bookableId();
        item.startAt = input.startAt();
        item.endAt = input.endAt();
        item.reason = blankToNull(input.reason());
    }

    private BookableType parseBookableType(String value) {
        try {
            BookableType type = BookableType.valueOf(value.trim().toUpperCase(Locale.ROOT));
            if (type == BookableType.CONSULTATION) throw new IllegalArgumentException();
            return type;
        } catch (RuntimeException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported bookable type");
        }
    }

    private void validateWindow(LocalTime opensAt, LocalTime closesAt) {
        if (!opensAt.isBefore(closesAt)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Opening time must be before closing time");
    }

    private void validateException(ExceptionInput input) {
        if (input.closed()) return;
        if (input.opensAt() == null || input.closesAt() == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Open exceptions require opening and closing times");
        validateWindow(input.opensAt(), input.closesAt());
    }

    private void validateRange(OffsetDateTime startAt, OffsetDateTime endAt) {
        if (!startAt.isBefore(endAt)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start must be before end");
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private UUID organizationId(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserAccount user)) {
            throw new IllegalStateException("Authenticated organization context is required.");
        }
        return user.organizationId;
    }

    private RuleResponse toRule(AvailabilityRule rule) {
        return new RuleResponse(rule.id, rule.bookableType.name(), rule.bookableId, rule.dayOfWeek, rule.opensAt, rule.closesAt,
            rule.slotIntervalMinutes, rule.bufferBeforeMinutes, rule.bufferAfterMinutes, rule.minimumNoticeMinutes, rule.maximumAdvanceDays, rule.active);
    }

    private ExceptionResponse toException(AvailabilityExceptionEntity item) {
        return new ExceptionResponse(item.id, item.bookableType.name(), item.bookableId, item.date, item.closed, item.opensAt, item.closesAt);
    }

    private BlockedPeriodResponse toBlockedPeriod(BlockedPeriod item) {
        return new BlockedPeriodResponse(item.id, item.bookableType.name(), item.bookableId, item.startAt, item.endAt, item.reason);
    }

    public record RuleInput(@NotBlank String bookableType, @NotNull UUID bookableId, @NotNull DayOfWeek dayOfWeek,
                            @NotNull LocalTime opensAt, @NotNull LocalTime closesAt,
                            @Min(1) @Max(1440) int slotIntervalMinutes,
                            @Min(0) @Max(1440) int bufferBeforeMinutes,
                            @Min(0) @Max(1440) int bufferAfterMinutes,
                            @Min(0) int minimumNoticeMinutes,
                            @Min(1) @Max(730) int maximumAdvanceDays,
                            boolean active) { }

    public record RuleResponse(UUID id, String bookableType, UUID bookableId, DayOfWeek dayOfWeek,
                               LocalTime opensAt, LocalTime closesAt, int slotIntervalMinutes,
                               int bufferBeforeMinutes, int bufferAfterMinutes, int minimumNoticeMinutes,
                               int maximumAdvanceDays, boolean active) { }

    public record ExceptionInput(@NotBlank String bookableType, @NotNull UUID bookableId, @NotNull LocalDate date,
                                 boolean closed, LocalTime opensAt, LocalTime closesAt) { }
    public record ExceptionResponse(UUID id, String bookableType, UUID bookableId, LocalDate date,
                                    boolean closed, LocalTime opensAt, LocalTime closesAt) { }

    public record BlockedPeriodInput(@NotBlank String bookableType, @NotNull UUID bookableId,
                                     @NotNull OffsetDateTime startAt, @NotNull OffsetDateTime endAt, String reason) { }
    public record BlockedPeriodResponse(UUID id, String bookableType, UUID bookableId,
                                        OffsetDateTime startAt, OffsetDateTime endAt, String reason) { }
}
