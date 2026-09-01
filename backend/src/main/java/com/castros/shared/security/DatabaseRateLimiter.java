package com.castros.shared.security;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class DatabaseRateLimiter {
    private final JdbcTemplate jdbc;
    private final AtomicLong operations = new AtomicLong();

    public DatabaseRateLimiter(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public boolean allow(String scope, String clientIdentity, int limitPerMinute) {
        if (limitPerMinute <= 0) return false;
        OffsetDateTime window = OffsetDateTime.now(ZoneOffset.UTC).truncatedTo(ChronoUnit.MINUTES);
        String key = scope + ":" + sha256(clientIdentity == null ? "unknown" : clientIdentity);
        Integer count = jdbc.queryForObject("""
            insert into request_rate_limits(bucket_key, window_start, request_count)
            values (?, ?, 1)
            on conflict (bucket_key, window_start)
            do update set request_count = request_rate_limits.request_count + 1
            returning request_count
            """, Integer.class, key, window);
        if (operations.incrementAndGet() % 1000 == 0) {
            jdbc.update("delete from request_rate_limits where window_start < now() - interval '2 days'");
        }
        return count != null && count <= limitPerMinute;
    }

    private String sha256(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("SHA-256 unavailable", exception);
        }
    }
}
