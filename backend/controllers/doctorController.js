const db = require('../database/db');

// 1. Get Doctor's Appointments (Daily or All)
exports.getDoctorAppointments = async (req, res) => {
  try {
    const docId = req.user.id;
    const { date, status } = req.query;

    let sql = `
      SELECT
        a.Appo_id, a.Appo_date, a.Appo_time, a.Status,
        a.Symptoms, a.Disease, a.Prescription, a.Doctor_notes, a.Surgery_decision, a.Created_at,
        p.Patient_id, p.Name as Patient_name, p.Age as Patient_age,
        p.Phone as Patient_phone, p.Email as Patient_email, p.Place as Patient_place, p.Address as Patient_address
      FROM Appointment a
      JOIN Patient p ON a.Patient_id = p.Patient_id
      WHERE a.Doc_id = ?
    `;
    const params = [docId];

    if (date) {
      sql += ' AND a.Appo_date = ?';
      params.push(date);
    }

    if (status && status !== 'All') {
      sql += ' AND a.Status = ?';
      params.push(status);
    }

    sql += ' ORDER BY a.Appo_date ASC, a.Appo_time ASC';

    const appointments = await db.query(sql, params);
    return res.status(200).json({ success: true, appointments });
  } catch (error) {
    console.error('Doctor Appointments Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve appointments.' });
  }
};

// 2. Update Clinical Assessment: Symptoms/Disease Verification, Prescribe Medicine, Doctor Notes, Status ('Seen', 'No-Show', 'Completed')
exports.updateClinicalRecord = async (req, res) => {
  try {
    const docId = req.user.id;
    const { appoId } = req.params;
    const { disease, prescription, doctor_notes, status } = req.body;

    // Check appointment belongs to doctor
    const appoRows = await db.query('SELECT * FROM Appointment WHERE Appo_id = ? AND Doc_id = ?', [appoId, docId]);
    if (appoRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    const appo = appoRows[0];
    const newStatus = status || appo.Status;

    await db.query(
      `UPDATE Appointment
       SET Disease = COALESCE(?, Disease),
           Prescription = COALESCE(?, Prescription),
           Doctor_notes = COALESCE(?, Doctor_notes),
           Status = ?
       WHERE Appo_id = ?`,
      [disease, prescription, doctor_notes, newStatus, appoId]
    );

    // If prescription or completion changed, notify patient
    if (prescription || newStatus === 'Seen' || newStatus === 'Completed') {
      const today = new Date().toISOString().split('T')[0];
      const nowTime = new Date().toTimeString().split(' ')[0];
      const docRows = await db.query('SELECT Name FROM Doctor WHERE Doc_id = ?', [docId]);
      const docName = docRows[0]?.Name || 'Your Doctor';

      const msg = `Clinical Update: ${docName} updated your consultation report and prescribed treatment.`;
      await db.query(
        `INSERT INTO Notification (Appo_id, Doc_id, Patient_id, Msg, Date, Time, Is_read)
         VALUES (?, ?, ?, ?, ?, ?, 0)`,
        [appoId, docId, appo.Patient_id, msg, today, nowTime]
      );
    }

    return res.status(200).json({ success: true, message: 'Clinical record updated successfully.' });
  } catch (error) {
    console.error('Update Clinical Record Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update clinical record.' });
  }
};

// 3. Surgery Request Decision (Approve / Reject Surgery - DFD Level 2.2.1)
exports.handleSurgeryDecision = async (req, res) => {
  try {
    const docId = req.user.id;
    const { appoId } = req.params;
    const { decision, notes } = req.body; // decision: 'Approved' | 'Rejected'

    if (!decision || !['Approved', 'Rejected'].includes(decision)) {
      return res.status(400).json({ success: false, message: "Decision must be 'Approved' or 'Rejected'." });
    }

    const appoRows = await db.query('SELECT * FROM Appointment WHERE Appo_id = ? AND Doc_id = ?', [appoId, docId]);
    if (appoRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    const appo = appoRows[0];
    const newStatus = decision === 'Approved' ? 'Approved for Surgery' : 'Rejected for Surgery';

    await db.query(
      `UPDATE Appointment
       SET Surgery_decision = ?,
           Doctor_notes = COALESCE(?, Doctor_notes),
           Status = ?
       WHERE Appo_id = ?`,
      [decision, notes, newStatus, appoId]
    );

    // Notify patient
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().split(' ')[0];
    const docRows = await db.query('SELECT Name FROM Doctor WHERE Doc_id = ?', [docId]);
    const docName = docRows[0]?.Name || 'Doctor';

    const msg = decision === 'Approved'
      ? `Surgery Approved: ${docName} has approved surgical intervention for your case.`
      : `Surgery Evaluation: ${docName} evaluated your case as non-surgical.`;

    await db.query(
      `INSERT INTO Notification (Appo_id, Doc_id, Patient_id, Msg, Date, Time, Is_read)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [appoId, docId, appo.Patient_id, msg, today, nowTime]
    );

    return res.status(200).json({
      success: true,
      message: `Surgery request ${decision.toLowerCase()} successfully.`
    });
  } catch (error) {
    console.error('Surgery Decision Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to process surgery decision.' });
  }
};

// 4. Update Doctor Availability & Profile
exports.updateAvailability = async (req, res) => {
  try {
    const docId = req.user.id;
    const { availability, phone, room_no } = req.body;

    if (!availability) {
      return res.status(400).json({ success: false, message: 'Availability schedule string is required.' });
    }

    await db.query(
      `UPDATE Doctor
       SET Availability = ?,
           Phone = COALESCE(?, Phone),
           Room_no = COALESCE(?, Room_no)
       WHERE Doc_id = ?`,
      [availability, phone, room_no, docId]
    );

    return res.status(200).json({ success: true, message: 'Availability schedule updated successfully.' });
  } catch (error) {
    console.error('Update Availability Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update availability.' });
  }
};

// 5. Doctor Dashboard Overview Stats
exports.getDoctorStats = async (req, res) => {
  try {
    const docId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    const todayAppos = await db.query(
      'SELECT COUNT(*) as count FROM Appointment WHERE Doc_id = ? AND Appo_date = ?',
      [docId, today]
    );

    const pendingAppos = await db.query(
      "SELECT COUNT(*) as count FROM Appointment WHERE Doc_id = ? AND Status = 'Pending'",
      [docId]
    );

    const surgeryAppos = await db.query(
      "SELECT COUNT(*) as count FROM Appointment WHERE Doc_id = ? AND Status = 'Approved for Surgery'",
      [docId]
    );

    const totalAppos = await db.query(
      'SELECT COUNT(*) as count FROM Appointment WHERE Doc_id = ?',
      [docId]
    );

    return res.status(200).json({
      success: true,
      stats: {
        todayCount: todayAppos[0]?.count || 0,
        pendingCount: pendingAppos[0]?.count || 0,
        surgeryCount: surgeryAppos[0]?.count || 0,
        totalCount: totalAppos[0]?.count || 0
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch doctor stats.' });
  }
};
