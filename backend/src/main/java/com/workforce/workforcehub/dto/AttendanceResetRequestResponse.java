package com.workforce.workforcehub.dto;

import com.workforce.workforcehub.entity.AttendanceResetRequest;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceResetRequestResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private LocalDate targetDate;
    private String reason;
    private String status;
    private String adminRemarks;

    public static AttendanceResetRequestResponse fromEntity(AttendanceResetRequest request) {
        return new AttendanceResetRequestResponse(
                request.getId(),
                request.getEmployee().getId(),
                request.getEmployee().getName(),
                request.getTargetDate(),
                request.getReason(),
                request.getStatus(),
                request.getAdminRemarks()
        );
    }
}
