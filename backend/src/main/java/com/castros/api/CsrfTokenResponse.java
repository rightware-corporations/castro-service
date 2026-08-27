package com.castros.api;
public record CsrfTokenResponse(String token, String headerName, String parameterName) { }
