package com.castros.api;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CourseItem(
    UUID id,
    String name,
    String slug,
    String shortDescription,
    String description,
    String modality,
    String durationLabel,
    String scheduleSummary,
    BigDecimal investmentAmount,
    String investmentCurrency,
    boolean certificateIncluded,
    List<String> learningOutcomes,
    boolean featured
) { }
