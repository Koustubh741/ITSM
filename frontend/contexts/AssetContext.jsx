import { createContext, useContext, useState, useEffect } from 'react';
import { initialMockAssets } from '@/data/mockAssets';
import apiClient from '@/lib/apiClient';

// --- ENTERPRISE ASSET REQUEST FLOW ---

export const ASSET_STATUS = {
    IN_USE: 'In Use',
    AVAILABLE: 'Available',
    RETIRED: 'Retired',
    MAINTENANCE: 'Maintenance'
};

export const OWNER_ROLE = {
    END_USER: 'END_USER',
    MANAGER: 'MANAGER',
    IT_MANAGEMENT: 'IT_MANAGEMENT',
    ASSET_INVENTORY_MANAGER: 'ASSET_INVENTORY_MANAGER',
    PROCUREMENT: 'PROCUREMENT',
    FINANCE: 'FINANCE',
    PROCUREMENT_FINANCE: 'PROCUREMENT_FINANCE', // legacy fallback
    SYSTEM_ADMIN: 'SYSTEM_ADMIN'
};

export const REQUEST_STATUS = {
    REQUESTED: 'REQUESTED',
    MANAGER_APPROVED: 'MANAGER_APPROVED',
    IT_APPROVED: 'IT_APPROVED',
    INVENTORY_APPROVED: 'INVENTORY_APPROVED',
    REJECTED: 'REJECTED',
    PROCUREMENT_REQUIRED: 'PROCUREMENT_REQUIRED',
    FULFILLED: 'FULFILLED',
    CLOSED: 'CLOSED'
};

const AssetContext = createContext();

