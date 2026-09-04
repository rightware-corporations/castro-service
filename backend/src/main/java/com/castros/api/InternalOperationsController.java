package com.castros.api;

import com.castros.booking.Booking;
import com.castros.booking.BookingApplicationService;
import com.castros.booking.BookingRepository;
import com.castros.booking.BookingStatus;
import com.castros.customer.Customer;
import com.castros.customer.CustomerRepository;
import com.castros.notification.NotificationPublisher;
import com.castros.request.RequestEntity;
import com.castros.request.RequestRepository;
import com.castros.request.RequestStatus;
import com.castros.shared.config.AppProperties;
import com.castros.user.UserAccount;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.*;

@RestController
@RequestMapping("/api/v1/operations")
public class InternalOperationsController {
    private final RequestRepository requests;
    private final BookingRepository bookings;
    private final CustomerRepository customers;
    private final BookingApplicationService bookingApplicationService;
    private final AppProperties appProperties;
    private final JdbcTemplate jdbc;
    private final NotificationPublisher notifications;

    public InternalOperationsController(RequestRepository requests, BookingRepository bookings, CustomerRepository customers,
                                        BookingApplicationService bookingApplicationService, AppProperties appProperties,
                                        JdbcTemplate jdbc, NotificationPublisher notifications) {
        this.requests = requests;
        this.bookings = bookings;
        this.customers = customers;
        this.bookingApplicationService = bookingApplicationService;
        this.appProperties = appProperties;
        this.jdbc = jdbc;
        this.notifications = notifications;
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAuthority('dashboard.read')")
    public OperationsSummary summary(Authentication authentication) {
        UUID org = organizationId(authentication);
        return new OperationsSummary(count("requests", org), count("bookings", org), count("customers", org));
    }

    @GetMapping("/requests")
    @PreAuthorize("hasAuthority('request.read')")
    public List<OperationsRequestItem> requests(@RequestParam(defaultValue = "0") int page,
                                                @RequestParam(defaultValue = "100") int size,
                                                @RequestParam(required = false) String q,
                                                @RequestParam(required = false) String status,
                                                Authentication authentication) {
        UUID org = organizationId(authentication);
        List<Object> params = new ArrayList<>(); params.add(org);
        StringBuilder sql = new StringBuilder("""
            select r.id,r.type,r.status,r.message,r.created_at,c.id customer_id,c.first_name,c.last_name,c.email,c.phone
            from requests r left join customers c on c.id=r.customer_id and c.organization_id=r.organization_id
            where r.organization_id=?
            """);
        appendSearch(sql, params, q, "concat_ws(' ',r.message,c.first_name,c.last_name,c.email,c.phone,r.type)");
        appendStatus(sql, params, status, "r.status");
        sql.append(" order by r.created_at desc limit ? offset ?"); appendPage(params,page,size);
        return query(sql.toString(), params, (rs,row) -> new OperationsRequestItem(rs.getObject("id",UUID.class),rs.getString("type"),rs.getString("status"),rs.getString("message"),rs.getObject("created_at",OffsetDateTime.class),rs.getObject("customer_id",UUID.class),rs.getString("first_name"),rs.getString("last_name"),rs.getString("email"),rs.getString("phone")));
    }

    @GetMapping("/requests/count")
    @PreAuthorize("hasAuthority('request.read')")
    public CountResponse requestCount(@RequestParam(required=false) String q, @RequestParam(required=false) String status, Authentication authentication) {
        UUID org=organizationId(authentication); List<Object> params=new ArrayList<>(); params.add(org);
        StringBuilder sql=new StringBuilder("select count(*) from requests r left join customers c on c.id=r.customer_id and c.organization_id=r.organization_id where r.organization_id=?");
        appendSearch(sql,params,q,"concat_ws(' ',r.message,c.first_name,c.last_name,c.email,c.phone,r.type)"); appendStatus(sql,params,status,"r.status");
        return new CountResponse(queryCount(sql.toString(),params));
    }

    @GetMapping("/requests/{id}")
    @PreAuthorize("hasAuthority('request.read')")
    public OperationsRequestItem request(@PathVariable UUID id, Authentication authentication) {
        UUID organizationId = organizationId(authentication);
        RequestEntity item = requests.findByOrganizationIdAndId(organizationId, id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));
        return toRequest(item, customers.findByOrganizationIdAndId(organizationId, item.customerId).orElse(null));
    }

