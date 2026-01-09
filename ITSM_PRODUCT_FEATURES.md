# Enterprise IT Service & Asset Management Platform (ITSM)

## Active Product Features & Capabilities

### **Executive Summary**

A fully functional ITSM solution currently deployed with active workflows for asset lifecycle management, IT support, role-based access control, and employee offboarding. The following features are **live and operational**.

---

### **1. Identity & Access Management (Active)**

- **Role-Based Access Control (RBAC):** Distinct operational environments for 6 active roles:
  - **System Administrator:** Omnipotent control over users and platform settings.
  - **IT Management:** Technical oversight, ticket resolution, and BYOD security.
  - **Asset & Inventory Manager:** Stock control, warehouse management, and allocation.
  - **Procurement & Finance:** Purchase order approval and vendor delivery confirmation.
  - **Manager:** Team-level approval for asset requests.
  - **End User/Employee:** Self-service portal for requests and support.
- **User Onboarding:**
  - Self-registration with "Pending" status.
  - System Admin dashboard approval workflow to activate new accounts.
- **Session Management:** Secure login with persistent sessions.

---

### **2. Asset Lifecycle & Inventory (Active)**

- **Asset Repository:** Central database of all hardware assets with detailed specifications, status, and assignment history.
- **Dual-State Inventory Tracking:**
  - **`AssetInventory` Table:** Real-time tracking of unassigned ("In Stock") items.
  - **`AssetAssignment` Table:** Historical and active logging of assets assigned to users.
- **Automatic Inventory Logic:**
  - Assets marked "In Stock" automatically populate the Warehouse view.
  - Assets assigned to users are automatically removed from Warehouse and linked to User Profiles.
- **Smart Search:** Real-time asset lookup with filtering by Assigned User, Serial Number, or Type.

---

### **3. Procurement & Allocation Workflow (Active)**

A hardcoded, multi-stage approval pipeline:

1.  **Request:** Employee submits request for new hardware (e.g., "High-Performance Laptop").
2.  **Manager Approval:** Reporting manager validates the need.
3.  **IT Verification:** IT checks technical requirements.
4.  **Procurement Action:**
    - If **In Stock**: Routes to Inventory Manager for immediate allocation.
    - If **Out of Stock**: Routes to Finance for Purchase Order creation.
5.  **Delivery & Onboarding:** Procurement confirms vendor delivery -> Asset is created in system -> Inventory Manager allocates to user.

---

### **4. IT Support & Ticketing (Active)**

- **Incident Management:**
  - Users raise tickets for specific assets (auto-linked).
  - IT Dashboards display "Open Incidents".
- **Resolution Workflow:**
  - **Acknowledge:** IT staff marks ticket as "In Progress".
  - **Diagnosis:** Technician records diagnosis notes.
  - **Resolution Checklist:** Mandatory steps (e.g., "Verify Backup", "Run Diagnostics") must be checked before closure.
  - **Completion:** Ticket marked resolved with closure notes.

---

### **5. Exit Management & Offboarding (Active)**

A specialized 4-step workflow to ensure asset security during employee departure:

1.  **Initiation (System Admin):** Triggers the workflow. System creates a **frozen snapshot** of all assets and BYOD devices currently holding by the user.
2.  **Asset Reclamation (Inventory Manager):** Dedicated dashboard view to process physical returns. Assets are physically checked in and status updates to "In Stock" (Available).
3.  **BYOD De-registration (IT Manager):** Digital wiping/unlinking of personal devices from corporate network.
4.  **Finalization (System Admin):** Final review and permanent account deactivation.

---

### **6. End User Services (Active)**

- **"My Assets" View:** Employees see a live list of equipment currently assigned to them.
- **Service Catalog:** Interface to request new assets or report issues.
- **BYOD Registration:** Form to register personal devices (Phone/Laptop) for corporate use, subject to IT approval.

---

### **7. Dashboards & Analytics (Active)**

- **System Admin Dashboard:**
  - Live counter of Active Users vs Pending Requests.
  - Real-time distribution charts (Pie/Bar) of Asset Status, Types, and Locations.
  - Financial "Net Asset Value" calculation (depreciation estimate).
  - Export-to-CSV functionality for external reporting.
- **Inventory Dashboard:**
  - Critical Shortage Alerts.
  - Reorder Level indicators.
  - Stock Control view.
