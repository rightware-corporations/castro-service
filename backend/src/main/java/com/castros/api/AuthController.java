package com.castros.api;

import com.castros.platform.PlatformPrincipal;
import com.castros.shared.config.AppProperties;
import com.castros.shared.exception.ProblemDetailResponse;
import com.castros.shared.security.DatabaseRateLimiter;
import com.castros.user.UserAccount;
import com.castros.user.UserRepository;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository contextRepository;
    private final DatabaseRateLimiter rateLimiter;
    private final AppProperties properties;
    private final UserRepository users;

    public AuthController(AuthenticationManager authenticationManager,
                          SecurityContextRepository contextRepository,
                          DatabaseRateLimiter rateLimiter,
                          AppProperties properties,
                          UserRepository users) {
        this.authenticationManager = authenticationManager;
        this.contextRepository = contextRepository;
        this.rateLimiter = rateLimiter;
        this.properties = properties;
        this.users = users;
    }

    @PostMapping("/login")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Session established"),
        @ApiResponse(responseCode = "400", content = @Content(schema = @Schema(implementation = ProblemDetailResponse.class))),
        @ApiResponse(responseCode = "401", content = @Content(schema = @Schema(implementation = ProblemDetailResponse.class))),
        @ApiResponse(responseCode = "429", description = "Login attempt rate limited")
    })
    public AuthLoginResponse login(@Valid @RequestBody LoginInput input, HttpServletRequest request, HttpServletResponse response) {
        String accountKey = input.email().trim().toLowerCase(Locale.ROOT);
        try {
            if (!rateLimiter.allow("login-account", accountKey, properties.getLoginRateLimitPerMinute())) {
                throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Too many login attempts");
            }
        } catch (DataAccessException exception) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Login protection unavailable");
        }

        Authentication auth = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(input.email(), input.password()));
        request.getSession(true);
        request.changeSessionId();
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(auth);
        SecurityContextHolder.setContext(context);
        contextRepository.saveContext(context, request, response);
        UserAccount user = (UserAccount) auth.getPrincipal();
        return new AuthLoginResponse(user.email, true, user.organizationId, user.firstName, user.lastName, experience(user), permissions(auth));
    }

    @PostMapping("/logout")
    @ApiResponses({@ApiResponse(responseCode = "200", description = "Session ended"), @ApiResponse(responseCode = "403", content = @Content(schema = @Schema(implementation = ProblemDetailResponse.class)))})
    public AuthLogoutResponse logout(Authentication auth, HttpServletRequest request, HttpServletResponse response) {
        new SecurityContextLogoutHandler().logout(request, response, auth);
        return new AuthLogoutResponse(true);
    }

    @GetMapping("/csrf")
    @ApiResponse(responseCode = "200", description = "CSRF token delivered in XSRF-TOKEN cookie")
    public CsrfTokenResponse csrf(CsrfToken token) { return new CsrfTokenResponse(token.getToken(), token.getHeaderName(), token.getParameterName()); }

    @GetMapping("/me")
    @SecurityRequirement(name = "sessionCookie")
    @ApiResponses({@ApiResponse(responseCode = "200", description = "Current session"), @ApiResponse(responseCode = "401", content = @Content(schema = @Schema(implementation = ProblemDetailResponse.class)))})
    public AuthMeResponse me(Authentication auth) {
        Object principal = auth.getPrincipal();
        if (principal instanceof PlatformPrincipal platform) {
            return new AuthMeResponse(platform.email(), true, null, platform.firstName(), platform.lastName(), null, permissions(auth));
        }
        if (!(principal instanceof UserAccount user)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unsupported session principal");
        }
        return new AuthMeResponse(user.email, true, user.organizationId, user.firstName, user.lastName, experience(user), permissions(auth));
    }

    private String experience(UserAccount user) {
        if (user.id == null || user.organizationId == null) return "OPERATIONS";
        return users.findExperienceType(user.id, user.organizationId).orElse("OPERATIONS");
    }

    private List<String> permissions(Authentication auth) { return auth.getAuthorities().stream().map(GrantedAuthority::getAuthority).sorted().toList(); }

    public record LoginInput(@Email @NotBlank String email, @NotBlank String password) {}
}
