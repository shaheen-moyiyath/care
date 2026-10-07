const bcrypt = require('bcryptjs');
const db = require('../database/db');

// 1. System Dashboard Analytics & Reports
exports.getDashboardStats = async (req, res) => {
  try {
    const totalPatientsRow = await db.query('SELECT COUNT(*) as count FROM Patient');
    const totalDoctorsRow = await db.query('SELECT COUNT(*) as count FROM Doctor');
    const totalAppointmentsRow = await db.query('SELECT COUNT(*) as count FROM Appointment');

    // Status breakdown
    const statusRows = await db.query(`
      SELECT Status, COUNT(*) as count
      FROM Appointment
      GROUP BY Status
    `);

    // Specialty breakdown
    const specialtyRows = await db.query(`
      SELECT Specialization, COUNT(*) as count
      FROM Doctor
      GROUP BY Specialization
    `);

    // Recent 5 appointments
    const recentAppointments = await db.query(`
      SELECT a.Appo_id, a.Appo_date, a.Appo_time, a.Status, a.Symptoms, a.Disease,
             p.Name as Patient_name, d.Name as Doctor_name, d.Specialization
      FROM Appointment a
      JOIN Patient p ON a.Patient_id = p.Patient_id
      JOIN Doctor d ON a.Doc_id = d.Doc_id
      ORDER BY a.Appo_id DESC
      LIMIT 6
    `);

    return res.status(200).json({
      success: true,
      stats: {
        totalPatients: totalPatientsRow[0]?.count || 0,
        totalDoctors: totalDoctorsRow[0]?.count || 0,
        totalAppointments: totalAppointmentsRow[0]?.count || 0,
        statusBreakdown: statusRows,
        specialtyBreakdown: specialtyRows,
        recentAppointments
      }
    });
  } catch (error) {
    console.error('Admin Stats Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve dashboard stats.' });
  }
};

// 2. Doctor Management: List Doctors (optionally filtered by Specialization)
exports.getAllDoctors = async (req, res) => {
  try {
    const { specialization } = req.query;
    let sql = `
      SELECT d.Doc_id, d.Name, d.Specialization, d.Availability, d.Email, d.Phone,
             d.Experience_years, d.Room_no, d.Created_at,
             (SELECT COUNT(*) FROM Appointment a WHERE a.Doc_id = d.Doc_id) as total_appointments
      FROM Doctor d
      WHERE 1=1
    `;
    const params = [];

    if (specialization && specialization !== 'All') {
      sql += ' AND LOWER(d.Specialization) = LOWER(?)';
      params.push(specialization);
    }

    sql += ' ORDER BY d.Specialization ASC, d.Name ASC';

    const doctors = await db.query(sql, params);
    return res.status(200).json({ success: true, doctors });
  } catch (error) {
    console.error('Admin Doctors Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch doctors.' });
  }
};

// 3. Doctor Management: Add Doctor
exports.addDoctor = async (req, res) => {
  try {
    const { name, specialization, availability, email, password, phone, experience_years, room_no } = req.body;

    if (!name || !specialization || !availability || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, specialization, availability, email, and password are required.'
      });
    }

    const existing = await db.query('SELECT * FROM Doctor WHERE Email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'A doctor with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO Doctor (Name, Specialization, Availability, Email, Password, Phone, Experience_years, Room_no)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        specialization,
        availability,
        email,
        hashedPassword,
        phone || null,
        experience_years ? parseInt(experience_years, 10) : 5,
        room_no || 'Room 101'
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Doctor added successfully.',
      docId: result.insertId
    });
  } catch (error) {
    console.error('Add Doctor Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to add doctor.', error: error.message });
  }
};

// 4. Doctor Management: Update Doctor
exports.updateDoctor = async (req, res) => {
  try {
    const { docId } = req.params;
    const { name, specialization, availability, email, phone, experience_years, room_no, password } = req.body;

    const docRows = await db.query('SELECT * FROM Doctor WHERE Doc_id = ?', [docId]);
    if (docRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    let passwordClause = '';
    const params = [
      name,
      specialization,
      availability,
      email,
      phone,
      experience_years ? parseInt(experience_years, 10) : 5,
      room_no
    ];

    if (password && password.trim().length > 0) {
      const hashedPassword = await bcrypt.hash(password, 10);
      params.push(hashedPassword);
      passwordClause = ', Password = ?';
    }

    params.push(docId);

    await db.query(
      `UPDATE Doctor
       SET Name = ?, Specialization = ?, Availability = ?, Email = ?, Phone = ?, Experience_years = ?, Room_no = ? ${passwordClause}
       WHERE Doc_id = ?`,
      params
    );

    return res.status(200).json({ success: true, message: 'Doctor updated successfully.' });
  } catch (error) {
    console.error('Update Doctor Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update doctor.' });
  }
};

// 5. Doctor Management: Delete Doctor
exports.deleteDoctor = async (req, res) => {
  try {
    const { docId } = req.params;
    await db.query('DELETE FROM Doctor WHERE Doc_id = ?', [docId]);
    return res.status(200).json({ success: true, message: 'Doctor removed successfully.' });
  } catch (error) {
    console.error('Delete Doctor Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete doctor.' });
  }
};

