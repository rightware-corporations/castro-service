package com.castros.api;

import com.castros.user.UserAccount;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.security.authentication.*;
import org.springframework.security.core.*;
import org.springframework.security.core.context.*;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import com.castros.shared.exception.ProblemDetailResponse;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthenticationManager authenticationManager; private final SecurityContextRepository contextRepository;
    public AuthController(AuthenticationManager authenticationManager,SecurityContextRepository contextRepository){this.authenticationManager=authenticationManager;this.contextRepository=contextRepository;}
    @PostMapping("/login")
    @ApiResponses({@ApiResponse(responseCode="200", description="Session established"), @ApiResponse(responseCode="400", content=@Content(schema=@Schema(implementation=ProblemDetailResponse.class))), @ApiResponse(responseCode="401", content=@Content(schema=@Schema(implementation=ProblemDetailResponse.class)))})
    public AuthLoginResponse login(@Valid @RequestBody LoginInput input,HttpServletRequest request,HttpServletResponse response){Authentication auth=authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(input.email(),input.password()));SecurityContext context=SecurityContextHolder.createEmptyContext();context.setAuthentication(auth);SecurityContextHolder.setContext(context);contextRepository.saveContext(context,request,response);return new AuthLoginResponse(auth.getName(), true);}
    @PostMapping("/logout")
    @ApiResponses({@ApiResponse(responseCode="200", description="Session ended"), @ApiResponse(responseCode="403", content=@Content(schema=@Schema(implementation=ProblemDetailResponse.class)))})
    public AuthLogoutResponse logout(Authentication auth,HttpServletRequest request,HttpServletResponse response){new SecurityContextLogoutHandler().logout(request,response,auth);return new AuthLogoutResponse(true);}
    @GetMapping("/csrf")
    @ApiResponse(responseCode="200", description="CSRF token delivered in XSRF-TOKEN cookie")
    public CsrfTokenResponse csrf(CsrfToken token){return new CsrfTokenResponse(token.getToken(), token.getHeaderName(), token.getParameterName());}
    @GetMapping("/me")
    @SecurityRequirement(name="sessionCookie")
    @ApiResponses({@ApiResponse(responseCode="200", description="Current session"), @ApiResponse(responseCode="401", content=@Content(schema=@Schema(implementation=ProblemDetailResponse.class)))})
    public AuthMeResponse me(Authentication auth){return new AuthMeResponse(auth.getName(), true);}
    public record LoginInput(@Email @NotBlank String email,@NotBlank String password){}
}
