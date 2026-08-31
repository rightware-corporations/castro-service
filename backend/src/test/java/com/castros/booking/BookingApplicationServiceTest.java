package com.castros.booking;

import com.castros.availability.AvailabilityService;
import com.castros.catalog.CourseSessionRepository;
import com.castros.catalog.ServiceRepository;
import com.castros.catalog.SpaceRepository;
import com.castros.customer.CustomerRepository;
import com.castros.organization.OrganizationRepository;
import com.castros.shared.exception.ApiException;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class BookingApplicationServiceTest {
    @Test
    void manualBookingRejectsServiceOutsideAuthenticatedOrganization() {
        BookingRepository bookings = mock(BookingRepository.class);
        CustomerRepository customers = mock(CustomerRepository.class);
        OrganizationRepository organizations = mock(OrganizationRepository.class);
        ServiceRepository services = mock(ServiceRepository.class);
        SpaceRepository spaces = mock(SpaceRepository.class);
        CourseSessionRepository sessions = mock(CourseSessionRepository.class);
        AvailabilityService availability = mock(AvailabilityService.class);
        BookingApplicationService application = new BookingApplicationService(bookings, customers, organizations, services, spaces, sessions, availability);

        UUID organizationId = UUID.randomUUID();
        UUID foreignServiceId = UUID.randomUUID();
        when(services.findByOrganizationIdAndId(organizationId, foreignServiceId)).thenReturn(Optional.empty());

        BookingApplicationService.BookingRequest request = new BookingApplicationService.BookingRequest(
            BookableType.SERVICE,
            foreignServiceId,
            LocalDate.now().plusDays(2),
            LocalTime.of(9, 0),
            LocalTime.of(10, 0),
            4,
            new BookingApplicationService.CustomerInput("Test", "Customer", "test@example.invalid", null),
            null,
            null
        );

        assertThrows(ApiException.class, () -> application.createForOrganization(organizationId, request, ZoneId.of("Africa/Maputo"), null, "OPERATIONS_BOOKING"));
        verify(services).findByOrganizationIdAndId(organizationId, foreignServiceId);
        verify(availability, never()).assertAvailable(any(), any(), any(), any());
        verifyNoInteractions(customers);
    }
}
