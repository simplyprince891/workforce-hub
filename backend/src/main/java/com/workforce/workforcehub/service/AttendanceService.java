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
    private final com.workforce.workforcehub.repository.AttendanceResetRequestRepository resetRequestRepository;
    
    @Transactional
    public com.workforce.workforcehub.entity.AttendanceResetRequest requestReset(Long employeeId, String reason) {
        LocalDate today = LocalDate.now();
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        // Check if a pending request already exists
        if (resetRequestRepository.findByEmployeeIdAndTargetDateAndStatus(employeeId, today, "PENDING").isPresent()) {
            throw new RuntimeException("A reset request is already pending for today");
        }
        
        com.workforce.workforcehub.entity.AttendanceResetRequest request = new com.workforce.workforcehub.entity.AttendanceResetRequest();
        request.setEmployee(employee);
        request.setTargetDate(today);
        request.setReason(reason);
        request.setStatus("PENDING");
        
        return resetRequestRepository.save(request);
    }

    @Transactional
    public void approveReset(Long requestId, String remarks) {
        com.workforce.workforcehub.entity.AttendanceResetRequest request = resetRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        
        request.setStatus("APPROVED");
        request.setAdminRemarks(remarks);
        resetRequestRepository.save(request);
        
        // Delete or reset the attendance record for that day
        attendanceRepository.findByEmployeeIdAndDate(request.getEmployee().getId(), request.getTargetDate())
                .ifPresent(attendanceRepository::delete);
    }

    @Transactional(readOnly = true)
    public List<com.workforce.workforcehub.entity.AttendanceResetRequest> getPendingResets() {
        return resetRequestRepository.findByStatus("PENDING");
    }

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

    public double getTotalWorkHoursForMonth(Long employeeId, int month, int year) {
        List<Attendance> logs = getAttendanceForMonth(employeeId, month, year);
        double totalHours = 0;
        for (Attendance log : logs) {
            if (log.getCheckInTime() != null && log.getCheckOutTime() != null) {
                long minutes = java.time.Duration.between(log.getCheckInTime(), log.getCheckOutTime()).toMinutes();
                totalHours += minutes / 60.0;
            }
        }
        return Math.round(totalHours * 10.0) / 10.0; // Round to 1 decimal
    }
}
