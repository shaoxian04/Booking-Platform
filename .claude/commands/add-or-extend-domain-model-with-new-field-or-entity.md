---
name: add-or-extend-domain-model-with-new-field-or-entity
description: Workflow command scaffold for add-or-extend-domain-model-with-new-field-or-entity in Booking-Platform.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-or-extend-domain-model-with-new-field-or-entity

Use this workflow when working on **add-or-extend-domain-model-with-new-field-or-entity** in `Booking-Platform`.

## Goal

Adds a new field (e.g. categories, available_time) or entity to the backend domain model, updates DTOs, mappers, validation, and exposes to frontend types.

## Common Files

- `booking-backend/src/main/java/com/booking/entity/DO/*.java`
- `booking-backend/src/main/java/com/booking/entity/DTO/**/*.java`
- `booking-backend/src/main/java/com/booking/entity/mapper/*.java`
- `booking-backend/src/main/java/com/booking/common/enums/*.java`
- `booking-backend/src/main/java/com/booking/service/**/*.java`
- `booking-backend/src/main/java/com/booking/repository/*.java`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Add new field to backend entity (e.g., ProviderProfileDO.java, ServiceProvideDO.java)
- Update DTOs for request/response (e.g., ProviderRegistrationRequest.java, CreateServiceRequest.java, ProviderRegistrationResponse.java)
- Update mappers to map new field (e.g., ProviderMapper.java, ServiceProvideMapper.java)
- Add/extend validation logic (e.g., Category.java, ServiceProvideServiceImpl.java)
- Update repository if needed for new queries (e.g., ProviderProfileRepository.java)

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.