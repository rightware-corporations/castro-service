package com.castros.user;

import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Entity @Table(name="users")
public class UserAccount implements UserDetails {
    @Id @GeneratedValue(strategy=GenerationType.UUID) public UUID id;
    @Column(nullable=false) public UUID organizationId;
    @Column(nullable=false, unique=true) public String email;
    @Column(nullable=false) public String passwordHash;
    @Column(nullable=false) public String firstName;
    @Column(nullable=false) public String lastName;
    @Column(nullable=false) public boolean active = true;
    @Column(nullable=false) public OffsetDateTime createdAt = OffsetDateTime.now();
    protected UserAccount() { }
    public UserAccount(UUID organizationId, String email, String passwordHash, String firstName, String lastName) { this.organizationId=organizationId; this.email=email; this.passwordHash=passwordHash; this.firstName=firstName; this.lastName=lastName; }
    public Collection<? extends GrantedAuthority> getAuthorities() { return List.of(); }
    public String getPassword() { return passwordHash; }
    public String getUsername() { return email; }
    public boolean isAccountNonExpired() { return true; }
    public boolean isAccountNonLocked() { return active; }
    public boolean isCredentialsNonExpired() { return true; }
    public boolean isEnabled() { return active; }
}
