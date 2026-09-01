package com.castros.audit;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Configuration
public class PrivilegedMutationAuditConfig implements WebMvcConfigurer {
    private final AuditEventService audit;

    public PrivilegedMutationAuditConfig(AuditEventService audit) { this.audit = audit; }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new MutationAuditInterceptor(audit)).addPathPatterns("/api/v1/operations/**");
    }

    static final class MutationAuditInterceptor implements HandlerInterceptor {
        private static final Pattern UUID_PATTERN = Pattern.compile("[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}");
        private final AuditEventService audit;

        MutationAuditInterceptor(AuditEventService audit) { this.audit = audit; }

        @Override
        public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception exception) {
            if (exception != null || response.getStatus() >= 400 || !isMutation(request.getMethod())) return;
            String path = request.getRequestURI();
            if (path.contains("/audit") || path.contains("/scenes") || path.contains("/hotspots")) return;
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UUID entityId = lastUuid(path);
            if (entityId == null) entityId = UUID.nameUUIDFromBytes(path.getBytes(StandardCharsets.UTF_8));
            audit.record(authentication, request.getMethod().toUpperCase(Locale.ROOT), entityType(path), entityId,
                "path=" + path + ";status=" + response.getStatus());
        }

        private static boolean isMutation(String method) {
            return "POST".equalsIgnoreCase(method) || "PUT".equalsIgnoreCase(method) || "PATCH".equalsIgnoreCase(method) || "DELETE".equalsIgnoreCase(method);
        }

        private static UUID lastUuid(String path) {
            Matcher matcher = UUID_PATTERN.matcher(path);
            UUID result = null;
            while (matcher.find()) result = UUID.fromString(matcher.group());
            return result;
        }

        private static String entityType(String path) {
            String relative = path.replaceFirst("^/api/v1/operations/?", "");
            String first = relative.isBlank() ? "OPERATIONS" : relative.split("/")[0];
            return first.replace('-', '_').toUpperCase(Locale.ROOT) + "_MUTATION";
        }
    }
}
