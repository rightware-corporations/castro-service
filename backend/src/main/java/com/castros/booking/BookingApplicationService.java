package com.castros.booking;

import com.castros.availability.AvailabilityService;
import com.castros.catalog.*;
import com.castros.customer.*;
import com.castros.organization.OrganizationRepository;
import com.castros.shared.exception.ApiException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.util.*;

@Service
public class BookingApplicationService {
    private final BookingRepository bookings; private final CustomerRepository customers; private final OrganizationRepository organizations; private final ServiceRepository services; private final SpaceRepository spaces; private final AvailabilityService availability;
    public BookingApplicationService(BookingRepository bookings,CustomerRepository customers,OrganizationRepository organizations,ServiceRepository services,SpaceRepository spaces,AvailabilityService availability){this.bookings=bookings;this.customers=customers;this.organizations=organizations;this.services=services;this.spaces=spaces;this.availability=availability;}
    @Transactional
    public Booking create(BookingRequest request, ZoneId zone) {
        UUID org=organizations.findAll().stream().filter(o->o.active).findFirst().map(o->o.id).orElseThrow(()->new ApiException("RESOURCE_NOT_FOUND","No active organization is configured.",HttpStatus.NOT_FOUND));
        if("SERVICE".equals(request.bookableType()) && services.findById(request.bookableId()).filter(s->s.active&&s.bookingEnabled).isEmpty()) throw new ApiException("BOOKABLE_INACTIVE","The service is not available for booking.",HttpStatus.CONFLICT);
        if("SPACE".equals(request.bookableType()) && spaces.findById(request.bookableId()).filter(s->s.active).isEmpty()) throw new ApiException("BOOKABLE_INACTIVE","The space is not available for booking.",HttpStatus.CONFLICT);
        OffsetDateTime start=ZonedDateTime.of(request.date(),request.startTime(),zone).toOffsetDateTime(); OffsetDateTime end=ZonedDateTime.of(request.date(),request.endTime(),zone).toOffsetDateTime(); availability.assertAvailable(request.bookableType(),request.bookableId(),start,end);
        Customer customer=customers.findFirstByOrganizationIdAndEmailIgnoreCase(org,request.customer().email()).orElseGet(()->customers.findFirstByOrganizationIdAndPhone(org,request.customer().phone()).orElse(null));
        if(customer==null) customer=customers.save(new Customer(org,request.customer().firstName(),request.customer().lastName(),request.customer().email(),request.customer().phone(),"PUBLIC_BOOKING"));
        Booking booking=new Booking(org,customer.id,request.bookableType(),request.bookableId(),start,end,reference()); booking.notes=request.notes(); booking.participants=request.participants(); booking.purpose=request.spaceConfiguration()==null?null:request.spaceConfiguration().purpose(); booking.layoutId=request.spaceConfiguration()==null?null:request.spaceConfiguration().layoutId();
        try{return bookings.saveAndFlush(booking);}catch(DataIntegrityViolationException ex){throw new ApiException("BOOKING_SLOT_UNAVAILABLE","The selected time slot is no longer available.",HttpStatus.CONFLICT);}
    }
    public Booking findPublic(String reference){return bookings.findByReference(reference).orElseThrow(()->new ApiException("RESOURCE_NOT_FOUND","Booking not found.",HttpStatus.NOT_FOUND));}
    private String reference(){return "CST-"+UUID.randomUUID().toString().substring(0,8).toUpperCase(Locale.ROOT);}
    public record BookingRequest(String bookableType,UUID bookableId,LocalDate date,LocalTime startTime,LocalTime endTime,Integer participants,CustomerInput customer,SpaceConfiguration spaceConfiguration,String notes){}
    public record CustomerInput(String firstName,String lastName,String email,String phone){}
    public record SpaceConfiguration(UUID layoutId,String purpose,List<UUID> amenityIds){}
}
