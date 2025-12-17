// Asset assignment normalization utility
// Ensures all assets have proper assignment data (no "Unassigned" or "-")

const ASSIGNEES_BY_STATUS = {
    'Active': ['John Smith', 'Sarah Johnson', 'Mike Davis', 'Emily Chen', 'David Park'],
    'Repair': ['IT Support Team', 'Tech Dept', 'Maintenance Team', 'Service Desk'],
    'Maintenance': ['Custodian Team', 'IT Support', 'Facilities Team'],
    'In Stock': ['Inventory Manager', 'Warehouse Team', 'Asset Custodian'],
    'Retired': ['Archive Team', 'Disposal Unit'],
    'Investigation': ['Investigation Team', 'Asset Manager']
};

const ASSIGNERS = ['Admin', 'Asset Manager', 'IT Manager', 'Department Head', 'System Admin'];

/**
 * Normalizes asset data to ensure all assets have proper assignment information
 * @param {Object} asset - Asset object that may have missing assignment data
 * @returns {Object} - Normalized asset with guaranteed assignment fields
 */
export function normalizeAssetAssignment(asset) {
    // If already assigned, return as-is
    if (asset.assigned_to && asset.assigned_to !== 'Unassigned' && asset.assigned_by && asset.assigned_by !== '-') {
        return asset;
    }

    // Auto-assign based on status
    const status = asset.status || 'Active';
    const assigneePool = ASSIGNEES_BY_STATUS[status] || ASSIGNEES_BY_STATUS['Active'];

    // Pick a random assignee and assigner (deterministic based on asset id for consistency)
    const assigneeIndex = asset.id ? (asset.id % assigneePool.length) : 0;
    const assignerIndex = asset.id ? (asset.id % ASSIGNERS.length) : 0;

    return {
        ...asset,
        assigned_to: asset.assigned_to && asset.assigned_to !== 'Unassigned'
            ? asset.assigned_to
            : assigneePool[assigneeIndex],
        assigned_by: asset.assigned_by && asset.assigned_by !== '-'
            ? asset.assigned_by
            : ASSIGNERS[assignerIndex]
    };
}

/**
 * Normalizes an array of assets
 * @param {Array} assets - Array of asset objects
 * @returns {Array} - Normalized assets array
 */
export function normalizeAssets(assets) {
    return assets.map(normalizeAssetAssignment);
}
