package com.castros.shared.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "castros")
public class AppProperties {
    private String businessTimezone = "Africa/Maputo";
    private String[] allowedOrigins = new String[0];
    private boolean availabilityDevelopmentFallback = false;
    private boolean productionMode = false;
    private boolean trustProxyHeaders = false;
    private int loginRateLimitPerMinute = 10;
    private int publicMutationRateLimitPerMinute = 30;

    public String getBusinessTimezone() { return businessTimezone; }
    public void setBusinessTimezone(String value) { businessTimezone = value; }
    public String[] getAllowedOrigins() { return allowedOrigins; }
    public void setAllowedOrigins(String[] value) { allowedOrigins = value; }
    public boolean isAvailabilityDevelopmentFallback() { return availabilityDevelopmentFallback; }
    public void setAvailabilityDevelopmentFallback(boolean value) { availabilityDevelopmentFallback = value; }
    public boolean isProductionMode() { return productionMode; }
    public void setProductionMode(boolean value) { productionMode = value; }
    public boolean isTrustProxyHeaders() { return trustProxyHeaders; }
    public void setTrustProxyHeaders(boolean value) { trustProxyHeaders = value; }
    public int getLoginRateLimitPerMinute() { return loginRateLimitPerMinute; }
    public void setLoginRateLimitPerMinute(int value) { loginRateLimitPerMinute = value; }
    public int getPublicMutationRateLimitPerMinute() { return publicMutationRateLimitPerMinute; }
    public void setPublicMutationRateLimitPerMinute(int value) { publicMutationRateLimitPerMinute = value; }
}
