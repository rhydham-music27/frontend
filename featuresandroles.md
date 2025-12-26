# Manager & Coordinator – Roles, Features, and Pages

This document describes the **roles of Manager and Coordinator** in the Your Shikshak platform and lists the **contents and key features of every page** they use in the web app.

---

## 1. Role Overview

### 1.1 Manager

**Primary responsibility:** Owns the **business pipeline** – from lead creation to conversion into final classes – and supervises coordinators, tutors, and overall revenue/performance.

**Key responsibilities:**
- **Lead lifecycle ownership**
  - Create and manage class leads from NEW → DEMO → CONVERTED.
  - Announce leads to tutors and assign demo tutors.
  - Convert approved demos into final classes.
- **Team management**
  - Verify and approve tutors.
  - Create and manage coordinator profiles.
  - Monitor coordinator workload and performance via analytics.
- **Operational oversight**
  - Track attendance trends at a high level (via attendance pages).
  - Oversee payments and payment status for classes.
  - Review overall business metrics: leads, conversions, revenue.

**What the Manager does _not_ do directly:**
- Does not manage day‑to‑day attendance approvals (that is a Coordinator responsibility).
- Does not handle micro‑level class coordination; instead assigns coordinators and tracks performance.

---

### 1.2 Coordinator

**Primary responsibility:** Owns the **execution of active classes** – attendance, tests, announcements, payments tracking, and day‑to‑day coordination with tutors, parents, and students.

**Key responsibilities:**
- **Class operations**
  - Manage assigned classes and their schedules.
  - Track class progress and workload (how many classes assigned/active/handled).
- **Attendance workflow**
  - Review, approve, or reject tutor‑submitted attendance.
  - Maintain accurate attendance history and statistics.
- **Academic & communication operations**
  - Schedule tests for classes and monitor results.
  - Send announcements to classes/parents/students.
  - Track tutor performance and raise/handle issues.
- **Financial follow‑ups**
  - Track payment status for classes and trigger reminders.

**What the Coordinator does _not_ do:**
- Does not create leads or convert them into final classes.
- Does not create/manage coordinators or managers.
- Does not verify tutors (this remains with Manager/Admin).

---

## 2. Manager Pages – Contents & Features

Manager‑facing routes (from `ROUTES.md` and `App.tsx`):
- `/` (index – Manager Dashboard when role is MANAGER/ADMIN)
- `/class-leads` and nested
- `/tutors`
- `/coordinators`
- `/attendance`
- `/payments` and nested
- `/analytics`
- `/profile` (Manager profile)
- `/manager-today-tasks`

Below is what each page contains and does.

### 2.1 Manager Dashboard (index `/` for MANAGER)

**Purpose:** High‑level **overview** of manager performance and pipeline.

**Contents & features:**
- Summary metrics (via dashboard and `/api/dashboard` & `/api/managers`):
  - Total class leads created.
  - Demos scheduled.
  - Classes converted.
  - Revenue generated.
  - Conversion rate and other performance metrics.
- Quick access navigation to:
  - Class leads list.
  - Tutor verification page.
  - Coordinators management.
  - Attendance and payments pages.
  - Analytics and profile.

> Note: The exact widget layout is implemented via shared dashboard components (`MetricsCard`, etc.), but conceptually this page gives a manager a **snapshot of how the business is performing today and historically**.

---

### 2.2 Class Leads Module (`/class-leads`)

Routes:
- `/class-leads` – List page.
- `/class-leads/new` – Create class lead.
- `/class-leads/:id` – Detail view.
- `/class-leads/:id/edit` – Edit lead.

#### 2.2.1 `/class-leads` – Class Leads List Page (`ClassLeadsListPage`)

**Overall purpose:** End‑to‑end **lead pipeline workspace** for the manager, with filters, responsive list, and inline actions.

**Layout & sections:**
- **Page header bar (top of page)**
  - Left side:
    - `Class Leads` title (`Typography variant="h4"`).
    - Short description text about managing and tracking leads.
  - Right side:
    - `New Lead` button (`Button` with `AddIcon`).
      - Navigates to `/class-leads/new`.
      - Primary action for creating a fresh lead.

- **Filters panel**
  - `ClassLeadFilters` component rendered above the list.
  - Controls inside filters:
    - **Status dropdown** – choose one of the `CLASS_LEAD_STATUS` values.
    - **Search input** – free‑text search by student/parent/phone.
    - **Apply / Clear buttons** inside the filter component.
  - Page‑level handlers:
    - `handleFilterChange` merges new filter values and resets page to 1.
    - `handleClearFilters` resets all filters and pagination.

