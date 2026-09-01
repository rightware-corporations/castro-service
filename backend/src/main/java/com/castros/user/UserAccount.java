package com.castros.user;

import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.io.Serial;
import java.io.Serializable;
import java.time.OffsetDateTime;
import java.util.*;

@Entity @Table(name="users")
public class UserAccount implements UserDetails, Serializable {
    @Serial private static final long serialVersionUID = 1L;

    @Id @GeneratedValue(strategy=GenerationType.UUID) public UUID id;
    @Column(nullable=false) public UUID organizationId;
    @Column(nullable=false, unique=true) public String email;
    @Column(nullable=false) public String passwordHash;
    @Column(nullable=false) public String firstName;
    @Column(nullable=false) public String lastName;
    @Column(nullable=false) public boolean active = true;
    @Column(nullable=false) public OffsetDateTime createdAt = OffsetDateTime.now();
    @Transient private Set<String> permissionCodes = Set.of();

    protected UserAccount() { }
    public UserAccount(UUID organizationId, String email, String passwordHash, String firstName, String lastName) {
        this.organizationId=organizationId; this.email=email; this.passwordHash=passwordHash; this.firstName=firstName; this.lastName=lastName;
    }

    public UserAccount withPermissionCodes(Collection<String> codes) {
        this.permissionCodes = codes == null ? Set.of() : Set.copyOf(codes);
        return this;
    }

    public Collection<? extends GrantedAuthority> getAuthorities() {
        return permissionCodes.stream().sorted().map(SimpleGrantedAuthority::new).toList();
    }
    public String getPassword() { return passwordHash; }
    public String getUsername() { return email; }
    public boolean isAccountNonExpired() { return true; }
    public boolean isAccountNonLocked() { return active; }
    public boolean isCredentialsNonExpired() { return true; }
    public boolean isEnabled() { return active; }
}
