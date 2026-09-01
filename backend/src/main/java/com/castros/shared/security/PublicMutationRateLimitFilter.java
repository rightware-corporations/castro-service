package com.castros.shared.security;

import com.castros.shared.config.AppProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.dao.DataAccessException;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 20)
public class PublicMutationRateLimitFilter extends OncePerRequestFilter {
    private final DatabaseRateLimiter limiter;
    private final AppProperties properties;

    public PublicMutationRateLimitFilter(DatabaseRateLimiter limiter, AppProperties properties) {
        this.limiter = limiter;
        this.properties = properties;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        LimitRule rule = rule(request);
        if (rule == null) {
            filterChain.doFilter(request, response);
            return;
        }
        try {
            if (!limiter.allow(rule.scope(), clientIdentity(request), rule.limit())) {
                response.setStatus(429);
                response.setHeader("Retry-After", "60");
                response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
                response.getWriter().write("{\"status\":429,\"code\":\"RATE_LIMITED\",\"message\":\"Too many requests\"}");
                return;
            }
        } catch (DataAccessException exception) {
            response.setStatus(503);
            response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
            response.getWriter().write("{\"status\":503,\"code\":\"SECURITY_SERVICE_UNAVAILABLE\",\"message\":\"Request protection unavailable\"}");
            return;
        }
        filterChain.doFilter(request, response);
    }

    private LimitRule rule(HttpServletRequest request) {
        if (!"POST".equalsIgnoreCase(request.getMethod())) return null;
        String path = request.getRequestURI();
        if ("/api/v1/auth/login".equals(path)) return new LimitRule("login", properties.getLoginRateLimitPerMinute());
        if ("/api/v1/bookings".equals(path) || "/api/v1/requests".equals(path)) {
            return new LimitRule("public-write", properties.getPublicMutationRateLimitPerMinute());
        }
        return null;
    }

    private String clientIdentity(HttpServletRequest request) {
        if (properties.isTrustProxyHeaders()) {
            String forwarded = request.getHeader("X-Forwarded-For");
            if (forwarded != null && !forwarded.isBlank()) return forwarded.split(",", 2)[0].trim();
        }
        return request.getRemoteAddr();
    }

    private record LimitRule(String scope, int limit) { }
}
