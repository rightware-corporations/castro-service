package com.castros.catalog;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "course_sessions")
public class CourseSession {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @Column(nullable = false)
    public UUID courseId;

    @Column(nullable = false)
    public OffsetDateTime startAt;

    @Column(nullable = false)
    public OffsetDateTime endAt;

    public String label;

    @Column(nullable = false)
    public boolean active = true;

    protected CourseSession() {}
}
