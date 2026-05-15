package com.workforce.workforcehub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PayrollRequest {
    private Long employeeId;
    private Integer month;
    private Integer year;
    private Double bonus;
    private Double otherDeductions;
    private String notes;
}
