```markdown
# Booking-Platform Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill teaches you how to contribute to the Booking-Platform codebase, a Java-based booking system with a TypeScript/React frontend. It covers backend and frontend development patterns, coding conventions, and common workflows for adding features, extending domain models, updating APIs, and fixing bugs. You'll learn how to structure code, follow commit conventions, and use suggested commands to streamline your development process.

## Coding Conventions

**File Naming**
- Java files use PascalCase (e.g., `ServiceProvideServiceImpl.java`)
- TypeScript files use PascalCase or camelCase as appropriate (e.g., `api.ts`, `types.ts`)

**Import Style**
- Java: Use alias imports where possible
  ```java
  import com.booking.service.ProviderService as PS;
  ```
- TypeScript: Standard ES6 imports
  ```typescript
  import api from './api';
  ```

**Export Style**
- Java: Standard class exports
- TypeScript: Default export
  ```typescript
  export default api;
  ```

**Commit Messages**
- Conventional commits with prefixes: `feat`, `docs`, `fix`, `chore`
- Example:  
  ```
  feat: add categories field to ProviderProfileDO (60 chars max)
  ```

## Workflows

### Add or Extend API Endpoint (Backend & Frontend)
**Trigger:** When you want to add new backend functionality and make it available to the frontend.  
**Command:** `/add-api-endpoint`

1. Implement the service method in backend (e.g., `ServiceProvideService.java`, `ServiceProvideServiceImpl.java`)
2. Add or update the controller in backend (e.g., `PublicProviderController.java`)
3. Expose the new endpoint in backend (e.g., `/api/public/service/{serviceId}`)
4. Update the frontend API client (`frontend/lib/api.ts`) to call the new endpoint
5. Update or create the frontend page/component to use the new API (e.g., `page.tsx`)
6. Extend types if necessary (`frontend/lib/types.ts`)

**Example:**
```java
// In ServiceProvideServiceImpl.java
public ServiceDetail getServiceDetail(Long serviceId) { ... }
```
```typescript
// In frontend/lib/api.ts
export async function getServiceDetail(serviceId: number) {
  return api.get(`/api/public/service/${serviceId}`);
}
```

---

### Add or Extend Domain Model with New Field or Entity
**Trigger:** When you want to support new data in the system (e.g., categories for providers/services).  
**Command:** `/add-domain-field`

1. Add the new field to the backend entity (e.g., `ProviderProfileDO.java`)
2. Update DTOs for request/response (e.g., `ProviderRegistrationRequest.java`)
3. Update mappers to map the new field (e.g., `ProviderMapper.java`)
4. Add/extend validation logic (e.g., `Category.java`)
5. Update repository if needed for new queries (e.g., `ProviderProfileRepository.java`)
6. Update or add API endpoints to handle the new field
7. Update frontend types (`frontend/lib/types.ts`)
8. Update frontend UI to use/display the new field

**Example:**
```java
// In ProviderProfileDO.java
private List<Category> categories;
```
```typescript
// In frontend/lib/types.ts
export type ProviderProfile = {
  id: number;
  name: string;
  categories: string[];
};
```

---

### Feature Development (Full Stack)
**Trigger:** When you want to deliver a new user-facing feature that spans backend and frontend.  
**Command:** `/feature`

1. Implement backend service/controller logic
2. Expose or update API endpoint
3. Update frontend API client and types
4. Implement or update frontend UI (pages, components)
5. Update navigation or guards if needed
6. Update documentation or plans if needed

**Example:**
```java
// Backend: Add new booking logic in BookingServiceImpl.java
```
```typescript
// Frontend: Add new booking page in frontend/app/BookingPage.tsx
```

---

### Add or Update Frontend Page or Component
**Trigger:** When you want to add a new UI page or component or enhance an existing one.  
**Command:** `/add-frontend-page`

1. Create or update page/component file in `frontend/app` or `frontend/components`
2. Update or add supporting API calls in `frontend/lib/api.ts`
3. Update types in `frontend/lib/types.ts` if needed
4. Wire up navigation or UI logic

**Example:**
```typescript
// In frontend/app/ProviderDetail.tsx
import { getProviderDetail } from '../lib/api';

export default function ProviderDetail({ id }) {
  // ...
}
```

---

### Fix or Refactor Backend Entity or API
**Trigger:** When you need to resolve a backend bug or improve backend data handling.  
**Command:** `/fix-backend-entity`

1. Update backend entity or DTO (e.g., add nullable field, fix mapping)
2. Update validation or helper logic
3. Update controller or service as needed
4. Update repository or query if necessary

**Example:**
```java
// In ProviderProfileDO.java
private String phoneNumber; // made nullable
```

## Testing Patterns

- Test files follow the pattern `*.test.*`
- Testing framework is unknown; look for files like `BookingService.test.java` or `ProviderDetail.test.tsx`
- Place backend tests alongside Java classes, and frontend tests near components or in a `__tests__` directory

**Example:**
```java
// BookingService.test.java
@Test
public void testCreateBooking() { ... }
```
```typescript
// ProviderDetail.test.tsx
test('renders provider details', () => { ... });
```

## Commands

| Command              | Purpose                                                           |
|----------------------|-------------------------------------------------------------------|
| /add-api-endpoint    | Add or extend a backend API endpoint and expose it to frontend    |
| /add-domain-field    | Add a new field or entity to the backend domain model             |
| /feature             | Implement a full-stack feature (backend + frontend)               |
| /add-frontend-page   | Create or update a frontend page or component                     |
| /fix-backend-entity  | Fix or refactor backend entity, DTO, or API logic                 |
```