export function AssetProvider({ children }) {
    const [assets, setAssets] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- Persistence ---
    const [error, setError] = useState(null);

    // --- Persistence & API Integration ---
    const deriveOwnerRole = (status) => {
        switch (status) {
            case REQUEST_STATUS.REQUESTED: return OWNER_ROLE.MANAGER;
            case REQUEST_STATUS.MANAGER_APPROVED: return OWNER_ROLE.IT_MANAGEMENT;
            case REQUEST_STATUS.IT_APPROVED: return OWNER_ROLE.ASSET_INVENTORY_MANAGER;
            case REQUEST_STATUS.PROCUREMENT_REQUIRED: return OWNER_ROLE.PROCUREMENT;
            case REQUEST_STATUS.FULFILLED: return OWNER_ROLE.END_USER;
            case REQUEST_STATUS.REJECTED: return OWNER_ROLE.END_USER;
            default: return OWNER_ROLE.IT_MANAGEMENT;
        }
    };

    // Persistence for Demo/Fallback mode
    useEffect(() => {
        if (requests.length > 0) {
            localStorage.setItem('enterprise_requests', JSON.stringify(requests));
        }
    }, [requests]);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                // Try fetching from API
                const apiAssets = await apiClient.getAssets();
                setAssets(apiAssets);

                const apiRequests = await apiClient.getRequests();
                // Map API response to Frontend State Model
                const mappedRequests = apiRequests.map(r => {
                    const rawStatus = (r.status || '').toUpperCase();
                    const status = rawStatus === 'PENDING' ? 'REQUESTED' : rawStatus;

                    return {
                        ...r,
                        status: status,
                        assetType: r.type || 'Standard', // Map type
                        justification: r.reason || r.justification || '',
                        requestedBy: { name: r.requester_id === 1 ? 'System Admin' : 'Employee' }, // TODO: Fetch user details
                        currentOwnerRole: deriveOwnerRole(status),
                        createdAt: r.requested_date
                    };
                });
                setRequests(mappedRequests);

                // Clear legacy/ghost requests from local storage if API load is successful
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('enterprise_requests');
                }

                setError(null);

            } catch (err) {
                console.error("CRITICAL: Failed to fetch data from API:", err);
                setError(err.message);

                // If 401 Unauthorized, do NOT fallback to stale data. Force Login.
                if (err.message && (err.message.includes('401') || err.message.toLowerCase().includes('unauthorized'))) {
                    console.log("Session expired. Redirecting to login...");
                    apiClient.clearToken();
                    if (typeof window !== 'undefined') window.location.href = '/login';
                    return; // Stop here
                }

                // Alert visible to user (optional, can be removed if annoying)
                // if (typeof window !== 'undefined') alert("Note: Using Offline/Mock Data (Server Connection Failed)");

                // Fallback to localStorage or Mock
                if (typeof window !== 'undefined') {
                    const savedAssets = localStorage.getItem('assets');
                    if (savedAssets) {
                        console.warn("Using Cached Assets from LocalStorage");
                        setAssets(JSON.parse(savedAssets));
                    } else {
                        console.warn("Using Default Mock Assets");
                        setAssets(initialMockAssets);
                    }

                    const savedRequests = localStorage.getItem('enterprise_requests');
                    if (savedRequests) setRequests(JSON.parse(savedRequests));
                }
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // ... (keep persisting access token/user if needed, but not assets/requests to avoid conflict) ...

    // --- WORKFLOW FUNCTIONS ---

    // 1. Create Request (End User)
    const createRequest = async (data) => {
        try {
            // Frontend 'justification' -> Backend 'reason'
            // Frontend 'assetType' -> Backend 'type'
            const payload = {
                type: (data.assetType || 'Laptop').toUpperCase(), // Ensure uppercase for Enum
                title: `${data.assetType} Request`,
                description: `Request for ${data.assetType}`,
                reason: data.justification,
                urgency: 'MEDIUM'
            };

            const newReq = await apiClient.createRequest(payload);

            // Optimistic update
            const mappedReq = {
                ...newReq,
                assetType: newReq.type,
                justification: newReq.reason,
                requestedBy: data.requestedBy,
                currentOwnerRole: OWNER_ROLE.MANAGER,
                createdAt: new Date().toISOString()
            };

            setRequests(prev => [mappedReq, ...prev]);
            return mappedReq;
        } catch (e) {
            console.warn("API Create Request Failed - Using Local Fallback", e);

            // LOCAL FALLBACK
            const newRequest = {
                id: `REQ-${Date.now()}`,
                assetType: data.assetType,
                justification: data.justification,
                requestedBy: data.requestedBy,
                status: REQUEST_STATUS.REQUESTED,
                currentOwnerRole: OWNER_ROLE.MANAGER,
                auditTrail: [
                    { action: 'CREATED', byRole: OWNER_ROLE.END_USER, byUser: data.requestedBy.name, timestamp: new Date().toISOString(), comment: 'Request raised (Local)' }
                ],
                timeline: [
                    { role: 'END_USER', action: 'CREATED', timestamp: new Date().toISOString(), comment: 'Request raised' }
                ],
                createdAt: new Date().toISOString(),
                isLocal: true
            };
            setRequests(prev => [newRequest, ...prev]);
            return newRequest;
        }
    };

    // 2. Manager Approve
    const managerApproveRequest = async (reqId, approverName) => {
        try {
            // Only call API if it's a real backend ID (number)
            if (typeof reqId === 'number') {
                await apiClient.approveRequest(reqId);
            } else {
                console.log("Approving local request:", reqId);
            }

            setRequests(prev => prev.map(req => {
                if (req.id !== reqId) return req;

                const newAuditEntry = {
                    action: 'MANAGER_APPROVED',
                    byRole: 'MANAGER',
                    byUser: approverName,
                    timestamp: new Date().toISOString(),
                    comment: `Approved by Manager ${approverName}`
                };

                return {
                    ...req,
                    status: REQUEST_STATUS.MANAGER_APPROVED,
                    currentOwnerRole: OWNER_ROLE.IT_MANAGEMENT,
                    auditTrail: [...(req.auditTrail || []), newAuditEntry]
                };
            }));
        } catch (e) {
            console.error("Approve Failed", e);
        }
    };

    // 3. Manager Reject
    const managerRejectRequest = async (reqId, reason, rejectorName) => {
        // 1. Optimistic Update (Immediate Feedback)
        const previousRequests = [...requests];

        setRequests(prev => prev.map(req => {
            if (req.id !== reqId) return req;
            return {
                ...req,
                status: REQUEST_STATUS.REJECTED,
                currentOwnerRole: OWNER_ROLE.END_USER,
                rejectionReason: reason,
                auditTrail: [...(req.auditTrail || []), {
                    action: 'REJECTED',
                    byRole: 'MANAGER',
                    byUser: rejectorName,
                    timestamp: new Date().toISOString(),
                    comment: `Rejected: ${reason}`
                }]
            };
        }));

        try {
            // Only call API if it's a real backend ID (number)
            if (typeof reqId === 'number') {
                console.log(`Sending Rejection to API for ID: ${reqId}`);
                await apiClient.rejectRequest(reqId, reason);
            } else {
                console.log("Rejecting local request:", reqId);
            }
        } catch (e) {
            console.error("Reject Failed - Reverting UI", e);
            alert(`Failed to reject request: ${e.message}`);
            // Revert to previous state on failure
            setRequests(previousRequests);
        }
    };


    // 4. IT Management Approve (Handles BYOD & Standard)
    const itApproveRequest = (reqId, approverName) => {
        setRequests(prev => prev.map(req => {
            if (req.id !== reqId) return req;

            const isBYOD = req.assetType === 'BYOD';

            // BYOD -> FULFILLED directly (No Inventory/Procurement)
            // Standard -> ASSET_INVENTORY_MANAGER
            const newStatus = isBYOD ? REQUEST_STATUS.FULFILLED : REQUEST_STATUS.IT_APPROVED;

            // If BYOD, owner is END_USER (done). If Standard, owner is INVENTORY.
            const newOwner = isBYOD ? OWNER_ROLE.END_USER : OWNER_ROLE.ASSET_INVENTORY_MANAGER;

            const actionLabel = isBYOD ? 'IT_APPROVED_BYOD' : 'IT_APPROVED';
            const comment = isBYOD ? 'BYOD Device Enrolled & Approved' : 'Approved for Inventory Check';

            const newAuditEntry = {
                action: actionLabel,
                byRole: 'IT_MANAGEMENT',
                byUser: approverName,
                timestamp: new Date().toISOString(),
                comment: comment
            };

            return {
                ...req,
                status: newStatus,
                currentOwnerRole: newOwner,
                auditTrail: [...(req.auditTrail || []), newAuditEntry],
                timeline: [...(req.timeline || []), { role: 'IT_MANAGEMENT', action: actionLabel, timestamp: new Date().toISOString(), comment: comment }]
            };
        }));
    };

    // 5. IT Management Reject
    const itRejectRequest = (reqId, reason, rejectorName) => {
        setRequests(prev => prev.map(req => {
            if (req.id !== reqId) return req;

            const newAuditEntry = {
                action: 'REJECTED',
                byRole: 'IT_MANAGEMENT',
                byUser: rejectorName,
                timestamp: new Date().toISOString(),
                comment: `IT Rejected: ${reason}`
            };

            return {
                ...req,
                status: REQUEST_STATUS.REJECTED,
                currentOwnerRole: OWNER_ROLE.END_USER,
                rejectionReason: reason,
                auditTrail: [...(req.auditTrail || []), newAuditEntry],
                timeline: [...(req.timeline || []), { role: 'IT_MANAGEMENT', action: 'REJECTED', timestamp: new Date().toISOString(), comment: `Rejected: ${reason}` }]
            };
        }));
    };

    // 6. Inventory - Asset Available (allocate directly)
    const inventoryCheckAvailable = (reqId, allocatedAssetId, inventoryManagerName) => {
        setRequests(prev => prev.map(req => {
            if (req.id !== reqId) return req;

            const newAuditEntry = {
                action: 'ALLOCATED',
                byRole: 'ASSET_INVENTORY_MANAGER',
                byUser: inventoryManagerName,
                timestamp: new Date().toISOString(),
                comment: `Allocated Asset ID: ${allocatedAssetId}`
            };

            return {
                ...req,
                inventoryDecision: 'AVAILABLE',
                allocatedAssetId: allocatedAssetId,
                status: REQUEST_STATUS.FULFILLED,
                currentOwnerRole: OWNER_ROLE.END_USER,
                auditTrail: [...(req.auditTrail || []), newAuditEntry],
                timeline: [...(req.timeline || []), { role: 'INVENTORY', action: 'ALLOCATED', timestamp: new Date().toISOString(), comment: `Allocated: ${allocatedAssetId}` }]
            };
        }));

        // Update asset assignment
        if (allocatedAssetId) {
            assignAsset(allocatedAssetId, requests.find(r => r.id === reqId)?.requestedBy.name);
        }
    };

    // 7. Inventory - Asset Not Available (route to procurement)
    const inventoryCheckNotAvailable = (reqId, inventoryManagerName) => {
        setRequests(prev => prev.map(req => {
            if (req.id !== reqId) return req;

            const newAuditEntry = {
                action: 'PROCUREMENT_REQUIRED',
                byRole: 'ASSET_INVENTORY_MANAGER',
                byUser: inventoryManagerName,
                timestamp: new Date().toISOString(),
                comment: 'Stock unavailable, routed to procurement'
            };

            return {
                ...req,
                inventoryDecision: 'NOT_AVAILABLE',
                status: REQUEST_STATUS.PROCUREMENT_REQUIRED,
                currentOwnerRole: OWNER_ROLE.PROCUREMENT,
                procurementStage: 'AWAITING_DECISION',
                auditTrail: [...(req.auditTrail || []), newAuditEntry],
                timeline: [...(req.timeline || []), { role: 'INVENTORY', action: 'PROCUREMENT_REQ', timestamp: new Date().toISOString(), comment: 'Routed to Procurement' }]
            };
        }));
    };

    // 8. Procurement - Decision (approve → Finance, reject → End User)
    const procurementApprove = (reqId, poNumber, procurementOfficer) => {
        setRequests(prev => prev.map(req => {
            if (req.id !== reqId) return req;
            const poId = poNumber || `PO-${Math.floor(Math.random() * 10000)}`;
            return {
                ...req,
                procurementStage: 'PO_CREATED',
                poNumber: poId,
                currentOwnerRole: OWNER_ROLE.FINANCE,
                status: REQUEST_STATUS.PROCUREMENT_REQUIRED,
                auditTrail: [...(req.auditTrail || []), {
                    action: 'PROCUREMENT_APPROVED',
                    byRole: 'PROCUREMENT',
                    byUser: procurementOfficer,
                    timestamp: new Date().toISOString(),
                    comment: `PO ${poId} created and sent to Finance`
                }],
                timeline: [
                    ...(req.timeline || []),
                    { role: 'PROCUREMENT', action: 'PO_CREATED', timestamp: new Date().toISOString(), comment: `PO ${poId} created by ${procurementOfficer}` }
                ]
            };
        }));
    };

    const procurementReject = (reqId, reason, procurementOfficer) => {
        setRequests(prev => prev.map(req => {
            if (req.id !== reqId) return req;
            return {
                ...req,
                status: REQUEST_STATUS.REJECTED,
                currentOwnerRole: OWNER_ROLE.END_USER,
                rejectionReason: reason,
                procurementStage: 'REJECTED',
                auditTrail: [...(req.auditTrail || []), {
                    action: 'PROCUREMENT_REJECTED',
                    byRole: 'PROCUREMENT',
                    byUser: procurementOfficer,
                    timestamp: new Date().toISOString(),
                    comment: `Rejected: ${reason}`
                }],
                timeline: [...(req.timeline || []), { role: 'PROCUREMENT', action: 'REJECTED', timestamp: new Date().toISOString(), comment: `Rejected: ${reason}` }]
            };
        }));
    };

    // 9. Procurement - Create PO (legacy entry point, routes to Finance)
    const procurementCreatePO = (reqId, poNumber, procurementOfficer) => {
        setRequests(prev => prev.map(req => {
            if (req.id !== reqId) return req;
            return {
                ...req,
                procurementStage: 'PO_CREATED',
                poNumber: poNumber,
                currentOwnerRole: OWNER_ROLE.FINANCE,
                timeline: [
                    ...(req.timeline || []),
                    { role: 'PROCUREMENT', action: 'PO_CREATED', timestamp: new Date().toISOString(), comment: `PO ${poNumber} created by ${procurementOfficer}` }
                ],
                auditTrail: [...(req.auditTrail || []), {
                    action: 'PROCUREMENT_APPROVED',
                    byRole: 'PROCUREMENT',
                    byUser: procurementOfficer,
                    timestamp: new Date().toISOString(),
                    comment: `PO ${poNumber} created and sent to Finance`
                }]
            };
        }));
    };

    // 9. Finance - Approve Budget
    const financeApprove = (reqId, financeName) => {
        setRequests(prev => prev.map(req => {
            if (req.id !== reqId) return req;
            return {
                ...req,
                procurementStage: 'FINANCE_APPROVED',
                currentOwnerRole: OWNER_ROLE.PROCUREMENT,
                timeline: [
                    ...(req.timeline || []),
                    { role: 'FINANCE', action: 'BUDGET_APPROVED', timestamp: new Date().toISOString(), comment: `Budget approved by ${financeName}` }
                ],
                auditTrail: [
                    ...(req.auditTrail || []),
                    {
                        action: 'FINANCE_APPROVED',
                        byRole: 'FINANCE',
                        byUser: financeName,
                        timestamp: new Date().toISOString(),
                        comment: 'Budget approved'
                    }
                ]
            };
        }));
    };

    // 10. Finance - Reject
    const financeReject = (reqId, reason, financeName) => {
        setRequests(prev => prev.map(req => {
            if (req.id !== reqId) return req;
            return {
                ...req,
                status: REQUEST_STATUS.REJECTED,
                currentOwnerRole: OWNER_ROLE.END_USER,
                rejectionReason: reason,
                procurementStage: 'FINANCE_REJECTED',
                timeline: [
                    ...(req.timeline || []),
                    { role: 'FINANCE', action: 'BUDGET_REJECTED', timestamp: new Date().toISOString(), comment: `Budget rejected by ${financeName}: ${reason}` }
                ],
                auditTrail: [
                    ...(req.auditTrail || []),
                    {
                        action: 'FINANCE_REJECTED',
                        byRole: 'FINANCE',
                        byUser: financeName,
                        timestamp: new Date().toISOString(),
                        comment: `Budget rejected: ${reason}`
                    }
                ]
            };
        }));
    };

    // 11. Procurement - Confirm Delivery
    const procurementConfirmDelivery = (reqId, procurementOfficer) => {
        setRequests(prev => prev.map(req => {
            if (req.id !== reqId) return req;
            return {
                ...req,
                procurementStage: 'DELIVERED',
                currentOwnerRole: OWNER_ROLE.ASSET_INVENTORY_MANAGER,
                timeline: [
                    ...(req.timeline || []),
                    { role: 'PROCUREMENT', action: 'DELIVERY_CONFIRMED', timestamp: new Date().toISOString(), comment: `Asset delivered - confirmed by ${procurementOfficer}` }
                ]
            };
        }));
    };

    // 12. Inventory - Final Allocation (after procurement) - SAME AS BEFORE BUT UPDATED ROLE CONSTANT
    const inventoryAllocateDelivered = (reqId, allocatedAssetId, inventoryManagerName) => {
        setRequests(prev => {
            const updated = prev.map(req => {
                if (req.id !== reqId) return req;
                return {
                    ...req,
                    allocatedAssetId: allocatedAssetId,
                    status: REQUEST_STATUS.FULFILLED,
                    currentOwnerRole: OWNER_ROLE.END_USER,
                    timeline: [
                        ...(req.timeline || []),
                        { role: 'INVENTORY', action: 'ALLOCATED', timestamp: new Date().toISOString(), comment: `Asset allocated by ${inventoryManagerName} - Asset ID: ${allocatedAssetId}` }
                    ]
                };
            });

            // Update asset assignment in the same tick so UI stays in sync
            if (allocatedAssetId) {
                const targetRequest = prev.find(r => r.id === reqId);
                if (targetRequest) {
                    assignAsset(allocatedAssetId, targetRequest.requestedBy.name);
                }
            }

            return updated;
        });
    };

    // --- Asset Management Functions ---
    const updateAssetStatus = (assetId, newStatus) => {
        setAssets(prev => prev.map(a => a.id === assetId ? { ...a, status: newStatus } : a));
    };

    const assignAsset = (assetId, userName) => {
        setAssets(prev => prev.map(a =>
            a.id === assetId ? { ...a, assigned_to: userName, status: ASSET_STATUS.IN_USE } : a
        ));
    };

    // Update entire asset (for verificationStatus, etc.)
    const updateAsset = (assetId, updates) => {
        setAssets(prev => prev.map(a =>
            a.id === assetId ? { ...a, ...updates } : a
        ));
    };

    return (
        <AssetContext.Provider value={{
            assets,
            requests,
            createRequest,
            itApproveRequest,
            itRejectRequest,
            inventoryCheckAvailable,
            inventoryCheckNotAvailable,
            procurementCreatePO,
            procurementApprove,
            procurementReject,
            financeApprove,
            financeReject,
            procurementConfirmDelivery,
            inventoryAllocateDelivered,
            updateAssetStatus,
            assignAsset,
            updateAsset,
            // Backward compatibility
            managerApproveRequest,
            managerRejectRequest,
            // Backward compatibility
            tickets: requests.filter(r => r.status === 'SUPPORT' || r.requestType === 'SUPPORT' || r.assetType === 'TICKET'),
            approveRequest: itApproveRequest,
            rejectRequest: itRejectRequest,
            fulfillRequest: inventoryCheckAvailable
        }}>
            {children}
        </AssetContext.Provider>
    );
}

export function useAssetContext() {
    return useContext(AssetContext);
}
