# 3M Car Rentals API Standards & Validation manual
**Company-Wide REST Architectural Standards & Zod Validation Engine**

*Prepared by: Principal Backend Architect*

---

## 1. REST Method Standards

Every API endpoint must match HTTP verbs directly to CRUD activities:

* **`GET`**: Retrieve resource lists or single specifications. Read-only. Safe and idempotent.
* **`POST`**: Create new instances (e.g. create bookings, register vehicles). Non-idempotent.
* **`PATCH`**: Apply partial updates (e.g. toggle status, update metadata parameters). Idempotent.
* **`DELETE`**: Remove resources. Idempotent.

---

## 2. Standard Response Envelopes

Every endpoint must output normalized JSON shapes:

### Success Envelopes (HTTP 2xx)
Success responses contain a primary `data` payload and optional pagination `meta` fields.

```json
{
  "data": {
    "id": "673f8a9a-5f06-444c-bc67-0c7f8a9a6f3b",
    "registration_number": "MH-12-PQ-9999",
    "brand": "Porsche",
    "model": "911 Carrera",
    "availability_status": "available"
  },
  "meta": {
    "page": 1,
    "limit": 10,
    "total_records": 1
  }
}
```

### Error Envelopes (HTTP 4xx / 5xx)
Errors encapsulate specific code constants, readable messages, and detail parameter maps (such as parsing fail spots).

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Input validation failed.",
    "details": [
      {
        "field": "vehicleIds.0",
        "message": "Invalid UUID parameter format."
      }
    ]
  }
}
```

---

## 3. Integration Mappings & Code Snippets

Use these code configurations when implementing Next.js API Route Handlers:

### POST Handler Example
```typescript
import { validateBody, successResponse } from "@/utils/api-helpers";
import { bookingCreateSchema } from "@/utils/validation-schemas";

export async function POST(req: Request) {
  // 1. Run body validation
  const { data, errorResponse } = await validateBody(bookingCreateSchema, req);
  if (errorResponse) return errorResponse;

  // 2. Perform business calculations and database insertions
  const result = await createBooking(data);

  // 3. Return standardized envelope
  return successResponse(result, null, 201);
}
```

### GET Handler with Query Mappings
```typescript
import { validateQuery, successResponse } from "@/utils/api-helpers";
import { paginationQuerySchema } from "@/utils/validation-schemas";

export async function GET(req: Request) {
  // 1. Extract query params
  const { data, errorResponse } = validateQuery(paginationQuerySchema, req.url);
  if (errorResponse) return errorResponse;

  // 2. Run query
  const records = await getPagedVehicles(data.page, data.limit);

  // 3. Wrap response
  return successResponse(
    records.list, 
    { page: data.page, limit: data.limit, total_records: records.total }
  );
}
```
