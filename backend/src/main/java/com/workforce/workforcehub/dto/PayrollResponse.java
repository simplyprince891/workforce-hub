package com.workforce.workforcehub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PayrollResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String department;
    private Integer month;
    private Integer year;
    private Double baseSalary;
    private Double hra;
    private Double conveyanceAllowance;
    private Double medicalAllowance;
    private Double specialAllowance;
    private Double grossSalary;
    private Double pfDeduction;
    private Double taxDeduction;
    private Double otherDeductions;
    private Double totalDeductions;
    private Double netSalary;
    private Double bonus;
    private String status;
    private LocalDate paidDate;
    private String notes;
    private LocalDateTime createdAt;
}