- **Main list area (responsive)**
  - **On desktop / large screens**
    - `DataGrid` from MUI shows one row per lead with columns:
      - `Student Name` – `studentName` field.
      - `Grade` – grade value.
      - `Subjects` – complex rendering logic:
        - Attempts to read subject information from multiple properties (`subject`, `subjects`, `subjectList`, `subject_names`, etc.).
        - Parses JSON‑like strings if needed.
        - Renders each subject as a `Chip`.
      - `Status` – rendered as `ClassLeadStatusChip` to show colored status chips.
      - `Created At` – formatted date.
      - **Actions column** with three icon buttons:
        - `View` (`VisibilityIcon`) – opens detail page `/class-leads/:id`.
        - `Edit` (`EditIcon`) – opens edit page `/class-leads/:id/edit`.
        - `Delete` (`DeleteIcon`) – triggers deletion.
    - Server‑side pagination:
      - Uses `pagination.total` and `filters.page`.
      - `onPaginationModelChange` updates the current page.

  - **On mobile / small screens (`isXs === true`)**
    - Replaces the table with a **stack of cards**, one card per lead:
      - Card body shows key fields:
        - Student name, grade, status chip.
        - Derived subjects as chips.
      - Card footer shows **three full‑width buttons**:
        - `View` – navigates to detail.
        - `Edit` – navigates to edit form.
        - `Delete` – calls `handleDelete` for that lead.

- **Pagination bar (bottom)**
  - `Pagination` component separate from DataGrid.
  - Shows current page, total pages from `pagination.pages`.
  - `onChange` calls `handlePageChange` and updates filters.

- **Feedback components**
  - `LoadingSpinner` when `loading` is true and leads are not yet loaded.
  - `ErrorAlert` when `error` exists.
  - `SnackbarNotification`:
    - Shown after actions like delete.
    - Displays success or error messages.

**Buttons & interactions summary:**
- `New Lead` (top‑right) – create new lead.
- Filter controls in `ClassLeadFilters` – change status/search and apply/clear.
- In each desktop row / mobile card:
  - `View` – go to details.
  - `Edit` – go to edit.
  - `Delete` – delete the lead and show snackbar.
- Pagination arrows/page numbers – navigate pages.

#### 2.2.2 `/class-leads/new` – Create Class Lead Page (`CreateClassLeadPage`)

**Overall purpose:** Dedicated **creation form** for a new class lead.

**Layout & sections:**
- **Header bar**
  - `Back to List` button (`Button` with `ArrowBackIcon`):
    - Navigates back to `/class-leads`.
  - Page title `Create New Class Lead`.

- **Lead creation card**
  - Single `Card` containing `ClassLeadForm` component.
  - `ClassLeadForm` sections (from its implementation, not reproduced here):
    - Student and parent details.
    - Academic preferences (grade, board, subjects, mode).
    - Schedule and budget fields.
    - Notes and additional preferences.
  - The form’s primary button text is `Create Lead`.

- **Snackbar area**
  - `SnackbarNotification` shows:
    - `Lead created successfully` on success.
    - Any error messages from API failures.

**Buttons & interactions:**
- `Back to List` – safe navigation back without saving.
- `Create Lead` (inside `ClassLeadForm`):
  - Calls `handleSubmit`.
  - On success:
    - If API returns created ID → navigate to `/class-leads/:id`.
    - Otherwise → navigate back to `/class-leads`.

#### 2.2.3 `/class-leads/:id` – Class Lead Detail Page (`ClassLeadDetailPage`)

**Overall purpose:** Full **single‑lead workspace** showing data, status history, demos, and tutor interest, with all related actions.

**Layout & sections:**
- **Top bar**
  - `Back` button (`ArrowBackIcon`) – navigate back to `/class-leads`.
  - Lead title and basic identifiers (student name, grade, etc.).
  - Action icons/buttons on the right:
    - `Edit` (`EditIcon`) – go to `/class-leads/:id/edit`.
    - `Delete` (`DeleteIcon`) – confirm and delete lead.
    - `More` menu (`MoreVertIcon`) – extra actions like announce to tutors, convert to final class (menu entries defined in the component).

- **Status and lifecycle section**
  - `ClassLeadStatusChip` shows current lead status.
  - `StatusTimeline` component:
    - Visual timeline of status changes (NEW → ENQUIRY → ANNOUNCED → DEMO_* → CONVERTED/REJECTED etc.).
    - Each node in the timeline corresponds to a lifecycle state.

- **Lead information section**
  - A `Card` with `Grid` layout summarizing:
    - Student details (name, grade, board, mode).
    - Parent contact information.
    - Location, schedule, fees, and class configuration (1‑1/group, duration, classes per month, etc.).
    - Preferred tutor gender and other preferences.
    - Subjects, rendered as `Chip`s.
    - For group leads: **Student Details** subsection, each student in its own bordered box with name, fees, tutor fees, etc.