// 6. Master Appointments Management: View All Appointments with Filters
exports.getAllAppointments = async (req, res) => {
  try {
    const { status, date, specialization, search } = req.query;

    let sql = `
      SELECT
        a.Appo_id, a.Appo_date, a.Appo_time, a.Status,
        a.Symptoms, a.Disease, a.Prescription, a.Doctor_notes, a.Surgery_decision, a.Created_at,
        p.Patient_id, p.Name as Patient_name, p.Phone as Patient_phone, p.Email as Patient_email, p.Age as Patient_age,
        d.Doc_id, d.Name as Doctor_name, d.Specialization, d.Room_no
      FROM Appointment a
      JOIN Patient p ON a.Patient_id = p.Patient_id
      JOIN Doctor d ON a.Doc_id = d.Doc_id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'All') {
      sql += ' AND a.Status = ?';
      params.push(status);
    }

    if (date) {
      sql += ' AND a.Appo_date = ?';
      params.push(date);
    }

    if (specialization && specialization !== 'All') {
      sql += ' AND LOWER(d.Specialization) = LOWER(?)';
      params.push(specialization);
    }

    if (search) {
      sql += ' AND (LOWER(p.Name) LIKE ? OR LOWER(d.Name) LIKE ?)';
      params.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`);
    }

    sql += ' ORDER BY a.Appo_date DESC, a.Appo_time DESC';

    const appointments = await db.query(sql, params);
    return res.status(200).json({ success: true, appointments });
  } catch (error) {
    console.error('Master Appointments Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch appointments.' });
  }
};

// 7. Master Appointments: Reschedule / Resolve Conflict
exports.adminRescheduleAppointment = async (req, res) => {
  try {
    const { appoId } = req.params;
    const { new_date, new_time, new_doc_id, status } = req.body;

    const appoRows = await db.query('SELECT * FROM Appointment WHERE Appo_id = ?', [appoId]);
    if (appoRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    const appo = appoRows[0];
    const targetDocId = new_doc_id || appo.Doc_id;
    const targetDate = new_date || appo.Appo_date;
    const formattedTime = new_time ? (new_time.length === 5 ? `${new_time}:00` : new_time) : appo.Appo_time;
    const targetStatus = status || 'Confirmed';

    // Conflict Check
    const conflict = await db.query(
      `SELECT * FROM Appointment
       WHERE Doc_id = ? AND Appo_date = ? AND Appo_time = ? AND Appo_id != ? AND Status NOT IN ('Cancelled', 'Rejected for Surgery')`,
      [targetDocId, targetDate, formattedTime, appoId]
    );

    if (conflict.length > 0) {
      return res.status(409).json({ success: false, message: 'Conflict detected: The assigned doctor is already booked for this slot.' });
    }

    await db.query(
      `UPDATE Appointment
       SET Doc_id = ?, Appo_date = ?, Appo_time = ?, Status = ?
       WHERE Appo_id = ?`,
      [targetDocId, targetDate, formattedTime, targetStatus, appoId]
    );

    // Notify patient
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().split(' ')[0];
    const msg = `Schedule Update: Admin updated your appointment #${appoId} to ${targetDate} at ${formattedTime.slice(0, 5)} (Status: ${targetStatus}).`;

    await db.query(
      `INSERT INTO Notification (Appo_id, Doc_id, Patient_id, Msg, Date, Time, Is_read)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [appoId, targetDocId, appo.Patient_id, msg, today, nowTime]
    );

    return res.status(200).json({ success: true, message: 'Appointment updated successfully.' });
  } catch (error) {
    console.error('Admin Reschedule Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update appointment.' });
  }
};

// 8. Master Appointments: Cancel Appointment
exports.adminCancelAppointment = async (req, res) => {
  try {
    const { appoId } = req.params;
    const { reason } = req.body;

    const appoRows = await db.query('SELECT * FROM Appointment WHERE Appo_id = ?', [appoId]);
    if (appoRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    const appo = appoRows[0];
    await db.query("UPDATE Appointment SET Status = 'Cancelled' WHERE Appo_id = ?", [appoId]);

    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().split(' ')[0];
    const msg = `Notice: Your appointment #${appoId} on ${appo.Appo_date} was cancelled by administration${reason ? ` (Reason: ${reason})` : ''}.`;

    await db.query(
      `INSERT INTO Notification (Appo_id, Doc_id, Patient_id, Msg, Date, Time, Is_read)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [appoId, appo.Doc_id, appo.Patient_id, msg, today, nowTime]
    );

    return res.status(200).json({ success: true, message: 'Appointment cancelled by admin.' });
  } catch (error) {
    console.error('Admin Cancel Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to cancel appointment.' });
  }
};

// 9. Patients Management: List All Patients
exports.getAllPatients = async (req, res) => {
  try {
    const { search } = req.query;
    let sql = `
      SELECT p.Patient_id, p.Name, p.Age, p.Phone, p.Email, p.Place, p.Address, p.Created_at,
             (SELECT COUNT(*) FROM Appointment a WHERE a.Patient_id = p.Patient_id) as total_appointments
      FROM Patient p
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ' AND (LOWER(p.Name) LIKE ? OR LOWER(p.Phone) LIKE ? OR LOWER(p.Email) LIKE ?)';
      params.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`);
    }

    sql += ' ORDER BY p.Patient_id DESC';

    const patients = await db.query(sql, params);
    return res.status(200).json({ success: true, patients });
  } catch (error) {
    console.error('Admin Patients Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch patients.' });
  }
};
