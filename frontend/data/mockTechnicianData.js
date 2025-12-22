export const pendingSetupQueue = [
    {
        id: "AST-NEW-001",
        name: "MacBook Pro M3",
        serial: "C02G44Q",
        model: "MacBook Pro 16-inch",
        details: "36GB RAM / 1TB SSD",
        location: "IT Staging Area A",
        requestedFor: "Startups Team",
        user: "Sarah Jenkins",
        type: "New Employee",
        priority: "High",
        slaCountdown: "4h 30m"
    },
    {
        id: "AST-NEW-002",
        name: "Dell XPS 15",
        serial: "8H77-2K9",
        model: "Dell XPS 9530",
        details: "32GB RAM / 1TB SSD",
        location: "IT Staging Area B",
        requestedFor: "Design Team",
        user: "Mike Ross",
        type: "Replacement",
        priority: "Medium",
        slaCountdown: "12h 15m"
    },
    {
        id: "AST-NEW-003",
        name: "ThinkPad X1 Carbon",
        serial: "PX-99221",
        model: "Gen 11",
        details: "16GB RAM / 512GB SSD",
        location: "IT Staging Area A",
        requestedFor: "Sales",
        user: "Jessica Pearson",
        type: "New Employee",
        priority: "High",
        slaCountdown: "2h 45m"
    },
    {
        id: "AST-NEW-004",
        name: "Surface Laptop 5",
        serial: "MS-77281",
        model: "15-inch / Platinum",
        details: "16GB RAM / 512GB SSD",
        location: "IT Staging Area C",
        requestedFor: "HR Team",
        user: "Louis Litt",
        type: "New Employee",
        priority: "Low",
        slaCountdown: "24h 00m"
    }
];

export const openTickets = [
    {
        id: "INC-2024-001",
        asset: "MacBook Pro M1",
        category: "Software",
        issue: "Adobe CC Licensing Error",
        priority: "High",
        status: "In Progress",
        assignedTo: "John Doe",
        slaStatus: "Warning"
    },
    {
        id: "INC-2024-002",
        asset: "Dell UltraSharp Monitor",
        category: "Hardware",
        issue: "Flickering Screen",
        priority: "Medium",
        status: "Open",
        assignedTo: "Unassigned",
        slaStatus: "On Track"
    },
    {
        id: "REQ-2024-089",
        asset: "N/A",
        category: "Network",
        issue: "VPN Access Request for Remote User",
        priority: "Low",
        status: "Open",
        assignedTo: "Jane Smith",
        slaStatus: "On Track"
    },
    {
        id: "INC-2024-005",
        asset: "HP LaserJet Pro",
        category: "Hardware",
        issue: "Paper Jam / Roller Issue",
        priority: "Medium",
        status: "In Progress",
        assignedTo: "John Doe",
        slaStatus: "On Track"
    },
    {
        id: "INC-2024-008",
        asset: "System",
        category: "Access",
        issue: "Password Reset - Marketing Team",
        priority: "High",
        status: "Open",
        assignedTo: "Unassigned",
        slaStatus: "Critical"
    },
    {
        id: "INC-2024-012",
        asset: "Cisco IP Phone",
        category: "Network",
        issue: "No Dial Tone",
        priority: "Low",
        status: "Waiting for Vendor",
        assignedTo: "Jane Smith",
        slaStatus: "Paused"
    }
];

// Combine mock tickets to reach 8 total as per dashboard static view
export const allOpenTickets = [
    ...openTickets,
    {
        id: "INC-2024-015",
        asset: "ThinkPad T14",
        category: "Software",
        issue: "Outlook Crashing",
        priority: "Medium",
        status: "In Progress",
        assignedTo: "John Doe",
        slaStatus: "On Track"
    },
    {
        id: "INC-2024-018",
        asset: "Conference Room B",
        category: "Hardware",
        issue: "Projector Bulb Replacement",
        priority: "Low",
        status: "Open",
        assignedTo: "Unassigned",
        slaStatus: "On Track"
    }
];


export const deploymentReadyAssets = [
    {
        id: "AST-DEP-001",
        name: "MacBook Air M2",
        os: "macOS Sonoma 14.1",
        security: "Compliant",
        assignedUser: "Pending Assignment",
        location: "Deployment Locker 1",
        date: "2024-05-15"
    },
    {
        id: "AST-DEP-002",
        name: "Dell Latitude 5440",
        os: "Windows 11 Pro 23H2",
        security: "Compliant",
        assignedUser: "New Hire (Marketing)",
        location: "Deployment Locker 3",
        date: "2024-05-14"
    },
    {
        id: "AST-DEP-003",
        name: "iPad Pro 12.9",
        os: "iPadOS 17.2",
        security: "Compliant",
        assignedUser: "Exec Team Loaner",
        location: "Secure Cabinet",
        date: "2024-05-10"
    },
    {
        id: "AST-DEP-004",
        name: "Lenovo ThinkCentre",
        os: "Windows 11 Pro",
        security: "Compliant",
        assignedUser: "Front Desk",
        location: "IT Office",
        date: "2024-05-12"
    },
    {
        id: "AST-DEP-005",
        name: "Magic Mouse 2",
        os: "N/A",
        security: "N/A",
        assignedUser: "Stock",
        location: "Accessories Bin",
        date: "2024-05-15"
    }
];

export const disposalQueue = [
    {
        id: "AST-OLD-088",
        name: "Dell OptiPlex 3050",
        serial: "4J88-KL2",
        reason: "EOL",
        method: "Standard Wipe (NIST 800-88)",
        compliance: "Pending",
        age: "5 Years"
    },
    {
        id: "AST-OLD-092",
        name: "HP EliteDisplay",
        serial: "H992-111",
        reason: "Damage",
        method: "Recycle",
        compliance: "N/A",
        age: "3 Years"
    },
    {
        id: "AST-OLD-104",
        name: "MacBook Pro 13 (2017)",
        serial: "C02T881",
        reason: "Upgrade",
        method: "Secure Erase",
        compliance: "Pending",
        age: "6 Years"
    },
    // ... filling up to match ~20 if needed, but we'll show a sample for the modal
    {
        id: "AST-OLD-105",
        name: "Lenovo ThinkPad T480",
        serial: "PF-11229",
        reason: "EOL",
        method: "Standard Wipe",
        compliance: "Pending",
        age: "5 Years"
    },
    {
        id: "AST-OLD-106",
        name: "Samsung SSD 256GB",
        serial: "S77-112",
        reason: "Corrupted",
        method: "Physical Destruction",
        compliance: "Pending",
        age: "4 Years"
    }
];

export const complianceGaps = [
    {
        id: "SEC-001",
        name: "Endpoint protection outdated",
        count: 3,
        details: "CrowdStrike Falcon agent obsolete",
        risk: "High",
        policy: "ISO 27001 - A.12.6.2",
        devices: ["ThinkPad X1 (Sales)", "Dell XPS 13 (Finance)", "MacBook Air (HR)"]
    },
    {
        id: "SEC-002",
        name: "OS Patch Missing (Windows 11 23H2)",
        count: 5,
        details: "Critical security rollup KB5034441 missing",
        risk: "Critical",
        policy: "Internal Security Policy Sec.4.1",
        devices: ["OptiPlex 7090 (Lab)", "Latitude 5540 (Eng)", "Surface Laptop 4 (Product)"]
    }
];