- **Demo & tutor engagement section**
  - `DemoHistory` area driven by `demoHistory` state:
    - Shows previous demos, their dates, and statuses.
  - `InterestedTutorsModal` and `DemoAssignmentModal` are controlled by the page:
    - Buttons/menu items open these modals.
    - Allow choosing among interested tutors and assigning / updating a demo.

- **Announcement section**
  - If an announcement exists for this lead (`announcement` state):
    - Shows summary (e.g., when it was sent, to which tutors).
  - `AnnouncementModal` is used to **create or update an announcement**:
    - Opened via button with `AnnouncementIcon` or menu.
    - Lets manager configure message and send to tutors.

- **Feedback & error handling**
  - `LoadingSpinner` while data loads.
  - `ErrorAlert` if any request fails.
  - `SnackbarNotification` for success/error results from actions (demo assignment, announcement, etc.).

**Buttons & interactions:**
- `Back` – return to list.
- `Edit` – open edit page.
- `Delete` – confirm dialog and delete lead.
- `More` menu:
  - Entries like `Announce Lead`, `Assign Demo`, `Convert to Final Class` (depending on status and constants).
- `Announcement` button – open `AnnouncementModal`.
- `Interested Tutors` button – open `InterestedTutorsModal`.
- `Assign Demo` button – open `DemoAssignmentModal`.
- In each modal, **primary action buttons** (e.g., `Send Announcement`, `Assign Demo`) execute the corresponding API calls via `leadService` or `demoService`.

#### 2.2.4 `/class-leads/:id/edit` – Edit Class Lead Page (`EditClassLeadPage`)

**Overall purpose:** **Edit existing lead** details and, importantly, adjust its **status**.

**Layout & sections:**
- **Header bar**
  - `Back to List` button (`ArrowBackIcon`) – navigate to `/class-leads`.
  - Title `Edit Class Lead`.

- **Status selector section**
  - `TextField` with `select` enabled labeled `Lead Status`.
  - Options generated from `CLASS_LEAD_STATUS` enum.
  - Lets manager change the lifecycle state (e.g., NEW → ENQUIRY → DEMO_SCHEDULED → CONVERTED).

- **Edit form card**
  - `ClassLeadForm` with `initialData={classLead}` to prefill fields.
  - Same sections as in create form: student/parent, preferences, schedule, etc.
  - Submit button text `Update Lead`.

- **Feedback components**
  - Full‑screen `LoadingSpinner` while fetching the existing lead.
  - `ErrorAlert` container if load fails.
  - `SnackbarNotification` shows `Lead updated successfully` on success.

**Buttons & interactions:**
- `Back to List` – navigate back.
- `Lead Status` dropdown – change status; on submit, if status changed, `updateClassLeadStatus` is called.
- `Update Lead` – submits form and then navigates back to detail page `/class-leads/:id`.

---

### 2.3 Tutor Verification (`/tutors` – `TutorVerificationPage`)

**Purpose:** Central **workspace for verifying tutors**, reviewing documents, and managing verification status.

**Layout & sections:**
- **Header**
  - `Tutor Verification Management` title at top.

- **Tabs card**
  - `Card` containing a `Tabs` component with two tabs:
    - `Pending Verifications (X)` – shows number of tutors awaiting decision.
    - `All Tutors` – lists every tutor, including already verified/rejected.

- **Tab 1 – Pending Verifications**
  - Shows different content depending on `loading` and `error`:
    - If loading → `LoadingSpinner`.
    - If error → `ErrorAlert` with message like *Failed to fetch pending verifications*.
    - If data loaded → `Grid` of cards, one per pending tutor.
  - Each **tutor card** includes:
    - Tutor name and `VerificationStatusChip` (status visual).
    - Contact details (email and phone).
    - Experience and subjects summary.
    - **Documents section**:
      - Text `Documents (N)` showing how many items are uploaded.
      - `Verify Documents` button:
        - Opens the **Documents dialog** (`Dialog` with `DocumentViewer`).
        - Inside `DocumentViewer`, each document has preview and a `View` button.
    - **Primary action button** at bottom:
      - `Review & Verify` – opens **Verification modal**.

- **Tab 2 – All Tutors**
  - Shows all tutors fetched via `useTutors` hook.
  - Each card includes:
    - Tutor name, verification status chip.
    - Email and phone.
    - Experience hours.
    - Subjects list.
    - `View` button:
      - Opens same **Verification modal** used in pending tab, allowing manager to re‑review details or change status.
  - At bottom / below grid:
    - `ErrorAlert` bound to `tutorsError` to display any listing issues.

