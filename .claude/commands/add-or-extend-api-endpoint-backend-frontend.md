---
name: add-or-extend-api-endpoint-backend-frontend
description: Workflow command scaffold for add-or-extend-api-endpoint-backend-frontend in Booking-Platform.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-or-extend-api-endpoint-backend-frontend

Use this workflow when working on **add-or-extend-api-endpoint-backend-frontend** in `Booking-Platform`.

## Goal

Adds a new API endpoint to the backend and exposes it to the frontend API client, often with related types and UI usage.

## Common Files

- `booking-backend/src/main/java/com/booking/controller/*.java`
- `booking-backend/src/main/java/com/booking/service/**/*.java`
- `frontend/lib/api.ts`
- `frontend/lib/types.ts`
- `frontend/app/**/*.tsx`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Implement service method in backend (ServiceProvideService.java, ServiceProvideServiceImpl.java, etc.)
- Add or update controller in backend (e.g., PublicProviderController.java, PublicServiceController.java)
- Expose new endpoint in backend (e.g., /api/public/service/{serviceId})
- Update frontend API client (frontend/lib/api.ts) to call new endpoint
- Update or create frontend page/component to use new API (e.g., page.tsx, provider detail, service detail)

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.