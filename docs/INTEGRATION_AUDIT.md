# Frontend ↔ Backend Integration Audit

## Status

The frontend and backend foundations are integrated on `integration/castros-platform`.

A contract audit found several frontend DTO assumptions that did not exactly match the hardened Spring Boot implementation. These mismatches must be corrected before relying on real HTTP mode.

## Confirmed backend response shapes

### Public configuration

```json
{
  "businessTimezone": "Africa/Maputo"
}
```

### Service

```text
id
name
slug
description
durationMinutes
bookingEnabled
```

`GET /api/v1/services` returns a JSON array, not a paginated collection wrapper.

### Course

```text
id
name
slug
description
```

`GET /api/v1/courses` returns a JSON array.

### Course session

```text
id
startAt
endAt
```

`GET /api/v1/courses/{id}/sessions` returns a JSON array. It does not return `courseSlug`.

### Space

```text
id
name
slug
description
location
capacityMin
capacityMax
```

`GET /api/v1/spaces` returns a JSON array.

### Availability

```json
{
  "date": "YYYY-MM-DD",
  "timezone": "Africa/Maputo",
  "slots": [
    { "start": "09:00", "end": "10:00", "status": "AVAILABLE" }
  ]
}
```

It is not a collection wrapper.

### Booking create request

```text
bookableType
bookableId
date
startTime
endTime
participants?
customer {
  firstName
  lastName?
  email?
  phone?
}
spaceConfiguration? {
  layoutId?
  purpose?
  amenityIds?
}
notes?
```

### Booking create response

```text
id
reference
status
startAt
endAt
```

### Public booking lookup

```text
reference
status
startAt
endAt
```

### Standard API error

```text
code
message
status
timestamp
details
```

For Bean Validation errors, `details` maps field names to validation messages.

## Integration rule

The UI may continue using frontend-friendly domain models and `Collection<T>` internally. The HTTP adapter is responsible for converting exact Spring Boot transport shapes into those domain/API-port shapes. Do not change backend contracts simply to fit existing frontend assumptions.