- **Dialogs & modals**
  - **Documents dialog** (`docsOpen`):
    - Shows `DocumentViewer` for the selected tutor.
    - Each document row has internal `View` controls to open PDFs/images, using iframe/img.
  - **Single document viewer dialog** (`viewerOpen`):
    - Shows selected document in full.
  - **Verification modal** (`VerificationModal`):
    - Presents a form to choose **verification status** (e.g., APPROVED / REJECTED) and **verification notes**.
    - On submit, calls `updateVerificationStatus` with tutor ID and payload.

- **Feedback**
  - `SnackbarNotification` shows results: `Verification updated` or error messages.

**Buttons & interactions summary:**
- Tabs: `Pending Verifications`, `All Tutors` – switch between lists.
- On each pending tutor card:
  - `Verify Documents` – opens document list dialog.
  - `Review & Verify` – opens verification form modal.
- On each tutor in `All Tutors` tab:
  - `View` – open verification modal.
- Inside verification modal:
  - Status dropdown and notes field.
  - `Submit` / `Save` button – updates verification status and refreshes lists.
- Inside document dialogs:
  - `View` button on each document – opens document in viewer.

---

### 2.4 Coordinators Management (`/coordinators` – `CoordinatorsPage`, Manager view)

**Purpose:** Allow managers to **create coordinator profiles** from eligible users and **monitor coordinator workload**.

**Layout & sections:**
- **Page container**
  - Centered layout with `Container maxWidth="md"`.
  - Uses responsive behavior: for small screens (`isXs`) it shows card lists; for larger screens it shows a table.

- **Create Coordinator section (top card)**
  - **Autocomplete user selector**
    - `Autocomplete` backed by `users` (from `getEligibleCoordinatorUsers`).
    - Options are users with role `COORDINATOR` but **no existing coordinator profile**.
    - When user selects a person, `selectedUser` is updated.
    - While loading list, shows `CircularProgress`.
  - **Max class capacity input**
    - `TextField` numeric input labeled `Max Class Capacity`.
    - Bound to `maxClassCapacity` state.
  - **Create button**
    - `Create Coordinator` button inside a `<form>`:
      - On submit, calls `createCoordinator({ userId, maxClassCapacity })`.
      - On success:
        - Shows snackbar `Coordinator created successfully`.
        - Resets selector and capacity to defaults.
        - Refreshes coordinators list via `loadCoordinators`.
      - On failure:
        - Shows error via `ErrorAlert` and snackbar with detailed error text.

- **Coordinators list section (bottom)**
  - **On small screens (`isXs`): card list view**
    - `Stack` of cards, one card per coordinator.
    - Each card shows:
      - Name and email.
      - Two small metrics:
        - `Active` – `activeClassesCount`.
        - `Total` – `totalClassesHandled`.
      - `Active/Inactive` chip based on `isActive` flag.
      - If loading, a simple `Loading...` text.
  - **On larger screens: table view**
    - `Table` inside `Paper`:
      - Columns:
        - `Name` – coordinator’s user name.
        - `Email` – coordinator email.
        - `Active Classes` – `activeClassesCount`.
        - `Total Classes` – `totalClassesHandled`.
        - `Status` – `Active` / `Inactive` chip.
      - Loading state:
        - When `tableLoading` is true → single row with `CircularProgress`.
      - Empty state:
        - Row with `No coordinators found` message.
    - `TablePagination` under the table:
      - `page` and `rowsPerPage` controls.
      - Changing page or rows per page calls `loadCoordinators` with new parameters.

- **Error and feedback**
  - `ErrorAlert` at top shows messages like `Failed to load users`.
  - `SnackbarNotification` summarises coordinator creation success/failure.

**Buttons & interactions summary:**
- `Create Coordinator` – sends create request with selected user and capacity.
- Autocomplete dropdown – selects which eligible user becomes a coordinator.
- Pagination controls – change page and rows per page.
- `Active/Inactive` chip is display‑only (no toggle in this UI).

> Separate admin‑only pages (`/admin/coordinators`) exist for system‑wide management but are not part of the core Manager role.

---

### 2.5 Attendance (`/attendance` – `AttendanceListPage`)

**Purpose:** Provide a unified **attendance management** view, including pending approvals and a full history with filters.

**Layout & sections:**
- **Header**
  - Title `Attendance Management`.

- **Tabs card**
  - `Card` with two tabs:
    - `Pending Approvals` – focuses on items needing action.
    - `All Attendance` – full list with filtering.

