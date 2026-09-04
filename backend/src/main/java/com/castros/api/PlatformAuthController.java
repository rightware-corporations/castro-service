package com.castros.api;

import com.castros.platform.PlatformPrincipal;
import com.castros.shared.config.AppProperties;
import com.castros.shared.security.DatabaseRateLimiter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/platform/auth")
public class PlatformAuthController {
    private final JdbcTemplate jdbc;
    private final PasswordEncoder encoder;
    private final SecurityContextRepository contextRepository;
    private final DatabaseRateLimiter rateLimiter;
    private final AppProperties properties;

    public PlatformAuthController(JdbcTemplate jdbc,
                                  PasswordEncoder encoder,
                                  SecurityContextRepository contextRepository,
                                  DatabaseRateLimiter rateLimiter,
                                  AppProperties properties) {
        this.jdbc = jdbc;
        this.encoder = encoder;
        this.contextRepository = contextRepository;
        this.rateLimiter = rateLimiter;
        this.properties = properties;
    }

    @PostMapping("/login")
    public AuthLoginResponse login(@Valid @RequestBody LoginInput input, HttpServletRequest request, HttpServletResponse response) {
        String email = input.email().trim().toLowerCase(Locale.ROOT);
        try {
            if (!rateLimiter.allow("platform-login-account", email, properties.getLoginRateLimitPerMinute())) {
                throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Too many login attempts");
            }
        } catch (DataAccessException exception) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Login protection unavailable");
        }

        PlatformAccount account = jdbc.query("""
            select id,email,password_hash,first_name,last_name,active
            from platform_administrators
            where lower(email)=lower(?)
            """, rs -> rs.next() ? new PlatformAccount(
                rs.getObject("id", UUID.class), rs.getString("email"), rs.getString("password_hash"),
                rs.getString("first_name"), rs.getString("last_name"), rs.getBoolean("active")) : null, email);

        if (account == null || !account.active() || !encoder.matches(input.password(), account.passwordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        OffsetDateTime now = OffsetDateTime.now();
        jdbc.update("update platform_administrators set last_login_at=? where id=?", now, account.id());
        jdbc.update("""
            insert into platform_audit_events(id,actor_platform_admin_id,action,entity_type,entity_id,details,created_at)
            values (?,?,?,?,?,?,?)
            """, UUID.randomUUID(), account.id(), "PLATFORM_LOGIN", "PLATFORM_ADMIN", account.id(), "Platform session established", now);

        PlatformPrincipal principal = new PlatformPrincipal(account.id(), account.email(), account.firstName(), account.lastName());
        List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("platform.admin"));
        Authentication authentication = new UsernamePasswordAuthenticationToken(principal, null, authorities);

        request.getSession(true);
        request.changeSessionId();
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        contextRepository.saveContext(context, request, response);

        return new AuthLoginResponse(account.email(), true, null, account.firstName(), account.lastName(), null, List.of("platform.admin"));
    }

    @GetMapping("/csrf")
    public CsrfTokenResponse csrf(CsrfToken token) {
        return new CsrfTokenResponse(token.getToken(), token.getHeaderName(), token.getParameterName());
    }

    @GetMapping("/me")
    public AuthMeResponse me(Authentication authentication) {
        PlatformPrincipal principal = principal(authentication);
        return new AuthMeResponse(principal.email(), true, null, principal.firstName(), principal.lastName(), null, List.of("platform.admin"));
    }

    @PostMapping("/logout")
    public AuthLogoutResponse logout(Authentication authentication, HttpServletRequest request, HttpServletResponse response) {
        PlatformPrincipal principal = principal(authentication);
        jdbc.update("""
            insert into platform_audit_events(id,actor_platform_admin_id,action,entity_type,entity_id,details,created_at)
            values (?,?,?,?,?,?,?)
            """, UUID.randomUUID(), principal.id(), "PLATFORM_LOGOUT", "PLATFORM_ADMIN", principal.id(), "Platform session ended", OffsetDateTime.now());
        new SecurityContextLogoutHandler().logout(request, response, authentication);
        return new AuthLogoutResponse(true);
    }

    private PlatformPrincipal principal(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof PlatformPrincipal principal)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Platform session required");
        }
        return principal;
    }

    public record LoginInput(@Email @NotBlank String email, @NotBlank String password) { }
    private record PlatformAccount(UUID id, String email, String passwordHash, String firstName, String lastName, boolean active) { }
}
