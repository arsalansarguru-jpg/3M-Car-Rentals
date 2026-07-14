# 3M Car Rentals Design System - API Documentation
**Shopify Polaris-Grade Enterprise UI Architecture**

*Prepared by: Principal Design Systems Engineer*

---

## 1. Card Components (`src/components/ui/Card.tsx`)

### `<Card>`
A generic container component styled with luxury glassmorphism properties.

```tsx
import { Card } from "@/components/ui/Card";

<Card hoverEffect={true} glowColor="blue">
  <p>Card Content Goes Here</p>
</Card>
```

#### Properties
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `hoverEffect` | `boolean` | `true` | Increases background opacity slightly on hover. |
| `glowColor` | `"blue" \| "pink" \| "purple" \| "cyan" \| "indigo" \| "none"` | `"none"` | Applies a colored dropshadow and border highlight on hover. |

---

### `<KpiCard>`
An animated metrics display card with custom counter transitions and comparison metrics.

```tsx
import { KpiCard } from "@/components/ui/Card";
import { DollarSign } from "lucide-react";

<KpiCard
  title="Total Revenue Today"
  value={45200}
  prefix="₹"
  growth={12}
  icon={DollarSign}
  glowColor="emerald"
/>
```

#### Properties
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `title` | `string` | *Required* | Metric description label. |
| `value` | `number \| string` | *Required* | Numeric metrics trigger counter animations. |
| `prefix` | `string` | `""` | Appended before metrics (e.g. ₹ or $). |
| `suffix` | `string` | `""` | Appended after metrics. |
| `growth` | `number` | `undefined` | Positive/negative comparison percentages. |
| `icon` | `React.ComponentType` | *Required* | Lucide icon component. |
| `glowColor` | `"blue" \| "pink" \| "purple" \| "cyan" \| "indigo"` | `"blue"` | Visual theme category colors. |

---

## 2. Table Components (`src/components/ui/Table.tsx`)

### `<Table>`
A responsive table wrapper supporting flexible columns mapping.

```tsx
import { Table, TableColumn } from "@/components/ui/Table";

interface Booking {
  id: string;
  ref: string;
  amount: number;
}

const columns: TableColumn<Booking>[] = [
  { header: "Reference", accessor: "ref" },
  { header: "Amount", accessor: (row) => `₹${row.amount}` }
];

<Table columns={columns} data={bookings} />
```

#### Properties
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `columns` | `TableColumn<T>[]` | *Required* | Column mapping definition array. |
| `data` | `T[]` | *Required* | Data array list. |
| `onRowClick` | `(row: T) => void` | `undefined` | Click triggers for drawer lookups. |
| `emptyMessage` | `string` | `"No matching records found."` | Text to display if data is empty. |

---

### `<TableToolbar>`
A top container for action buttons, titles, and bulk menus.

```tsx
import { TableToolbar } from "@/components/ui/Table";

<TableToolbar title="Booking Catalog">
  <button>Export CSV</button>
</TableToolbar>
```

---

### `<Pagination>`
Step controls supporting records count feedback labels.

```tsx
import { Pagination } from "@/components/ui/Table";

<Pagination
  currentPage={1}
  totalPages={5}
  totalItems={50}
  onPageChange={(page) => console.log(page)}
/>
```

---

## 3. Drawer & Overlays (`src/components/ui/Drawer.tsx`)

### `<Drawer>`
A sliding side-panel drawer featuring Esc key and backdrop tap triggers.

```tsx
import { Drawer } from "@/components/ui/Drawer";

<Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} title="Vehicle Dossier">
  <p>Specifications details here...</p>
</Drawer>
```

#### Properties
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `isOpen` | `boolean` | *Required* | Visibility state trigger. |
| `onClose` | `() => void` | *Required* | Drawer close event callback. |
| `title` | `string` | *Required* | Panel title. |
| `subtitle` | `string` | `undefined` | Optional secondary description text. |
| `size` | `"md" \| "lg" \| "xl"` | `"md"` | Drawer width sizing category. |

---

## 4. Modal & Dialog Overlay (`src/components/ui/Dialog.tsx`)

### `<Modal>`
A centered modal wrapper.

```tsx
import { Modal } from "@/components/ui/Dialog";

<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Upload Scans">
  <p>Modal body content...</p>
</Modal>
```

---

### `<Dialog>`
A standard overlay dialog with actions for operations confirmations.

```tsx
import { Dialog } from "@/components/ui/Dialog";

<Dialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleDelete}
  title="Are you sure?"
  description="This bulk operation will permanently suspend 5 selected users."
  isDestructive={true}
/>
```

---

## 5. Badges & Labels (`src/components/ui/Badge.tsx`)

### `<Badge>`
A tiny colored badge tag.

```tsx
import { Badge } from "@/components/ui/Badge";

<Badge variant="blue">New Member</Badge>
```

---

### `<StatusBadge>`
Standardizes badges by automatically mapping state values to designated theme colors.

```tsx
import { StatusBadge } from "@/components/ui/Badge";

<StatusBadge status="available" /> // Renders Emerald green badge
<StatusBadge status="maintenance" /> // Renders Red badge
```

---

## 6. Feedback States (`src/components/ui/FeedbackStates.tsx`)

### `<EmptyState>`
Provides fallback instructions for blank queries.

```tsx
import { EmptyState } from "@/components/ui/FeedbackStates";

<EmptyState description="Verify that your dates filter inputs are configured correctly." />
```

---

### `<LoadingState>`
Spinning loop loader animation with customized message.

```tsx
import { LoadingState } from "@/components/ui/FeedbackStates";

<LoadingState message="Syncing ledger databases..." />
```

---

### `<Skeleton>`
A pulse loader overlay for skeleton card states.

```tsx
import { Skeleton } from "@/components/ui/FeedbackStates";

<Skeleton variant="rectangular" className="h-44 w-full" />
```

---

## 7. Form Controls (`src/components/ui/FormControls.tsx`)

### `<SearchBox>`
A text input field for real-time searches.

```tsx
import { SearchBox } from "@/components/ui/FormControls";

<SearchBox value={searchVal} onChange={setSearchVal} />
```

---

### `<FilterBar>`
A responsive grid wrapper that organizes dropdown elements.

```tsx
import { FilterBar } from "@/components/ui/FormControls";

<FilterBar>
  <select>...</select>
  <select>...</select>
</FilterBar>
```

---

### `<DatePicker>`
A structured input field with calendar icons.

```tsx
import { DatePicker } from "@/components/ui/FormControls";

<DatePicker label="Start Date" value={dateVal} onChange={setDateVal} />
```

---

### `<FormField>`
An input wrapper that supports label text, descriptions, and validation error messages.

```tsx
import { FormField } from "@/components/ui/FormControls";

<FormField label="Email" error={errors.email}>
  <input type="email" />
</FormField>
```

---

### `<FileUploader>`
A drag-and-drop document upload panel with file verification tags.

```tsx
import { FileUploader } from "@/components/ui/FormControls";

<FileUploader label="Driving License Scan" value={url} onChange={setUrl} />
```

---

## 8. Extras Layout Helpers

### `<PageHeader>` (`src/components/ui/PageHeader.tsx`)
A top layout banner displaying page headers and actions.

---

### `<StatGrid>` (`src/components/ui/StatGrid.tsx`)
A CSS grid wrapping metrics collections.

---

### `<ActionMenu>` (`src/components/ui/ActionMenu.tsx`)
A popover listing available actions (e.g. for row operations).

---

### `<Timeline>` (`src/components/ui/Timeline.tsx`)
A chronological vertical logger list displaying audit histories.