- **Tab: Pending Approvals**
  - When selected and user is **Coordinator or Parent**:
    - `fetchPending` calls either `getCoordinatorPendingApprovals` or `getParentPendingApprovals`.
  - **States and contents:**
    - While `loadingPending` → `LoadingSpinner`.
    - Otherwise:
      - Section title `Pending Approvals (N)`.
      - One `AttendanceApprovalCard` per pending record with:
        - Session date, class information, tutor, and status.
        - Two buttons per card:
          - `Approve` – triggers `handleApprove` and calls appropriate service (`approveAsCoordinator` or `approveAsParent`).
          - `Reject` – opens **Reject modal** with the selected attendance.
      - If `pending.length === 0` → text `No pending approvals.`

- **Tab: All Attendance**
  - **Filters row**
    - `Status` dropdown (`TextField select`):
      - Values from `ATTENDANCE_STATUS` enum.
      - `All` option to clear filter.
    - `From` date input:
      - `TextField type="date"` with `InputLabelProps={{ shrink: true }}`.
    - `To` date input – same pattern.
    - `Clear Filters` button – resets filter state to defaults and page to 1.
  - **Data grid card**
    - `Card` containing `DataGrid`:
      - Columns defined with `GridColDef`:
        - `Date` (`sessionDate`) – formatted to locale date.
        - `Student` / `Class` fields (the grid uses `attendances` rows with type `IAttendance`).
        - `Tutor` – `attendance.tutor?.name`.
        - `Status` – rendered with `AttendanceStatusChip` (colorful chip for each status).
      - Server‑side pagination using `pagination.total` and `filters.page`.
      - `onPaginationModelChange` updates current page.
    - Below grid: `ErrorAlert` shows any `error` from `useAttendance`.

- **Modals and feedback**
  - `RejectAttendanceModal`:
    - Opens when user clicks `Reject` in pending approvals.
    - Provides textarea for entering **reason**.
    - On submit, calls `rejectRecord(selected.id, reason)` and refreshes lists.
  - `SnackbarNotification`:
    - Shows `Attendance approved` or `Attendance rejected` messages.

**Buttons & interactions summary:**
- `Pending Approvals` / `All Attendance` tabs – change view and related data loading.
- For each pending record:
  - `Approve` button – approve attendance.
  - `Reject` button – open reject modal.
- In `All Attendance`:
  - `Status` dropdown, `From` / `To` date pickers – refine list.
  - `Clear Filters` – reset filters and reload.
- Pagination controls in DataGrid – move through pages of attendance.

---

### 2.6 Payments (`/payments`)

Routes:
- `/payments` – Payment list.
- `/payments/:id` – Payment detail.

#### 2.6.1 `/payments` – Payments List Page (`PaymentsListPage`)

**Purpose:** Show **all payments** with quick stats, filters, and inline status updates.

**Layout & sections:**
- **Summary & filters card**
  - Uses `Card` with filter controls and quick stats.
  - Filters:
    - `Status` dropdown (from `PAYMENT_STATUS`): PENDING/PAID/OVERDUE/etc.
    - Optional `Tutor`, `Class`, and date range fields (`From`, `To`) backed by `filters` state.
    - `Clear Filters` button – resets all filters (`{ page: 1, limit: 10 }`).
  - Statistics:
    - Derived with `useMemo` from `payments` list:
      - `totalPayments` – count of rows.
      - `totalAmount` – sum of `amount`.
      - `paidAmount`, `pendingAmount`, `overdueAmount` separated by status.
    - Some of these summary values are shown as highlighted text or chips at top of the page.

- **Main list card**
  - Wrapper `Card` that renders either mobile cards or a DataGrid depending on screen size.

  - **On mobile / small screens**
    - `Stack` of small cards, each representing one payment:
      - Top row:
        - Date label (payment or created date).
        - `Chip` with payment status (color depends on status: PAID → green, OVERDUE → red, others → default).
      - Middle content:
        - Amount with currency (e.g., `₹ 2000`).
        - Tutor name.
        - Class name with subjects.
        - Payment method and transaction ID.
        - Due date.
      - Bottom row:
        - `Edit` button – opens **Payment update modal**.

  - **On desktop / larger screens**
    - `DataGrid` table with precomputed `tableRows`:
      - Columns (via `GridColDef`):
        - `Date` – derived from payment/due/created date.
        - `Class` – combination of student/class name and subject(s).
        - `Tutor` – tutor name/email.
        - `Amount` – formatted currency.
        - `Status` – rendered as `PaymentStatusChip`.
        - `Method` – payment method.
        - `Due Date` – when payment is due.
        - **Actions** column – `Edit` button to open update modal.
      - Server‑side‑style pagination:
        - Uses `pagination.total`, `filters.page`, `filters.limit`.
        - `onPaginationModelChange` updates page in `filters`.

