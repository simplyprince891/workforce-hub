package com.workforce.workforcehub.service;

import com.workforce.workforcehub.entity.Attendance;
import com.workforce.workforcehub.entity.Employee;
import com.workforce.workforcehub.repository.AttendanceRepository;
import com.workforce.workforcehub.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttendanceService {
    
    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    
    @Transactional
    public Attendance checkIn(Long employeeId) {
        log.info("Check-in request for employee: {}", employeeId);
        LocalDate today = LocalDate.now();
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(employeeId, today)
                .orElse(new Attendance());
        
        if (attendance.getCheckInTime() != null) {
            log.warn("Employee {} already checked in today at {}", employeeId, attendance.getCheckInTime());
            throw new RuntimeException("Already checked in today");
        }

        attendance.setEmployee(employee);
        attendance.setDate(today);
        attendance.setStatus(Attendance.AttendanceStatus.PRESENT);
        attendance.setCheckInTime(java.time.LocalTime.now());
        
        Attendance saved = attendanceRepository.save(attendance);
        log.info("Check-in successful for employee: {}. Saved ID: {}", employeeId, saved.getId());
        return saved;
    }

    @Transactional
    public Attendance checkOut(Long employeeId) {
        log.info("Check-out request for employee: {}", employeeId);
        LocalDate today = LocalDate.now();
        Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(employeeId, today)
                .orElseThrow(() -> new RuntimeException("No check-in found for today"));
        
        if (attendance.getCheckOutTime() != null) {
            log.warn("Employee {} already checked out today at {}", employeeId, attendance.getCheckOutTime());
            throw new RuntimeException("Already checked out today");
        }

        attendance.setCheckOutTime(java.time.LocalTime.now());
        Attendance saved = attendanceRepository.save(attendance);
        log.info("Check-out successful for employee: {}. Saved ID: {}", employeeId, saved.getId());
        return saved;
    }

    public Attendance getTodayAttendance(Long employeeId) {
        return attendanceRepository.findByEmployeeIdAndDate(employeeId, LocalDate.now()).orElse(null);
    }
    
    public List<Attendance> getAttendanceForMonth(Long employeeId, int month, int year) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        return attendanceRepository.findByEmployeeIdAndDateBetween(employeeId, start, end);
    }

    public List<Attendance> getAllAttendanceForToday() {
        return attendanceRepository.findByDate(LocalDate.now());
    }
    
    public long getAbsentDays(Long employeeId, int month, int year) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        return attendanceRepository.countAbsentDays(employeeId, start, end);
    }
}
