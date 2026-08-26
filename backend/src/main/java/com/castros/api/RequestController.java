package com.castros.api;

import com.castros.customer.*;
import com.castros.organization.OrganizationRepository;
import com.castros.request.*;
import com.castros.shared.exception.ApiException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/v1/requests")
public class RequestController {
    private final RequestRepository requests; private final CustomerRepository customers; private final OrganizationRepository organizations;
    public RequestController(RequestRepository requests,CustomerRepository customers,OrganizationRepository organizations){this.requests=requests;this.customers=customers;this.organizations=organizations;}
    @PostMapping public Map<String,Object> create(@Valid @RequestBody RequestInput input){UUID org=organizations.findAll().stream().filter(o->o.active).findFirst().map(o->o.id).orElseThrow(()->new ApiException("RESOURCE_NOT_FOUND","No active organization is configured.",HttpStatus.NOT_FOUND));Customer c=customers.findFirstByOrganizationIdAndEmailIgnoreCase(org,input.email()).orElseGet(()->customers.save(new Customer(org,input.firstName(),input.lastName(),input.email(),input.phone(),"PUBLIC_REQUEST")));RequestEntity r=requests.save(new RequestEntity(org,c.id,input.type(),input.message()));return Map.of("id",r.id,"status",r.status.name());}
    public record RequestInput(@NotBlank String firstName,@NotBlank String lastName,@Email @NotBlank String email,String phone,@NotNull RequestType type,String message){}
}
