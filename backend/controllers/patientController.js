const db = require('../database/db');

// 1. Get All Doctors / Search by Specialization
exports.getDoctors = async (req, res) => {
  try {
    const { category, search } = req.query;
    let sql = 'SELECT Doc_id, Name, Specialization, Availability, Email, Phone, Experience_years, Room_no FROM Doctor WHERE 1=1';
    const params = [];

    if (category && category !== 'All') {
      sql += ' AND LOWER(Specialization) = LOWER(?)';
      params.push(category);
    }

    if (search) {
      sql += ' AND (LOWER(Name) LIKE ? OR LOWER(Specialization) LIKE ?)';
      params.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`);
    }

    sql += ' ORDER BY Specialization ASC, Name ASC';

    const doctors = await db.query(sql, params);
    return res.status(200).json({ success: true, doctors });
  } catch (error) {
    console.error('Get Doctors Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch doctors.' });
  }
};

// 2. Check Doctor Available Time Slots on a Date (Conflict avoidance & slot generation)
exports.getDoctorAvailableSlots = async (req, res) => {
  try {
    const { docId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date query parameter is required (YYYY-MM-DD).' });
    }

    // Standard clinical slots: 09:00 to 17:00 at 30-min intervals
    const standardSlots = [
      '09:00:00', '09:30:00', '10:00:00', '10:30:00',
      '11:00:00', '11:30:00', '12:00:00', '12:30:00',
      '14:00:00', '14:30:00', '15:00:00', '15:30:00',
      '16:00:00', '16:30:00'
    ];

    // Fetch existing active bookings for this doctor on this date
    const bookedRows = await db.query(
      `SELECT Appo_time FROM Appointment
       WHERE Doc_id = ? AND Appo_date = ? AND Status NOT IN ('Cancelled', 'Rejected for Surgery')`,
      [docId, date]
    );

    const bookedTimes = bookedRows.map(r => r.Appo_time.slice(0, 8));

    const slotDetails = standardSlots.map(time => {
      const isBooked = bookedTimes.includes(time);
      return {
        time,
        displayTime: time.slice(0, 5),
        available: !isBooked
      };
    });

    return res.status(200).json({
      success: true,
      date,
      slots: slotDetails
    });
  } catch (error) {
    console.error('Available Slots Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch available slots.' });
  }
};

// 3. Book Appointment (Strict Conflict Avoidance & Auto-Notification)
exports.bookAppointment = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { doc_id, appo_date, appo_time, symptoms, disease } = req.body;

    if (!doc_id || !appo_date || !appo_time) {
      return res.status(400).json({ success: false, message: 'Doctor ID, appointment date, and appointment time are required.' });
    }

    // Normalize time to HH:MM:00
    const formattedTime = appo_time.length === 5 ? `${appo_time}:00` : appo_time;

    // 1. Double Booking Check for Doctor
    const conflictDoctor = await db.query(
      `SELECT * FROM Appointment
       WHERE Doc_id = ? AND Appo_date = ? AND Appo_time = ? AND Status NOT IN ('Cancelled', 'Rejected for Surgery')`,
      [doc_id, appo_date, formattedTime]
    );

    if (conflictDoctor.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Conflict: This doctor is already booked at this specific date and time slot. Please choose another time.'
      });
    }

    // 2. Double Booking Check for Patient (Patient cannot be in two places at once)
    const conflictPatient = await db.query(
      `SELECT * FROM Appointment
       WHERE Patient_id = ? AND Appo_date = ? AND Appo_time = ? AND Status NOT IN ('Cancelled', 'Rejected for Surgery')`,
      [patientId, appo_date, formattedTime]
    );

    if (conflictPatient.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Conflict: You already have another active appointment scheduled at this exact date and time.'
      });
    }

    // Retrieve Doctor info for Notification
    const doctorRows = await db.query('SELECT Name, Specialization FROM Doctor WHERE Doc_id = ?', [doc_id]);
    const doctorName = doctorRows.length > 0 ? doctorRows[0].Name : 'Doctor';

    // Insert Appointment
    const insertRes = await db.query(
      `INSERT INTO Appointment (Patient_id, Doc_id, Appo_date, Appo_time, Status, Symptoms, Disease)
       VALUES (?, ?, ?, ?, 'Confirmed', ?, ?)`,
      [patientId, doc_id, appo_date, formattedTime, symptoms || null, disease || null]
    );

    const appoId = insertRes.insertId;

    // Insert Automated Notification
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().split(' ')[0];

    const notifMsg = `Appointment confirmed with ${doctorName} on ${appo_date} at ${formattedTime.slice(0, 5)}.`;
    await db.query(
      `INSERT INTO Notification (Appo_id, Doc_id, Patient_id, Msg, Date, Time, Is_read)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [appoId, doc_id, patientId, notifMsg, today, nowTime]
    );

    return res.status(201).json({
      success: true,
      message: 'Appointment booked successfully!',
      appointmentId: appoId,
      details: {
        doc_id,
        doctorName,
        appo_date,
        appo_time: formattedTime,
        status: 'Confirmed'
      }
    });
  } catch (error) {
    console.error('Booking Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to book appointment.', error: error.message });
  }
};