- **Modals and feedback**
  - `PaymentUpdateModal`:
    - Opens when `Edit` is clicked.
    - Contains form fields:
      - `Status` (dropdown from `PAYMENT_STATUS`).
      - `Payment Method`.
      - `Transaction ID`.
      - `Notes`.
    - On submit:
      - Calls `updateStatus(selected.id, payload)`.
      - Closes modal, triggers snackbar, and refreshes data (`refetch`).
  - `SnackbarNotification` – shows `Payment updated` or error texts.
  - `ErrorAlert` – bound to `error` from `usePayments`.

**Buttons & interactions summary:**
- Filter controls: `Status`, `From`, `To`, plus any tutor/class filters.
- `Clear Filters` button – reset filters.
- For each payment:
  - `Edit` – open `PaymentUpdateModal`.
- In modal:
  - `Save` / `Update` button – update payment fields and status.
- Pagination controls in DataGrid – navigate through pages.

#### 2.6.2 `/payments/:id` – Payment Detail Page (`PaymentDetailPage`)

**Purpose:** Show **full details for a single payment**, including history and related attendance/class info, with ability to change status.

**Layout & sections:**
- **Header bar**
  - `Back` button (`ArrowBackIcon`) – uses `navigate(-1)` to go back to previous page.
  - Title `Payment Details`.

- **Main grid layout**
  - Two‑column layout on desktop, stacked on mobile:
    - **Left column – Payment Information card**
      - Header row:
        - Title `Payment Information`.
        - `Update Status` button with `EditIcon` – opens `PaymentUpdateModal`.
      - Details grid:
        - `Amount` – `currency` and `amount`.
        - `Status` – rendered with `PaymentStatusChip`.
        - `Method` – payment method (e.g., UPI, Cash, Bank Transfer).
        - `Txn ID` – transaction reference / ID.
        - `Payment Date` – full datetime.
        - `Due Date` – date only.
        - `Notes` – free text.
      - `Related Information` subsection:
        - Tutor name.
        - Class label combining studentName and subjects.
        - If `attendance` is linked:
          - `Session Date`.
          - `Attendance Status`.

    - **Right column – Payment History card**
      - Title `Payment History`.
      - `PaymentHistoryTable` component:
        - Shows chronological entries for this payment (status changes, edits, etc.).
        - `showTutor` and `showClass` set to false here to keep it focused.

- **Modals & feedback**
  - `PaymentUpdateModal`:
    - Same fields as in list page.
    - On submit, calls `updatePaymentStatus(id, payload)` then re‑fetches full data.
  - `ErrorAlert` shows any error from `getPaymentById` or `getAttendanceById`.
  - `SnackbarNotification` message `Payment updated` when update succeeds.

**Buttons & interactions summary:**
- `Back` – go to previous page.
- `Update Status` – open edit modal.
- In modal:
  - Fields for status/method/txnID/notes.
  - Submit button to apply changes.

---

### 2.7 Manager Analytics (`/analytics` – `ManagerAnalyticsPage`)

**Purpose:** Provide **deep analytics** specific to the logged‑in manager.

**Contents (from `ManagerAnalyticsPage.tsx`):**
- **Top metrics cards** (`MetricsCard` components):
  - Class leads created.
  - Demos scheduled.
  - Classes converted.
  - Revenue generated.
  - Tutors verified.
  - Conversion rate.
  - Average revenue per class.
  - Average demos per lead.
- **Date range picker**:
  - Select `fromDate` and `toDate` to recalculate metrics and history.
- **Performance Over Time** table:
  - Date.
  - Leads created.
  - Classes converted.
  - Revenue.
  - Conversion rate per day.

**Key features:**
- Fetch and display manager’s own metrics from `/api/managers/my-metrics` and performance history.
- Allow managers to analyze performance over any date window.
- Identify trends in lead creation, conversion, and revenue.

---

### 2.8 Manager Profile (`/profile` when role is MANAGER – `ManagerProfilePage`)

**Purpose:** Give managers a **self‑centric view** of their profile, metrics, and recent activity.

**Buttons & interactions summary:**
- `DateRangePicker` controls – update metrics time window.
- `Overview` / `Activity Log` tabs – toggle between view modes in the bottom card.
- Scroll and list interactions – read full activity history.

> This route is role‑switched: for manager it shows `ManagerProfilePage`, for other roles it shows their respective profile pages.

---

### 2.9 Manager Today’s Tasks (`/manager-today-tasks` – `ManagerTodayTasksPage`)

**Purpose:** Show **actionable items for the manager for today**, focusing on **open leads** and **classes missing coordinators**.

**Contents (from `ManagerTodayTasksPage.tsx`):**
- **Open Leads summary**:
  - Count of leads where status ≠ `CONVERTED`.
  - Chips showing counts by each status (e.g., NEW, ENQUIRY, DEMO_SCHEDULED, etc.).
