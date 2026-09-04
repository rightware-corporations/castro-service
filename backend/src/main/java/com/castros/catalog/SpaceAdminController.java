package com.castros.catalog;

import com.castros.booking.BookingConfirmationMode;
import com.castros.user.UserAccount;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/operations/catalog/spaces")
public class SpaceAdminController {
    private final SpaceRepository spaces;
    public SpaceAdminController(SpaceRepository spaces) { this.spaces=spaces; }

    @GetMapping @PreAuthorize("hasAuthority('space.read')")
    public List<SpaceResponse> list(Authentication authentication) { return spaces.findAllByOrganizationIdOrderByNameAsc(organizationId(authentication)).stream().map(this::toResponse).toList(); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) @PreAuthorize("hasAuthority('space.manage')")
    public SpaceResponse create(@Valid @RequestBody SpaceInput input,Authentication authentication) { UUID organizationId=organizationId(authentication); validateCapacity(input.capacityMin(),input.capacityMax()); String slug=normalizeSlug(input.slug()); ensureSlugAvailable(organizationId,slug,null); Space space=new Space(); apply(space,input,organizationId,slug); return toResponse(spaces.save(space)); }
    @PutMapping("/{id}") @PreAuthorize("hasAuthority('space.manage')")
    public SpaceResponse update(@PathVariable UUID id,@Valid @RequestBody SpaceInput input,Authentication authentication) { UUID organizationId=organizationId(authentication); validateCapacity(input.capacityMin(),input.capacityMax()); Space space=spaces.findByOrganizationIdAndId(organizationId,id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Space not found")); String slug=normalizeSlug(input.slug()); ensureSlugAvailable(organizationId,slug,id); apply(space,input,organizationId,slug); return toResponse(spaces.save(space)); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) @PreAuthorize("hasAuthority('space.manage')")
    public void deactivate(@PathVariable UUID id,Authentication authentication) { Space space=spaces.findByOrganizationIdAndId(organizationId(authentication),id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Space not found")); space.active=false; spaces.save(space); }

    private void ensureSlugAvailable(UUID organizationId,String slug,UUID currentId) { spaces.findByOrganizationIdAndSlug(organizationId,slug).ifPresent(existing -> { if(currentId==null || !existing.id.equals(currentId)) throw new ResponseStatusException(HttpStatus.CONFLICT,"Space slug already exists"); }); }
    private void apply(Space space,SpaceInput input,UUID organizationId,String slug) { space.organizationId=organizationId; space.name=input.name().trim(); space.slug=slug; space.description=clean(input.description()); space.location=clean(input.location()); space.capacityMin=input.capacityMin(); space.capacityMax=input.capacityMax(); space.sizeSquareMeters=input.sizeSquareMeters(); space.bookingEnabled=input.bookingEnabled(); space.confirmationMode=input.confirmationMode(); space.active=input.active(); }
    private SpaceResponse toResponse(Space space) { return new SpaceResponse(space.id,space.name,space.slug,space.description,space.location,space.capacityMin,space.capacityMax,space.sizeSquareMeters,space.bookingEnabled,space.confirmationMode,space.active); }
    private static void validateCapacity(Integer min,Integer max) { if(min!=null && max!=null && min>max) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Minimum capacity cannot exceed maximum capacity"); }
    private static String clean(String value) { if(value==null)return null; String cleaned=value.trim(); return cleaned.isBlank()?null:cleaned; }
    private static String normalizeSlug(String value) { return value.trim().toLowerCase(Locale.ROOT); }
    private static UUID organizationId(Authentication authentication) { if(authentication==null || !(authentication.getPrincipal() instanceof UserAccount user) || user.organizationId==null) throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Organization context unavailable"); return user.organizationId; }

    public record SpaceInput(@NotBlank String name,@NotBlank @Pattern(regexp="[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*") String slug,String description,String location,@Min(1) Integer capacityMin,@Min(1) Integer capacityMax,@Positive BigDecimal sizeSquareMeters,boolean bookingEnabled,@NotNull BookingConfirmationMode confirmationMode,boolean active) { }
    public record SpaceResponse(UUID id,String name,String slug,String description,String location,Integer capacityMin,Integer capacityMax,BigDecimal sizeSquareMeters,boolean bookingEnabled,BookingConfirmationMode confirmationMode,boolean active) { }
}