// 4. View Patient's Appointments
exports.getMyAppointments = async (req, res) => {
  try {
    const patientId = req.user.id;

    const appointments = await db.query(
      `SELECT
        a.Appo_id, a.Appo_date, a.Appo_time, a.Status,
        a.Symptoms, a.Disease, a.Prescription, a.Doctor_notes, a.Surgery_decision, a.Created_at,
        d.Doc_id, d.Name as Doctor_name, d.Specialization, d.Availability, d.Room_no, d.Phone as Doctor_phone
       FROM Appointment a
       JOIN Doctor d ON a.Doc_id = d.Doc_id
       WHERE a.Patient_id = ?
       ORDER BY a.Appo_date DESC, a.Appo_time DESC`,
      [patientId]
    );

    return res.status(200).json({ success: true, appointments });
  } catch (error) {
    console.error('My Appointments Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve appointments.' });
  }
};

// 5. Reschedule Appointment
exports.rescheduleAppointment = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { appoId } = req.params;
    const { new_date, new_time } = req.body;

    if (!new_date || !new_time) {
      return res.status(400).json({ success: false, message: 'New date and time are required.' });
    }

    const formattedTime = new_time.length === 5 ? `${new_time}:00` : new_time;

    // Verify appointment ownership
    const appoRows = await db.query('SELECT * FROM Appointment WHERE Appo_id = ? AND Patient_id = ?', [appoId, patientId]);
    if (appoRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    const appo = appoRows[0];

    // Conflict check on the doctor
    const conflict = await db.query(
      `SELECT * FROM Appointment
       WHERE Doc_id = ? AND Appo_date = ? AND Appo_time = ? AND Appo_id != ? AND Status NOT IN ('Cancelled', 'Rejected for Surgery')`,
      [appo.Doc_id, new_date, formattedTime, appoId]
    );

    if (conflict.length > 0) {
      return res.status(409).json({ success: false, message: 'Selected time slot is already booked for this doctor.' });
    }

    await db.query(
      `UPDATE Appointment
       SET Appo_date = ?, Appo_time = ?, Status = 'Confirmed'
       WHERE Appo_id = ?`,
      [new_date, formattedTime, appoId]
    );

    // Create Notification
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().split(' ')[0];
    const msg = `Your appointment #${appoId} has been rescheduled to ${new_date} at ${formattedTime.slice(0, 5)}.`;

    await db.query(
      `INSERT INTO Notification (Appo_id, Doc_id, Patient_id, Msg, Date, Time, Is_read)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [appoId, appo.Doc_id, patientId, msg, today, nowTime]
    );

    return res.status(200).json({ success: true, message: 'Appointment rescheduled successfully.' });
  } catch (error) {
    console.error('Reschedule Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to reschedule appointment.' });
  }
};

// 6. Cancel Appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { appoId } = req.params;

    const appoRows = await db.query('SELECT * FROM Appointment WHERE Appo_id = ? AND Patient_id = ?', [appoId, patientId]);
    if (appoRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    const appo = appoRows[0];
    await db.query(`UPDATE Appointment SET Status = 'Cancelled' WHERE Appo_id = ?`, [appoId]);

    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().split(' ')[0];
    const msg = `Appointment #${appoId} scheduled on ${appo.Appo_date} was successfully cancelled.`;

    await db.query(
      `INSERT INTO Notification (Appo_id, Doc_id, Patient_id, Msg, Date, Time, Is_read)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [appoId, appo.Doc_id, patientId, msg, today, nowTime]
    );

    return res.status(200).json({ success: true, message: 'Appointment cancelled successfully.' });
  } catch (error) {
    console.error('Cancel Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to cancel appointment.' });
  }
};

// 7. Get Notifications for Patient
exports.getMyNotifications = async (req, res) => {
  try {
    const patientId = req.user.id;
    const notifications = await db.query(
      `SELECT n.*, d.Name as Doctor_name, d.Specialization
       FROM Notification n
       LEFT JOIN Doctor d ON n.Doc_id = d.Doc_id
       WHERE n.Patient_id = ?
       ORDER BY n.Date DESC, n.Time DESC, n.Not_id DESC`,
      [patientId]
    );

    return res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.error('Notifications Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve notifications.' });
  }
};
