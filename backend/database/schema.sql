-- =========================================================
-- Healthcare: Online Patient Appointment System (OPAS)
-- Database Schema Definition for MySQL
-- Compatible with MySQL 5.7+ and 8.0+
-- =========================================================

CREATE DATABASE IF NOT EXISTS `opas_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `opas_db`;

-- ---------------------------------------------------------
-- 1. Admin Table
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `Notification`;
DROP TABLE IF EXISTS `Appointment`;
DROP TABLE IF EXISTS `Doctor`;
DROP TABLE IF EXISTS `Patient`;
DROP TABLE IF EXISTS `Admin`;

CREATE TABLE `Admin` (
  `Admin_id` INT AUTO_INCREMENT PRIMARY KEY,
  `Name` VARCHAR(100) NOT NULL,
  `Email` VARCHAR(100) NOT NULL UNIQUE,
  `Password` VARCHAR(255) NOT NULL,
  `Created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
-- 2. Patient Table
-- ---------------------------------------------------------
CREATE TABLE `Patient` (
  `Patient_id` INT AUTO_INCREMENT PRIMARY KEY,
  `Name` VARCHAR(100) NOT NULL,
  `Age` INT NOT NULL,
  `Phone` VARCHAR(100) NOT NULL,
  `Email` VARCHAR(100) NULL UNIQUE,
  `Place` VARCHAR(100) NULL,
  `Address` VARCHAR(100) NULL,
  `Password` VARCHAR(255) NOT NULL,
  `Created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
-- 3. Doctor Table
-- Specializations: Cardiology, Neurology, Orthopedics, Dermatology
-- ---------------------------------------------------------
CREATE TABLE `Doctor` (
  `Doc_id` INT AUTO_INCREMENT PRIMARY KEY,
  `Name` VARCHAR(100) NOT NULL,
  `Specialization` VARCHAR(100) NOT NULL,
  `Availability` VARCHAR(100) NOT NULL,
  `Email` VARCHAR(100) NOT NULL UNIQUE,
  `Password` VARCHAR(255) NOT NULL,
  `Phone` VARCHAR(50) NULL,
  `Experience_years` INT DEFAULT 5,
  `Room_no` VARCHAR(50) DEFAULT 'Room 101',
  `Created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
-- 4. Appointment Table
-- Statuses: Pending, Confirmed, Completed, Cancelled, Seen, No-Show, Approved for Surgery, Rejected for Surgery
-- ---------------------------------------------------------
CREATE TABLE `Appointment` (
  `Appo_id` INT AUTO_INCREMENT PRIMARY KEY,
  `Patient_id` INT NOT NULL,
  `Doc_id` INT NOT NULL,
  `Appo_date` DATE NOT NULL,
  `Appo_time` TIME NOT NULL,
  `Status` VARCHAR(50) NOT NULL DEFAULT 'Pending',
  `Symptoms` TEXT NULL,
  `Disease` VARCHAR(255) NULL,
  `Prescription` TEXT NULL,
  `Doctor_notes` TEXT NULL,
  `Surgery_decision` VARCHAR(50) NULL,
  `Created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_appo_doc_date_time` (`Doc_id`, `Appo_date`, `Appo_time`),
  INDEX `idx_appo_patient` (`Patient_id`),
  FOREIGN KEY (`Patient_id`) REFERENCES `Patient`(`Patient_id`) ON DELETE CASCADE,
  FOREIGN KEY (`Doc_id`) REFERENCES `Doctor`(`Doc_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
-- 5. Notification Table
-- ---------------------------------------------------------
CREATE TABLE `Notification` (
  `Not_id` INT AUTO_INCREMENT PRIMARY KEY,
  `Appo_id` INT NULL,
  `Doc_id` INT NULL,
  `Patient_id` INT NULL,
  `Msg` VARCHAR(255) NOT NULL,
  `Date` DATE NOT NULL,
  `Time` TIME NOT NULL,
  `Is_read` BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (`Appo_id`) REFERENCES `Appointment`(`Appo_id`) ON DELETE SET NULL,
  FOREIGN KEY (`Doc_id`) REFERENCES `Doctor`(`Doc_id`) ON DELETE SET NULL,
  FOREIGN KEY (`Patient_id`) REFERENCES `Patient`(`Patient_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================
-- Initial Seed Data
-- =========================================================

-- Admin Seed (Default pass: admin123)
-- Password hash generated with bcrypt 10 rounds: $2a$10$3p4KzUeN5W0k8IeU0r5CeuuJ1d0l6B8B1gQy8jM2Vp5/3E4Q6aH9S (or standard bcrypt)
