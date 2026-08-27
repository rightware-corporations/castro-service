package com.castros.api;

import com.castros.customer.Customer;
import com.castros.customer.CustomerRepository;
import com.castros.organization.OrganizationRepository;
import com.castros.request.RequestEntity;
import com.castros.request.RequestRepository;
import com.castros.request.RequestType;
import com.castros.shared.exception.ApiException;
import com.castros.shared.exception.ProblemDetailResponse;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.*;

@RestController
@RequestMapping("/api/v1/requests")
public class RequestController {
    private final RequestRepository requests;
    private final CustomerRepository customers;
    private final OrganizationRepository organizations;

    public RequestController(RequestRepository requests, CustomerRepository customers, OrganizationRepository organizations) {
        this.requests = requests; this.customers = customers; this.organizations = organizations;
    }

    @PostMapping
    @ApiResponses({@ApiResponse(responseCode="200", description="Request accepted"), @ApiResponse(responseCode="400", content=@Content(schema=@Schema(implementation=ProblemDetailResponse.class))), @ApiResponse(responseCode="409", content=@Content(schema=@Schema(implementation=ProblemDetailResponse.class)))})
    @Transactional
    public RequestResponse create(@RequestHeader(value="Idempotency-Key", required=false) String idempotencyKey,
                                  @Valid @RequestBody RequestInput input) {
        UUID org = organizations.findAll().stream().filter(o -> o.active).findFirst().map(o -> o.id)
                .orElseThrow(() -> new ApiException("RESOURCE_NOT_FOUND", "No active organization is configured.", HttpStatus.NOT_FOUND));
        String key = normalizeKey(idempotencyKey);
        String fingerprint = fingerprint(input);
        if (key != null) {
            Optional<RequestEntity> prior = requests.findByOrganizationIdAndIdempotencyKey(org, key);
            if (prior.isPresent()) return replayOrReject(prior.get(), fingerprint);
        }
        Customer customer = findCustomer(org, input);
        if (customer == null) customer = customers.save(new Customer(org, input.firstName(), input.lastName(), input.email(), input.phone(), "PUBLIC_REQUEST"));
        RequestEntity request = new RequestEntity(org, customer.id, input.type(), input.message());
        request.idempotencyKey = key; request.idempotencyFingerprint = fingerprint;
        try {
            RequestEntity saved = requests.saveAndFlush(request);
            return new RequestResponse(saved.id, saved.status.name());
        } catch (DataIntegrityViolationException ex) {
            if (key != null) {
                Optional<RequestEntity> prior = requests.findByOrganizationIdAndIdempotencyKey(org, key);
                if (prior.isPresent()) return replayOrReject(prior.get(), fingerprint);
            }
            throw new ApiException("DUPLICATE_RESOURCE", "The request conflicts with existing data.", HttpStatus.CONFLICT);
        }
    }

    private Customer findCustomer(UUID org, RequestInput input) {
        if (input.email() != null && !input.email().isBlank()) {
            Optional<Customer> byEmail = customers.findFirstByOrganizationIdAndEmailIgnoreCase(org, input.email());
            if (byEmail.isPresent()) return byEmail.get();
        }
        if (input.phone() != null && !input.phone().isBlank()) return customers.findFirstByOrganizationIdAndPhone(org, input.phone()).orElse(null);
        return null;
    }

    private RequestResponse replayOrReject(RequestEntity prior, String fingerprint) {
        if (!Objects.equals(prior.idempotencyFingerprint, fingerprint)) throw new ApiException("IDEMPOTENCY_KEY_REUSED", "The idempotency key was already used with a different request.", HttpStatus.CONFLICT);
        return new RequestResponse(prior.id, prior.status.name());
    }

    private String normalizeKey(String value) {
        if (value == null || value.isBlank()) return null;
        String key = value.trim();
        if (key.length() > 255) throw new ApiException("VALIDATION_FAILED", "Idempotency-Key must be 255 characters or fewer.", HttpStatus.BAD_REQUEST);
        return key;
    }

    private String fingerprint(RequestInput input) {
        String value = String.join("|", input.firstName(), input.lastName(), String.valueOf(input.email()), String.valueOf(input.phone()), input.type().name(), String.valueOf(input.message()));
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8))); }
        catch (NoSuchAlgorithmException ex) { throw new IllegalStateException("SHA-256 is required", ex); }
    }

    public record RequestInput(@NotBlank String firstName, @NotBlank String lastName, @Email @NotBlank String email,
                               String phone, @NotNull RequestType type, String message) { }
}
