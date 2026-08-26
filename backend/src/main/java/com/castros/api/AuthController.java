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
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController @RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthenticationManager authenticationManager; private final SecurityContextRepository contextRepository;
    public AuthController(AuthenticationManager authenticationManager,SecurityContextRepository contextRepository){this.authenticationManager=authenticationManager;this.contextRepository=contextRepository;}
    @PostMapping("/login") public Map<String,Object> login(@Valid @RequestBody LoginInput input,HttpServletRequest request,HttpServletResponse response){Authentication auth=authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(input.email(),input.password()));SecurityContext context=SecurityContextHolder.createEmptyContext();context.setAuthentication(auth);SecurityContextHolder.setContext(context);contextRepository.saveContext(context,request,response);return Map.of("email",auth.getName(),"authenticated",true);}
    @PostMapping("/logout") public Map<String,Object> logout(Authentication auth,HttpServletRequest request,HttpServletResponse response){new SecurityContextLogoutHandler().logout(request,response,auth);return Map.of("loggedOut",true);}
    @GetMapping("/me") public Map<String,Object> me(Authentication auth){return Map.of("email",auth.getName(),"authenticated",true);}
    public record LoginInput(@Email @NotBlank String email,@NotBlank String password){}
}
