package com.workforce.workforcehub.dto;

import com.workforce.workforcehub.entity.Attendance;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private LocalDate date;
    private String status;
    private String checkInTime;
    private String checkOutTime;

    public static AttendanceResponse fromEntity(Attendance attendance) {
        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("HH:mm:ss");
        return new AttendanceResponse(
                attendance.getId(),
                attendance.getEmployee().getId(),
                attendance.getEmployee().getName(),
                attendance.getDate(),
                attendance.getStatus().name(),
                attendance.getCheckInTime() != null ? attendance.getCheckInTime().format(formatter) : null,
                attendance.getCheckOutTime() != null ? attendance.getCheckOutTime().format(formatter) : null
        );
    }
}
