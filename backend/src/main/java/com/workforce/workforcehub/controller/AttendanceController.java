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

    @PostMapping("/{employeeId}/request-reset")
    public ResponseEntity<?> requestReset(@PathVariable Long employeeId, @RequestBody String body) {
        try {
            String reason = parseStringPayload(body, "reason");
            return ResponseEntity.ok(com.workforce.workforcehub.dto.AttendanceResetRequestResponse.fromEntity(attendanceService.requestReset(employeeId, reason)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/resets/pending")
    public ResponseEntity<List<com.workforce.workforcehub.dto.AttendanceResetRequestResponse>> getPendingResets() {
        return ResponseEntity.ok(attendanceService.getPendingResets().stream()
                .map(com.workforce.workforcehub.dto.AttendanceResetRequestResponse::fromEntity)
                .collect(Collectors.toList()));
    }

    @PostMapping("/resets/approve/{requestId}")
    public ResponseEntity<?> approveReset(@PathVariable Long requestId, @RequestBody(required = false) String body) {
        try {
            String remarks = parseStringPayload(body, "remarks");
            attendanceService.approveReset(requestId, remarks);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/{employeeId}/work-hours")
    public ResponseEntity<Double> getWorkHours(
            @PathVariable Long employeeId,
            @RequestParam int month,
            @RequestParam int year) {
        return ResponseEntity.ok(attendanceService.getTotalWorkHoursForMonth(employeeId, month, year));
    }

    private String parseStringPayload(String body, String key) {
        if (body == null || body.trim().isEmpty()) {
            return "";
        }
        String trimmed = body.trim();
        if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                com.fasterxml.jackson.databind.JsonNode node = mapper.readTree(trimmed);
                if (node.has(key)) {
                    return node.get(key).asText();
                }
            } catch (Exception e) {
                // fallback to raw body
            }
        }
        if (trimmed.startsWith("\"") && trimmed.endsWith("\"") && trimmed.length() >= 2) {
            return trimmed.substring(1, trimmed.length() - 1);
        }
        return trimmed;
    }

    private record ErrorResponse(String message) {}
}