- **Unassigned Classes section**:
  - List of classes that do not yet have a coordinator assigned.
  - Class details (student name, grade, basic class info).
- **Assign Coordinator dialog**:
  - Dropdown list of coordinators fetched from `coordinatorService`.
  - Ability to pick a coordinator and assign to a selected class.

**Key features:**
- Refresh lead list on demand.
- Quickly see where follow‑ups are needed in the lead pipeline.
- Find classes that are running without a coordinator and **assign a coordinator** directly.

---

## 3. Coordinator Pages – Contents & Features

Coordinator‑facing routes (from `ROUTES.md` and `App.tsx`):
- `/coordinator-dashboard`
- `/today-tasks`
- `/assigned-classes`
- `/attendance-approvals`
- `/test-scheduling`
- `/announcements`
- `/test-reports`
- `/tutor-performance`
- `/payment-tracking`
- `/coordinator-profile`
- `/coordinator-settings`

Below is what each Coordinator page contains and does.

### 3.1 Coordinator Dashboard (`/coordinator-dashboard` – `CoordinatorDashboardPage`)

**Purpose:** Provide a **single view of coordinator workload and performance**.

**Contents (from `CoordinatorDashboardPage.tsx`):**
- **Header section:**
  - Title: “Coordinator Dashboard”.
  - Welcome message with the coordinator’s name.
  - **Refresh** button to reload stats.
- **Overview metrics (MetricsCards):**
  - Total classes assigned.
  - Active classes.
  - Total classes handled (historical).
  - Pending attendance approvals.
  - Today’s tasks count.
  - Performance score.
- **Today’s Tasks Summary cards:**
  - Pending attendance count.
  - Payment reminders.
  - Tests to schedule.
  - Parent complaints.

**Key features:**
- Instantly see how many classes and tasks the coordinator is responsible for.
- Monitor pending approvals and payment follow‑ups.
- Refresh data via `useCoordinator` hook and API calls.

---

### 3.2 Today’s Tasks (`/today-tasks` – `TodayTasksPage` for coordinator)

**Purpose:** Give coordinators a **daily action board** of everything that needs attention: attendance, payments, tests, and complaints.

**Buttons & interactions summary:**
- Priority chips (`All`, `Overdue`, `Today`, `Upcoming`) – refine tasks by urgency.
- Summary cards – switch tab to that category.
- Tab bar – switch between `all`, `attendance`, `payments`, `tests`, `complaints`.
- `Refresh` – reload tasks from backend.
  - `/attendance-approvals` for attendance.
  - `/payment-tracking` for payments.
  - `/test-scheduling` for tests.
  - Complaint handling screens.

---

### 3.3 Assigned Classes (`/assigned-classes` – `AssignedClassesPage`)

**Purpose:** Provide coordinators with a **complete view of all their classes** and tools to filter, inspect, and trigger advance payments.

**Buttons & interactions summary:**
- `Refresh` icon – reload class list.
- `Toggle view` – switch between grid and list representation.
- Filters: `Status`, `Subject`, `Grade` fields.
- `Clear Filters` – resets filters and refreshes data.
- For each class card:
  - `View Details` – navigate to class details for further actions (attendance, tests).
  - `Generate Advance Payment` – create an advance payment record for that class.
- Pagination arrows/page numbers – move between pages of assigned classes.

---

### 3.4 Attendance Approvals (`/attendance-approvals` – `AttendanceApprovalPage`)

**Purpose:** Core **attendance approval hub** for coordinators.

**Contents (from `AttendanceApprovalPage.tsx`):**
- **Tabs for different views:**
  - `pending` – attendance records awaiting approval.
  - `all` – all attendance records with filtering.
  - `history` – attendance history and statistics per class.
  - `sheets` – bulk attendance sheets awaiting approval.
- **Filters:**
  - Status, from/to dates, class selection.
- **Lists and components:**
  - Pending attendance list using `AttendanceApprovalCard`.
  - Class‑wise attendance history with statistics (total sessions, approved/pending/rejected, approval rate).
  - Attendance sheets using `AttendanceSheet` component, with export to PDF.
- **Modals and actions:**
  - Reject Attendance modal (`RejectAttendanceModal`) to capture rejection reason.

**Key features:**
- Approve or reject individual attendance records (`coordinatorApprove`, `rejectAttendance`).
- View and filter all attendance records for the coordinator’s classes.
- Inspect historical statistics per class to understand trends.
- Approve or reject bulk attendance sheets (`approveAttendanceSheet`, `rejectAttendanceSheet`).
- Export attendance sheets to PDF for reporting or sharing.

