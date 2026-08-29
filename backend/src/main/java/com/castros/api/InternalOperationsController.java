package com.castros.api;

import com.castros.booking.Booking;
import com.castros.booking.BookingRepository;
import com.castros.booking.BookingStatus;
import com.castros.customer.Customer;
import com.castros.customer.CustomerRepository;
import com.castros.request.RequestEntity;
import com.castros.request.RequestRepository;
import com.castros.request.RequestStatus;
import com.castros.user.UserAccount;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/operations")
public class InternalOperationsController {
    private final RequestRepository requests;
    private final BookingRepository bookings;
    private final CustomerRepository customers;

    public InternalOperationsController(RequestRepository requests, BookingRepository bookings, CustomerRepository customers) {
        this.requests = requests;
        this.bookings = bookings;
        this.customers = customers;
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAuthority('dashboard.read')")
    public OperationsSummary summary(Authentication authentication) {
        UUID organizationId = organizationId(authentication);
        return new OperationsSummary(
            requests.findAllByOrganizationIdOrderByCreatedAtDesc(organizationId).size(),
            bookings.findAllByOrganizationIdOrderByStartAtDesc(organizationId).size(),
            customers.findAllByOrganizationIdOrderByUpdatedAtDesc(organizationId).size()
        );
    }

    @GetMapping("/requests")
    @PreAuthorize("hasAuthority('request.read')")
    public List<OperationsRequestItem> requests(Authentication authentication) {
        UUID organizationId = organizationId(authentication);
        Map<UUID, Customer> customerById = customerMap(organizationId);
        return requests.findAllByOrganizationIdOrderByCreatedAtDesc(organizationId).stream()
            .map(item -> toRequest(item, customerById.get(item.customerId)))
            .toList();
    }

    @GetMapping("/requests/{id}")
    @PreAuthorize("hasAuthority('request.read')")
    public OperationsRequestItem request(@PathVariable UUID id, Authentication authentication) {
        UUID organizationId = organizationId(authentication);
        RequestEntity item = requests.findByOrganizationIdAndId(organizationId, id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));
        return toRequest(item, customers.findByOrganizationIdAndId(organizationId, item.customerId).orElse(null));
    }

