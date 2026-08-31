package com.castros.api;

import com.castros.user.UserAccount;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeParseException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.FORBIDDEN;

@RestController
@RequestMapping("/api/v1/operations/reports")
public class InternalReportController {
    private final JdbcTemplate jdbc;

    public InternalReportController(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    @GetMapping("/summary")
    @PreAuthorize("hasAuthority('report.read')")
    public ReportSummary summary(@RequestParam String from, @RequestParam String to, Authentication authentication) {
        UUID organizationId = organizationId(authentication);
        OffsetDateTime start = parse(from, "from");
        OffsetDateTime end = parse(to, "to");
        if (!start.isBefore(end)) throw new ResponseStatusException(BAD_REQUEST, "from must be before to");
        if (Duration.between(start, end).toDays() > 366) throw new ResponseStatusException(BAD_REQUEST, "Report range cannot exceed 366 days");

        long requests = count("requests", organizationId, start, end);
        long bookings = count("bookings", organizationId, start, end);
        long customers = count("customers", organizationId, start, end);
        long tasks = count("tasks", organizationId, start, end);

        return new ReportSummary(
            start, end, requests, bookings, customers, tasks,
            statusCounts("requests", organizationId, start, end),
            statusCounts("bookings", organizationId, start, end),
            daily(organizationId, start, end)
        );
    }

    private long count(String table, UUID org, OffsetDateTime from, OffsetDateTime to) {
        Long value = jdbc.queryForObject("select count(*) from " + table + " where organization_id=? and created_at>=? and created_at<?", Long.class, org, from, to);
        return value == null ? 0 : value;
    }

    private Map<String, Long> statusCounts(String table, UUID org, OffsetDateTime from, OffsetDateTime to) {
        Map<String, Long> result = new LinkedHashMap<>();
        jdbc.query("select status,count(*) total from " + table + " where organization_id=? and created_at>=? and created_at<? group by status order by status",
            rs -> result.put(rs.getString("status"), rs.getLong("total")), org, from, to);
        return result;
    }

    private List<DailyActivity> daily(UUID org, OffsetDateTime from, OffsetDateTime to) {
        return jdbc.query("""
            with activity as (
              select created_at,'REQUEST' kind from requests where organization_id=? and created_at>=? and created_at<?
              union all
              select created_at,'BOOKING' kind from bookings where organization_id=? and created_at>=? and created_at<?
              union all
              select created_at,'CUSTOMER' kind from customers where organization_id=? and created_at>=? and created_at<?
              union all
              select created_at,'TASK' kind from tasks where organization_id=? and created_at>=? and created_at<?
            )
            select to_char((created_at at time zone 'UTC')::date,'YYYY-MM-DD') day,
                   count(*) filter (where kind='REQUEST') requests,
                   count(*) filter (where kind='BOOKING') bookings,
                   count(*) filter (where kind='CUSTOMER') customers,
                   count(*) filter (where kind='TASK') tasks
            from activity
            group by day
            order by day
            """, (rs,row) -> new DailyActivity(
                rs.getString("day"), rs.getLong("requests"), rs.getLong("bookings"), rs.getLong("customers"), rs.getLong("tasks")
            ), org,from,to, org,from,to, org,from,to, org,from,to);
    }

    private OffsetDateTime parse(String value, String field) {
        try { return OffsetDateTime.parse(value).withOffsetSameInstant(ZoneOffset.UTC); }
        catch (DateTimeParseException ex) { throw new ResponseStatusException(BAD_REQUEST, field + " must be an ISO-8601 offset datetime"); }
    }

    private UUID organizationId(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserAccount user) || user.organizationId == null) {
            throw new ResponseStatusException(FORBIDDEN, "Organization context required");
        }
        return user.organizationId;
    }

    public record ReportSummary(
        OffsetDateTime from, OffsetDateTime to,
        long requestsCreated, long bookingsCreated, long customersCreated, long tasksCreated,
        Map<String,Long> requestStatuses, Map<String,Long> bookingStatuses,
        List<DailyActivity> daily
    ) {}
    public record DailyActivity(String date,long requests,long bookings,long customers,long tasks) {}
}