---

### 3.5 Test Scheduling (`/test-scheduling` – `TestSchedulingPage`)

**Purpose:** Let coordinators **schedule new tests** for their classes and manage the list of scheduled/completed tests.

**Buttons & interactions summary:**
- Tab bar: switch between scheduling view and list of scheduled tests.
- `Select Class`, `Test Date`, `Test Time`, `Notes` inputs.
- `Schedule Test` – sends scheduling request.
- For each scheduled test:
  - `Cancel Test` – cancel and update list.
- `Refresh` in header – reload both classes and test list.

---

### 3.6 Announcements (`/announcements` – `SendAnnouncementPage`)

**Purpose:** Let coordinators **compose and send announcements** and review **announcement history and stats**.

**Buttons & interactions summary:**
- Compose tab:
  - `Send` – dispatch new announcement.
  - `Send To` dropdown to choose audience.
  - Conditional `Select Class` / `Select Tutor` fields.
- History tab:
  - `Recipient Type`, `From`, `To` filters.
  - `Clear Filters` button.
  - Pagination to page through history.
- Global `Refresh` – reload either compose data (classes/stats) or history list.

---

### 3.7 Test Reports (`/test-reports` – `TestReportAnalysisPage`)

**Purpose:** Provide both **detailed test reports** and **analytics** so coordinators can understand performance across tests, classes, and tutors.

**Buttons & interactions summary:**
- Tabs: `Test Reports` / `Analytics` – switch between list and charts.
- Filters: `Class`, `Tutor`, `From`, `To`, `Status`.
- `Clear Filters` – reset all filters.
- In each `TestReportCard`:
  - `Download PDF` – triggers PDF generation/download.
- Pagination – browse more test reports.

---

### 3.8 Tutor Performance (`/tutor-performance` – `TutorPerformancePage`)

**Purpose:** Help coordinators **assess and manage tutor performance**, including tier management and feedback review.

**Buttons & interactions summary:**
- Filters: `Tier`, `Sort By`, `Order`, `Clear Filters`.
- For each tutor card:
  - `Manage Tier` – open tier modal.
  - `View Feedback` – switch to feedback view.
- In feedback view:
  - `Back to Tutors` – return to main list.
- Pagination – move between pages of tutors.

---

### 3.9 Payment Tracking (`/payment-tracking` – `PaymentTrackingPage`)

**Purpose:** Let coordinators **track overdue, upcoming, and past payments** for their classes and send payment reminders.

**Buttons & interactions summary:**
- Tabs & metrics cards – change between `overdue`, `upcoming`, and `history` payment lists.
- Filters – `Class`, `From Date`, `To Date`, `Clear Filters`.
- Each payment card:
  - `Send Reminder` – open reminder modal and send reminders.
  - `View Class` – jump to assigned classes page.
- Pagination – navigate result pages.

---

### 3.10 Coordinator Profile (`/coordinator-profile` – `CoordinatorProfilePage`)

**Purpose:** Give coordinators a **personal dashboard** for their profile and performance metrics.

**Buttons & interactions summary:**
- `DateRangePicker` – change metrics period.
- Tabs – switch between Overview and Activity sections.
- Internally, metrics drive other areas like dashboard and tasks.

---

### 3.11 Coordinator Settings (`/coordinator-settings` – `CoordinatorSettingsPage`)

**Purpose:** Allow coordinators to configure **attendance control rules** for tutors on their classes.

**Buttons & interactions summary:**
- `sameDayOnly` switch – toggles whether tutors can backdate attendance.
- `allowReschedule` switch – toggles whether tutors can create one‑time reschedules.
- `Save Settings` – persists configuration to backend.


---

## 4. High‑Level Differences – Manager vs Coordinator

- **Scope:**
  - Manager: End‑to‑end business pipeline (leads → demos → classes → revenue) and team oversight.
  - Coordinator: Day‑to‑day execution of active classes (attendance, tests, announcements, payments follow‑up).
- **Data focus:**
  - Manager: Aggregated analytics, revenue, conversion, tutor verification, coordinator capacity.
  - Coordinator: Class‑level details, attendance accuracy, academic performance, and parent/tutor communication.
- **Key pages:**
  - Manager: `/class-leads`, `/tutors`, `/coordinators`, `/attendance`, `/payments`, `/analytics`, `/manager-today-tasks`.
  - Coordinator: `/coordinator-dashboard`, `/today-tasks`, `/assigned-classes`, `/attendance-approvals`, `/test-scheduling`, `/announcements`, `/test-reports`, `/tutor-performance`, `/payment-tracking`.

This document should serve as the **single reference** for understanding how Manager and Coordinator roles are separated in the UI and what each of their pages is responsible for.
