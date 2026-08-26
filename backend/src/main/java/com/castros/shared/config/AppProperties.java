package com.castros.shared.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "castros")
public class AppProperties {
    private String businessTimezone = "Africa/Maputo";
    private String[] allowedOrigins = new String[0];
    public String getBusinessTimezone() { return businessTimezone; }
    public void setBusinessTimezone(String value) { businessTimezone = value; }
    public String[] getAllowedOrigins() { return allowedOrigins; }
    public void setAllowedOrigins(String[] value) { allowedOrigins = value; }
}
