// client/src/utils/auditLogger.js

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
        admin_id: adminName, // Using name for easy reading in the table
        action_type: actionType, // 'CREATE', 'UPDATE', 'DELETE'
        entity_type: entityType, // 'STUDENT', 'COURSE', 'SYSTEM'
        entity_id: entityId,     // e.g., 'D/BSE/24/0001' or 'SE3032'
        details: details         // e.g., 'Added new course SE3032'
      }),
    });
  } catch (error) {
    console.error("Audit logging failed:", error);
  }
};