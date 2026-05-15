package com.workforce.workforcehub.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class LeaveApplicationRequest {
    private Long employeeId;
    private LocalDate startDate;
    private LocalDate endDate;
    private String type; // SICK, CASUAL, PAID
    private String reason;
}
