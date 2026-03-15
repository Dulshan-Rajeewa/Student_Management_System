export const logActivity = async (actionType, entityType, entityId, details) => {
  try {
    // 1. Get the current logged-in admin from localStorage
    const savedAdmin = localStorage.getItem('currentAdmin');
    const adminName = savedAdmin ? JSON.parse(savedAdmin).name : 'System/Unknown';

    // 2. Send the log to the Audit Service (Port 8083)
    await fetch('http://localhost:8083/api/audit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        admin_id: adminName,
        action_type: actionType,
        entity_type: entityType,
        entity_id: entityId,
        details: details
      }),
    });
  } catch (error) {
    console.error("Audit logging failed:", error);
  }
};