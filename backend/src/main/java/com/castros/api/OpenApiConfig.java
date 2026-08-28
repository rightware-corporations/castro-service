package com.castros.api;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(info = @Info(title = "Castro Digital Platform API", version = "v1", description = "Current backend foundation contract; business rules not represented here are not implied."))
@SecurityScheme(name = "sessionCookie", type = SecuritySchemeType.APIKEY, in = SecuritySchemeIn.COOKIE, paramName = "JSESSIONID", description = "Session cookie established by login. State-changing browser requests also require the XSRF-TOKEN cookie and X-XSRF-TOKEN header.")
public class OpenApiConfig { }
