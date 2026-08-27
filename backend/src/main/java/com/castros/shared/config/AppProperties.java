package com.castros.shared.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "castros")
public class AppProperties {
    private String businessTimezone = "Africa/Maputo";
    private String[] allowedOrigins = new String[0];
    private boolean availabilityDevelopmentFallback = false;
    public String getBusinessTimezone() { return businessTimezone; }
    public void setBusinessTimezone(String value) { businessTimezone = value; }
    public String[] getAllowedOrigins() { return allowedOrigins; }
    public void setAllowedOrigins(String[] value) { allowedOrigins = value; }
    public boolean isAvailabilityDevelopmentFallback() { return availabilityDevelopmentFallback; }
    public void setAvailabilityDevelopmentFallback(boolean value) { availabilityDevelopmentFallback = value; }
}