    @PatchMapping("/requests/{id}/status")
    @PreAuthorize("hasAuthority('request.update')")
    public OperationsRequestItem updateRequestStatus(@PathVariable UUID id, @Valid @RequestBody StatusInput input, Authentication authentication) {
        UUID organizationId = organizationId(authentication);
        RequestEntity item = requests.findByOrganizationIdAndId(organizationId, id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));
        RequestStatus next = parseRequestStatus(input.status());
        if (!requestTransitionAllowed(item.status, next)) throw new ResponseStatusException(HttpStatus.CONFLICT, "Invalid request status transition");
        item.status = next; item = requests.save(item);
        return toRequest(item, customers.findByOrganizationIdAndId(organizationId, item.customerId).orElse(null));
    }

    @GetMapping("/bookings")
    @PreAuthorize("hasAuthority('booking.read')")
    public List<OperationsBookingItem> bookings(@RequestParam(defaultValue="0") int page,
                                                @RequestParam(defaultValue="100") int size,
                                                @RequestParam(required=false) String q,
                                                @RequestParam(required=false) String status,
                                                Authentication authentication) {
        UUID org=organizationId(authentication); List<Object> params=new ArrayList<>(); params.add(org);
        StringBuilder sql=new StringBuilder("""
            select b.id,b.reference,b.status,b.bookable_type,b.bookable_id,b.start_at,b.end_at,b.participants,b.purpose,b.created_at,
                   c.id customer_id,c.first_name,c.last_name,c.email,c.phone
            from bookings b left join customers c on c.id=b.customer_id and c.organization_id=b.organization_id
            where b.organization_id=?
            """);
        appendSearch(sql,params,q,"concat_ws(' ',b.reference,b.purpose,c.first_name,c.last_name,c.email,c.phone,b.bookable_type)"); appendStatus(sql,params,status,"b.status");
        sql.append(" order by b.start_at desc limit ? offset ?"); appendPage(params,page,size);
        return query(sql.toString(),params,(rs,row)->new OperationsBookingItem(rs.getObject("id",UUID.class),rs.getString("reference"),rs.getString("status"),rs.getString("bookable_type"),rs.getObject("bookable_id",UUID.class),rs.getObject("start_at",OffsetDateTime.class),rs.getObject("end_at",OffsetDateTime.class),(Integer)rs.getObject("participants"),rs.getString("purpose"),rs.getObject("created_at",OffsetDateTime.class),rs.getObject("customer_id",UUID.class),rs.getString("first_name"),rs.getString("last_name"),rs.getString("email"),rs.getString("phone")));
    }

    @GetMapping("/bookings/count")
    @PreAuthorize("hasAuthority('booking.read')")
    public CountResponse bookingCount(@RequestParam(required=false) String q,@RequestParam(required=false) String status,Authentication authentication){
        UUID org=organizationId(authentication); List<Object> params=new ArrayList<>(); params.add(org);
        StringBuilder sql=new StringBuilder("select count(*) from bookings b left join customers c on c.id=b.customer_id and c.organization_id=b.organization_id where b.organization_id=?");
        appendSearch(sql,params,q,"concat_ws(' ',b.reference,b.purpose,c.first_name,c.last_name,c.email,c.phone,b.bookable_type)"); appendStatus(sql,params,status,"b.status");
        return new CountResponse(queryCount(sql.toString(),params));
    }

    @PostMapping("/bookings")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('booking.create')")
    public OperationsBookingItem createBooking(@Valid @RequestBody BookingApplicationService.BookingRequest input,
                                               @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
                                               Authentication authentication) {
        UUID organizationId = organizationId(authentication);
        Booking booking = bookingApplicationService.createForOrganization(organizationId,input,ZoneId.of(appProperties.getBusinessTimezone()),idempotencyKey,"OPERATIONS_BOOKING");
        Customer customer = customers.findByOrganizationIdAndId(organizationId, booking.customerId).orElse(null);
        return toBooking(booking, customer);
    }

    @GetMapping("/bookings/{id}")
    @PreAuthorize("hasAuthority('booking.read')")
    public OperationsBookingItem booking(@PathVariable UUID id, Authentication authentication) {
        UUID organizationId = organizationId(authentication);
        Booking item = bookings.findByOrganizationIdAndId(organizationId, id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
        return toBooking(item, customers.findByOrganizationIdAndId(organizationId, item.customerId).orElse(null));
    }

    @PatchMapping("/bookings/{id}/status")
    @PreAuthorize("hasAuthority('booking.update')")
    public OperationsBookingItem updateBookingStatus(@PathVariable UUID id, @Valid @RequestBody StatusInput input, Authentication authentication) {
        UUID organizationId = organizationId(authentication);
        Booking item = bookings.findByOrganizationIdAndId(organizationId, id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
        BookingStatus next = parseBookingStatus(input.status());
        if (!bookingTransitionAllowed(item.status, next)) throw new ResponseStatusException(HttpStatus.CONFLICT, "Invalid booking status transition");
        item.status = next; item.updatedAt = OffsetDateTime.now(); item = bookings.save(item);
        if (next == BookingStatus.CANCELLED) {
            notifications.publishToOperations(organizationId, "BOOKING_CANCELLED", "Marcação cancelada",
                item.reference + " foi cancelada.", "BOOKING", item.id);
        }
        return toBooking(item, customers.findByOrganizationIdAndId(organizationId, item.customerId).orElse(null));
    }

    @GetMapping("/customers")
    @PreAuthorize("hasAuthority('customer.read')")
    public List<OperationsCustomerItem> customers(@RequestParam(defaultValue="0") int page,
                                                  @RequestParam(defaultValue="100") int size,
                                                  @RequestParam(required=false) String q,
                                                  Authentication authentication) {
        UUID org=organizationId(authentication); List<Object> params=new ArrayList<>(); params.add(org);
        StringBuilder sql=new StringBuilder("select id,first_name,last_name,email,phone,company,source,created_at,updated_at from customers where organization_id=?");
        appendSearch(sql,params,q,"concat_ws(' ',first_name,last_name,email,phone,company,source)");
        sql.append(" order by updated_at desc limit ? offset ?"); appendPage(params,page,size);
        return query(sql.toString(),params,(rs,row)->new OperationsCustomerItem(rs.getObject("id",UUID.class),rs.getString("first_name"),rs.getString("last_name"),rs.getString("email"),rs.getString("phone"),rs.getString("company"),rs.getString("source"),rs.getObject("created_at",OffsetDateTime.class),rs.getObject("updated_at",OffsetDateTime.class)));
    }

    @GetMapping("/customers/count")
    @PreAuthorize("hasAuthority('customer.read')")
    public CountResponse customerCount(@RequestParam(required=false) String q,Authentication authentication){
        UUID org=organizationId(authentication); List<Object> params=new ArrayList<>(); params.add(org);
        StringBuilder sql=new StringBuilder("select count(*) from customers where organization_id=?"); appendSearch(sql,params,q,"concat_ws(' ',first_name,last_name,email,phone,company,source)");
        return new CountResponse(queryCount(sql.toString(),params));
    }

    @GetMapping("/customers/{id}")
    @PreAuthorize("hasAuthority('customer.read')")
    public OperationsCustomerItem customer(@PathVariable UUID id, Authentication authentication) {
        return toCustomer(customers.findByOrganizationIdAndId(organizationId(authentication), id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found")));
    }

    private long count(String table, UUID org){ Long value=jdbc.queryForObject("select count(*) from "+table+" where organization_id=?",Long.class,org); return value==null?0:value; }
    private void appendSearch(StringBuilder sql,List<Object> params,String q,String expression){ String term=clean(q); if(term!=null){sql.append(" and lower(").append(expression).append(") like ?");params.add("%"+term.toLowerCase(Locale.ROOT)+"%");} }
    private void appendStatus(StringBuilder sql,List<Object> params,String status,String column){ String value=clean(status); if(value!=null){sql.append(" and ").append(column).append("=?");params.add(value.toUpperCase(Locale.ROOT));} }
    private void appendPage(List<Object> params,int page,int size){int safePage=Math.max(page,0);int safeSize=Math.min(Math.max(size,1),200);params.add(safeSize);params.add(safePage*safeSize);}
    private String clean(String value){return value==null||value.isBlank()?null:value.trim();}
    private long queryCount(String sql,List<Object> params){List<Long> rows=query(sql,params,(rs,row)->rs.getLong(1));return rows.isEmpty()?0:rows.getFirst();}
    private <T> List<T> query(String sql,List<Object> params,RowMapper<T> mapper){return jdbc.query(sql,ps->bind(ps,params),mapper);}
    private void bind(PreparedStatement ps,List<Object> params)throws SQLException{for(int i=0;i<params.size();i++)ps.setObject(i+1,params.get(i));}

    private OperationsRequestItem toRequest(RequestEntity request, Customer customer) {
        return new OperationsRequestItem(request.id, request.type.name(), request.status.name(), request.message, request.createdAt,customer == null ? null : customer.id,customer == null ? null : customer.firstName,customer == null ? null : customer.lastName,customer == null ? null : customer.email,customer == null ? null : customer.phone);
    }
    private OperationsBookingItem toBooking(Booking booking, Customer customer) {
        return new OperationsBookingItem(booking.id, booking.reference, booking.status.name(), booking.bookableType.name(), booking.bookableId,booking.startAt, booking.endAt, booking.participants, booking.purpose, booking.createdAt,customer == null ? null : customer.id,customer == null ? null : customer.firstName,customer == null ? null : customer.lastName,customer == null ? null : customer.email,customer == null ? null : customer.phone);
    }
    private OperationsCustomerItem toCustomer(Customer customer) { return new OperationsCustomerItem(customer.id, customer.firstName, customer.lastName, customer.email, customer.phone, customer.company, customer.source, customer.createdAt, customer.updatedAt); }

    private RequestStatus parseRequestStatus(String value) { try { return RequestStatus.valueOf(value.trim().toUpperCase(Locale.ROOT)); } catch (RuntimeException exception) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown request status"); } }
    private BookingStatus parseBookingStatus(String value) { try { return BookingStatus.valueOf(value.trim().toUpperCase(Locale.ROOT)); } catch (RuntimeException exception) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown booking status"); } }
    private boolean requestTransitionAllowed(RequestStatus current, RequestStatus next) { if (current == next) return true; return switch (current) { case NEW -> EnumSet.of(RequestStatus.CONTACTED, RequestStatus.CLOSED, RequestStatus.CANCELLED).contains(next); case CONTACTED -> EnumSet.of(RequestStatus.QUALIFIED, RequestStatus.WAITING_CUSTOMER, RequestStatus.CLOSED, RequestStatus.CANCELLED).contains(next); case QUALIFIED -> EnumSet.of(RequestStatus.WAITING_CUSTOMER, RequestStatus.CONVERTED, RequestStatus.CLOSED, RequestStatus.CANCELLED).contains(next); case WAITING_CUSTOMER -> EnumSet.of(RequestStatus.CONTACTED, RequestStatus.QUALIFIED, RequestStatus.CONVERTED, RequestStatus.CLOSED, RequestStatus.CANCELLED).contains(next); case CONVERTED -> next == RequestStatus.CLOSED; case CLOSED, CANCELLED -> false; }; }
    private boolean bookingTransitionAllowed(BookingStatus current, BookingStatus next) { if (current == next) return true; return switch (current) { case PENDING -> EnumSet.of(BookingStatus.CONFIRMED, BookingStatus.CANCELLED).contains(next); case CONFIRMED -> EnumSet.of(BookingStatus.COMPLETED, BookingStatus.CANCELLED, BookingStatus.NO_SHOW).contains(next); case COMPLETED, CANCELLED, NO_SHOW -> false; }; }
    private UUID organizationId(Authentication authentication) { if (authentication == null || !(authentication.getPrincipal() instanceof UserAccount user) || user.organizationId == null) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Organization context unavailable"); return user.organizationId; }

    public record StatusInput(@NotBlank String status) { }
    public record CountResponse(long total) { }
    public record OperationsSummary(long requests, long bookings, long customers) { }
    public record OperationsRequestItem(UUID id, String type, String status, String message, OffsetDateTime createdAt,UUID customerId, String firstName, String lastName, String email, String phone) { }
    public record OperationsBookingItem(UUID id, String reference, String status, String bookableType, UUID bookableId,OffsetDateTime startAt, OffsetDateTime endAt, Integer participants, String purpose, OffsetDateTime createdAt,UUID customerId, String firstName, String lastName, String email, String phone) { }
    public record OperationsCustomerItem(UUID id, String firstName, String lastName, String email, String phone, String company,String source, OffsetDateTime createdAt, OffsetDateTime updatedAt) { }
}
