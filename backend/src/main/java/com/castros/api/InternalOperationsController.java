package com.castros.api;

import com.castros.booking.Booking;
import com.castros.booking.BookingRepository;
import com.castros.customer.Customer;
import com.castros.customer.CustomerRepository;
import com.castros.request.RequestEntity;
import com.castros.request.RequestRepository;
import com.castros.user.UserAccount;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
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

    @GetMapping("/bookings")
    @PreAuthorize("hasAuthority('booking.read')")
    public List<OperationsBookingItem> bookings(Authentication authentication) {
        UUID organizationId = organizationId(authentication);
        Map<UUID, Customer> customerById = customerMap(organizationId);
        return bookings.findAllByOrganizationIdOrderByStartAtDesc(organizationId).stream()
            .map(item -> toBooking(item, customerById.get(item.customerId)))
            .toList();
    }

    @GetMapping("/customers")
    @PreAuthorize("hasAuthority('customer.read')")
    public List<OperationsCustomerItem> customers(Authentication authentication) {
        return customers.findAllByOrganizationIdOrderByUpdatedAtDesc(organizationId(authentication)).stream()
            .map(customer -> new OperationsCustomerItem(customer.id, customer.firstName, customer.lastName, customer.email, customer.phone, customer.company, customer.source, customer.createdAt, customer.updatedAt))
            .toList();
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

    private UUID organizationId(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserAccount user)) {
            throw new IllegalStateException("Authenticated organization context is required.");
        }
        return user.organizationId;
    }

    public record OperationsSummary(long requests, long bookings, long customers) { }
    public record OperationsRequestItem(UUID id, String type, String status, String message, OffsetDateTime createdAt,
                                        UUID customerId, String firstName, String lastName, String email, String phone) { }
    public record OperationsBookingItem(UUID id, String reference, String status, String bookableType, UUID bookableId,
                                        OffsetDateTime startAt, OffsetDateTime endAt, Integer participants, String purpose, OffsetDateTime createdAt,
                                        UUID customerId, String firstName, String lastName, String email, String phone) { }
    public record OperationsCustomerItem(UUID id, String firstName, String lastName, String email, String phone, String company,
                                         String source, OffsetDateTime createdAt, OffsetDateTime updatedAt) { }
}
