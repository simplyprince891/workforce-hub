package com.workforce.workforcehub.controller;

import com.workforce.workforcehub.dto.AttendanceResponse;
import com.workforce.workforcehub.entity.Attendance;
import com.workforce.workforcehub.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class AttendanceController {
    
    private final AttendanceService attendanceService;
    
    @PostMapping("/{employeeId}/check-in")
    public ResponseEntity<?> checkIn(@PathVariable Long employeeId) {
        try {
            return ResponseEntity.ok(AttendanceResponse.fromEntity(attendanceService.checkIn(employeeId)));
        } catch (Exception e) {
            log.error("Check-in failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
    
    @PostMapping("/{employeeId}/check-out")
    public ResponseEntity<?> checkOut(@PathVariable Long employeeId) {
        try {
            return ResponseEntity.ok(AttendanceResponse.fromEntity(attendanceService.checkOut(employeeId)));
        } catch (Exception e) {
            log.error("Check-out failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/{employeeId}/today")
    public ResponseEntity<AttendanceResponse> getTodayStatus(@PathVariable Long employeeId) {
        Attendance attendance = attendanceService.getTodayAttendance(employeeId);
        return ResponseEntity.ok(attendance != null ? AttendanceResponse.fromEntity(attendance) : null);
    }

    @GetMapping("/today/all")
    public ResponseEntity<List<AttendanceResponse>> getAllTodayLogs() {
        return ResponseEntity.ok(attendanceService.getAllAttendanceForToday().stream()
                .map(AttendanceResponse::fromEntity)
                .collect(Collectors.toList()));
    }
    
    @GetMapping("/{employeeId}/month")
    public ResponseEntity<List<AttendanceResponse>> getAttendanceForMonth(
            @PathVariable Long employeeId,
            @RequestParam int month,
            @RequestParam int year) {
        return ResponseEntity.ok(attendanceService.getAttendanceForMonth(employeeId, month, year).stream()
                .map(AttendanceResponse::fromEntity)
                .collect(Collectors.toList()));
    }

    private record ErrorResponse(String message) {}
}
