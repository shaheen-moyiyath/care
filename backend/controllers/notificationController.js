const db = require('../database/db');

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notId } = req.params;
    await db.query('UPDATE Notification SET Is_read = 1 WHERE Not_id = ?', [notId]);
    return res.status(200).json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update notification.' });
  }
};

// Mark all as read for current patient
exports.markAllAsRead = async (req, res) => {
  try {
    const patientId = req.user.id;
    await db.query('UPDATE Notification SET Is_read = 1 WHERE Patient_id = ?', [patientId]);
    return res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update notifications.' });
  }
};
