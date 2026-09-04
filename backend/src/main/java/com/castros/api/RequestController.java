package com.castros.api;

import com.castros.catalog.Course;
import com.castros.catalog.CourseRepository;
import com.castros.catalog.ServiceEntity;
import com.castros.catalog.ServiceRepository;
import com.castros.catalog.Space;
import com.castros.catalog.SpaceRepository;
import com.castros.customer.Customer;
import com.castros.customer.CustomerRepository;
import com.castros.organization.OrganizationRepository;
import com.castros.request.RequestEntity;
import com.castros.request.RequestRepository;
import com.castros.request.RequestSourceType;
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
    private final ServiceRepository services;
    private final CourseRepository courses;
    private final SpaceRepository spaces;

    public RequestController(RequestRepository requests, CustomerRepository customers, OrganizationRepository organizations,
                             ServiceRepository services, CourseRepository courses, SpaceRepository spaces) {
        this.requests = requests;
        this.customers = customers;
        this.organizations = organizations;
        this.services = services;
        this.courses = courses;
        this.spaces = spaces;
    }

    @PostMapping
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Request accepted"),
        @ApiResponse(responseCode = "400", content = @Content(schema = @Schema(implementation = ProblemDetailResponse.class))),
        @ApiResponse(responseCode = "409", content = @Content(schema = @Schema(implementation = ProblemDetailResponse.class)))
    })
    @Transactional
    public RequestResponse create(@RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
                                  @Valid @RequestBody RequestInput input) {
        UUID org = organizations.findAll().stream().filter(o -> o.active).findFirst().map(o -> o.id)
            .orElseThrow(() -> new ApiException("RESOURCE_NOT_FOUND", "No active organization is configured.", HttpStatus.NOT_FOUND));
        CanonicalRequestContext context = canonicalizeContext(org, input.context());
        String key = normalizeKey(idempotencyKey);
        String fingerprint = fingerprint(input, context);
        if (key != null) {
            Optional<RequestEntity> prior = requests.findByOrganizationIdAndIdempotencyKey(org, key);
            if (prior.isPresent()) return replayOrReject(prior.get(), fingerprint);
        }

        Customer customer = findCustomer(org, input);
        if (customer == null) {
            customer = customers.save(new Customer(org, input.firstName(), input.lastName(), input.email(), input.phone(), "PUBLIC_REQUEST"));
        }

        RequestEntity request = new RequestEntity(org, customer.id, input.type(), input.message());
        request.idempotencyKey = key;
        request.idempotencyFingerprint = fingerprint;
        applyContext(request, context);
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

    private CanonicalRequestContext canonicalizeContext(UUID org, RequestContextInput input) {
        if (input == null) return null;
        RequestSourceType source = input.sourceType();
        if (source == RequestSourceType.GENERAL) {
            if (input.entityId() != null) throw invalidContext("A general request cannot reference a catalog entity.");
            return new CanonicalRequestContext(source, null, null, null,
                clip(input.cta(), 80), clip(input.sourcePath(), 500), clip(input.entryPath(), 500),
                blankToNull(input.referrer()), clip(input.utmSource(), 200), clip(input.utmMedium(), 200), clip(input.utmCampaign(), 200));
        }
        if (input.entityId() == null) throw invalidContext("The selected source requires an entity id.");

        return switch (source) {
            case SERVICE -> {
                ServiceEntity service = services.findByOrganizationIdAndId(org, input.entityId()).filter(value -> value.active)
                    .orElseThrow(() -> invalidContext("The referenced service is not available."));
                yield canonical(source, service.id, service.slug, service.name, input);
            }
            case TRAINING -> {
                Course course = courses.findByOrganizationIdAndId(org, input.entityId()).filter(value -> value.active)
                    .orElseThrow(() -> invalidContext("The referenced training is not available."));
                yield canonical(source, course.id, course.slug, course.name, input);
            }
            case SPACE -> {
                Space space = spaces.findByOrganizationIdAndId(org, input.entityId()).filter(value -> value.active)
                    .orElseThrow(() -> invalidContext("The referenced space is not available."));
                yield canonical(source, space.id, space.slug, space.name, input);
            }
            case GENERAL -> throw new IllegalStateException("GENERAL is handled before entity resolution");
        };
    }

    private CanonicalRequestContext canonical(RequestSourceType source, UUID id, String slug, String name, RequestContextInput input) {
        return new CanonicalRequestContext(source, id, clip(slug, 220), clip(name, 200),
            clip(input.cta(), 80), clip(input.sourcePath(), 500), clip(input.entryPath(), 500),
            blankToNull(input.referrer()), clip(input.utmSource(), 200), clip(input.utmMedium(), 200), clip(input.utmCampaign(), 200));
    }

    private void applyContext(RequestEntity request, CanonicalRequestContext context) {
        if (context == null) return;
        request.sourceType = context.sourceType();
        request.sourceEntityId = context.entityId();
        request.sourceEntitySlug = context.entitySlug();
        request.sourceEntityName = context.entityName();
        request.sourceCta = context.cta();
        request.sourcePath = context.sourcePath();
        request.entryPath = context.entryPath();
        request.referrer = context.referrer();
        request.utmSource = context.utmSource();
        request.utmMedium = context.utmMedium();
        request.utmCampaign = context.utmCampaign();
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
        if (!Objects.equals(prior.idempotencyFingerprint, fingerprint)) {
            throw new ApiException("IDEMPOTENCY_KEY_REUSED", "The idempotency key was already used with a different request.", HttpStatus.CONFLICT);
        }
        return new RequestResponse(prior.id, prior.status.name());
    }

    private String normalizeKey(String value) {
        if (value == null || value.isBlank()) return null;
        String key = value.trim();
        if (key.length() > 255) throw new ApiException("VALIDATION_FAILED", "Idempotency-Key must be 255 characters or fewer.", HttpStatus.BAD_REQUEST);
        return key;
    }

    private String fingerprint(RequestInput input, CanonicalRequestContext context) {
        String contextValue = context == null ? "" : String.join("|",
            String.valueOf(context.sourceType()), String.valueOf(context.entityId()), String.valueOf(context.entitySlug()),
            String.valueOf(context.cta()), String.valueOf(context.sourcePath()), String.valueOf(context.entryPath()),
            String.valueOf(context.referrer()), String.valueOf(context.utmSource()), String.valueOf(context.utmMedium()), String.valueOf(context.utmCampaign()));
        String value = String.join("|", input.firstName(), input.lastName(), String.valueOf(input.email()), String.valueOf(input.phone()),
            input.type().name(), String.valueOf(input.message()), contextValue);
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is required", ex);
        }
    }

    private ApiException invalidContext(String message) {
        return new ApiException("VALIDATION_FAILED", message, HttpStatus.BAD_REQUEST);
    }

    private String clip(String value, int max) {
        String normalized = blankToNull(value);
        if (normalized == null) return null;
        return normalized.length() <= max ? normalized : normalized.substring(0, max);
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    public record RequestInput(@NotBlank String firstName, @NotBlank String lastName, @Email @NotBlank String email,
                               String phone, @NotNull RequestType type, String message, @Valid RequestContextInput context) { }

    public record RequestContextInput(@NotNull RequestSourceType sourceType, UUID entityId, String cta, String sourcePath,
                                      String entryPath, String referrer, String utmSource, String utmMedium, String utmCampaign) { }

    private record CanonicalRequestContext(RequestSourceType sourceType, UUID entityId, String entitySlug, String entityName,
                                           String cta, String sourcePath, String entryPath, String referrer,
                                           String utmSource, String utmMedium, String utmCampaign) { }
}
