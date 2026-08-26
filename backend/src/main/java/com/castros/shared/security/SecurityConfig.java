package com.castros.shared.security;

import com.castros.user.UserAccount;
import com.castros.user.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {
    @Bean PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(12); }
    @Bean UserDetailsService userDetailsService(UserRepository users) {
        return username -> users.findByEmailIgnoreCase(username).orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
    @Bean AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception { return configuration.getAuthenticationManager(); }
    @Bean SecurityContextRepository securityContextRepository() { return new HttpSessionSecurityContextRepository(); }
    @Bean SecurityFilterChain filterChain(HttpSecurity http, UserDetailsService details, PasswordEncoder encoder) throws Exception {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(details); provider.setPasswordEncoder(encoder);
        http.authenticationProvider(provider)
            .csrf(csrf -> csrf.ignoringRequestMatchers("/api/v1/public/**", "/api/v1/auth/login"))
            .cors(cors -> { })
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/public/**", "/api/v1/auth/login", "/api/v1/auth/logout", "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html", "/actuator/health", "/actuator/readiness").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/services/**", "/api/v1/courses/**", "/api/v1/spaces/**", "/api/v1/availability").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/bookings/*").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/bookings", "/api/v1/requests").permitAll()
                .anyRequest().authenticated())
            .httpBasic(basic -> { });
        return http.build();
    }
}