    @PatchMapping("/requests/{id}/status")
    @PreAuthorize("hasAuthority('request.update')")
    public OperationsRequestItem updateRequestStatus(@PathVariable UUID id, @Valid @RequestBody StatusInput input, Authentication authentication) {
        UUID organizationId = organizationId(authentication);
        RequestEntity item = requests.findByOrganizationIdAndId(organizationId, id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));
        RequestStatus next = parseRequestStatus(input.status());
        if (!requestTransitionAllowed(item.status, next)) throw new ResponseStatusException(HttpStatus.CONFLICT, "Invalid request status transition");
        item.status = next;
        item = requests.save(item);
        return toRequest(item, customers.findByOrganizationIdAndId(organizationId, item.customerId).orElse(null));
    }

    @GetMapping("/bookings")
    @PreAuthorize("hasAuthority('booking.read')")
    public List<OperationsBookingItem> bookings(Authentication authentication) {
        UUID organizationId = organizationId(authentication);
        Map<UUID, Customer> customerById = customerMap(organizationId);
        return bookings.findAllByOrganizationIdOrderByStartAtDesc(organizationId).stream()
            .map(item -> toBooking(item, customerById.get(item.customerId)))
            .toList();
    }

    @GetMapping("/bookings/{id}")
    @PreAuthorize("hasAuthority('booking.read')")
    public OperationsBookingItem booking(@PathVariable UUID id, Authentication authentication) {
        UUID organizationId = organizationId(authentication);
        Booking item = bookings.findByOrganizationIdAndId(organizationId, id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
        return toBooking(item, customers.findByOrganizationIdAndId(organizationId, item.customerId).orElse(null));
    }

    @PatchMapping("/bookings/{id}/status")
    @PreAuthorize("hasAuthority('booking.update')")
    public OperationsBookingItem updateBookingStatus(@PathVariable UUID id, @Valid @RequestBody StatusInput input, Authentication authentication) {
        UUID organizationId = organizationId(authentication);
        Booking item = bookings.findByOrganizationIdAndId(organizationId, id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
        BookingStatus next = parseBookingStatus(input.status());
        if (!bookingTransitionAllowed(item.status, next)) throw new ResponseStatusException(HttpStatus.CONFLICT, "Invalid booking status transition");
        item.status = next;
        item.updatedAt = OffsetDateTime.now();
        item = bookings.save(item);
        return toBooking(item, customers.findByOrganizationIdAndId(organizationId, item.customerId).orElse(null));
    }

    @GetMapping("/customers")
    @PreAuthorize("hasAuthority('customer.read')")
    public List<OperationsCustomerItem> customers(Authentication authentication) {
        return customers.findAllByOrganizationIdOrderByUpdatedAtDesc(organizationId(authentication)).stream()
            .map(this::toCustomer)
            .toList();
    }

    @GetMapping("/customers/{id}")
    @PreAuthorize("hasAuthority('customer.read')")
    public OperationsCustomerItem customer(@PathVariable UUID id, Authentication authentication) {
        return toCustomer(customers.findByOrganizationIdAndId(organizationId(authentication), id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found")));
    }

    private Map<UUID, Customer> customerMap(UUID organizationId) {
        return customers.findAllByOrganizationIdOrderByUpdatedAtDesc(organizationId).stream()
            .collect(Collectors.toMap(customer -> customer.id, Function.identity()));
    }

    private OperationsRequestItem toRequest(RequestEntity request, Customer customer) {
        return new OperationsRequestItem(request.id, request.type.name(), request.status.name(), request.message, request.createdAt,
            customer == null ? null : customer.id,
            customer == null ? null : customer.firstName,
            customer == null ? null : customer.lastName,
            customer == null ? null : customer.email,
            customer == null ? null : customer.phone);
    }

    private OperationsBookingItem toBooking(Booking booking, Customer customer) {
        return new OperationsBookingItem(booking.id, booking.reference, booking.status.name(), booking.bookableType.name(), booking.bookableId,
            booking.startAt, booking.endAt, booking.participants, booking.purpose, booking.createdAt,
            customer == null ? null : customer.id,
            customer == null ? null : customer.firstName,
            customer == null ? null : customer.lastName,
            customer == null ? null : customer.email,
            customer == null ? null : customer.phone);
    }

    private OperationsCustomerItem toCustomer(Customer customer) {
        return new OperationsCustomerItem(customer.id, customer.firstName, customer.lastName, customer.email, customer.phone, customer.company, customer.source, customer.createdAt, customer.updatedAt);
    }

    private RequestStatus parseRequestStatus(String value) {
        try { return RequestStatus.valueOf(value.trim().toUpperCase(Locale.ROOT)); }
        catch (RuntimeException exception) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown request status"); }
    }

    private BookingStatus parseBookingStatus(String value) {
        try { return BookingStatus.valueOf(value.trim().toUpperCase(Locale.ROOT)); }
        catch (RuntimeException exception) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown booking status"); }
    }

    private boolean requestTransitionAllowed(RequestStatus current, RequestStatus next) {
        if (current == next) return true;
        return switch (current) {
            case NEW -> EnumSet.of(RequestStatus.CONTACTED, RequestStatus.CLOSED, RequestStatus.CANCELLED).contains(next);
            case CONTACTED -> EnumSet.of(RequestStatus.QUALIFIED, RequestStatus.WAITING_CUSTOMER, RequestStatus.CLOSED, RequestStatus.CANCELLED).contains(next);
            case QUALIFIED -> EnumSet.of(RequestStatus.WAITING_CUSTOMER, RequestStatus.CONVERTED, RequestStatus.CLOSED, RequestStatus.CANCELLED).contains(next);
            case WAITING_CUSTOMER -> EnumSet.of(RequestStatus.CONTACTED, RequestStatus.QUALIFIED, RequestStatus.CONVERTED, RequestStatus.CLOSED, RequestStatus.CANCELLED).contains(next);
            case CONVERTED -> next == RequestStatus.CLOSED;
            case CLOSED, CANCELLED -> false;
        };
    }

    private boolean bookingTransitionAllowed(BookingStatus current, BookingStatus next) {
        if (current == next) return true;
        return switch (current) {
            case PENDING -> EnumSet.of(BookingStatus.CONFIRMED, BookingStatus.CANCELLED).contains(next);
            case CONFIRMED -> EnumSet.of(BookingStatus.COMPLETED, BookingStatus.CANCELLED, BookingStatus.NO_SHOW).contains(next);
            case COMPLETED, CANCELLED, NO_SHOW -> false;
        };
    }

    private UUID organizationId(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserAccount user)) {
            throw new IllegalStateException("Authenticated organization context is required.");
        }
        return user.organizationId;
    }

    public record StatusInput(@NotBlank String status) { }
    public record OperationsSummary(long requests, long bookings, long customers) { }
    public record OperationsRequestItem(UUID id, String type, String status, String message, OffsetDateTime createdAt,
                                        UUID customerId, String firstName, String lastName, String email, String phone) { }
    public record OperationsBookingItem(UUID id, String reference, String status, String bookableType, UUID bookableId,
                                        OffsetDateTime startAt, OffsetDateTime endAt, Integer participants, String purpose, OffsetDateTime createdAt,
                                        UUID customerId, String firstName, String lastName, String email, String phone) { }
    public record OperationsCustomerItem(UUID id, String firstName, String lastName, String email, String phone, String company,
                                         String source, OffsetDateTime createdAt, OffsetDateTime updatedAt) { }
}
