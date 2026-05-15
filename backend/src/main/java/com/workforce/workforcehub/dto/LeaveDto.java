package com.workforce.workforcehub.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class LeaveDto {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String department;
    private LocalDate startDate;
    private LocalDate endDate;
    private String type;
    private String status;
    private String reason;
    private String adminRemarks;
    private long days;
    private String createdAt;
}
