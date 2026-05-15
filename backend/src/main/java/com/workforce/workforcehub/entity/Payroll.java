package com.workforce.workforcehub.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import lombok.ToString;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "payrolls")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payroll {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;
    
    private Integer month;
    
    private Integer year;
    
    private Double baseSalary;
    
    private Double hra; // House Rent Allowance (typically 40% of base)
    
    private Double conveyanceAllowance;
    
    private Double medicalAllowance;
    
    private Double specialAllowance;
    
    private Double grossSalary;
    
    private Double pfDeduction; // Provident Fund (12% of base)
    
    private Double taxDeduction; // Income tax
    
    private Double otherDeductions;
    
    private Double totalDeductions;
    
    private Double netSalary;
    
    private Double bonus;
    
    private String status; // DRAFT, APPROVED, PAID
    
    private LocalDate paidDate;
    
    private String notes;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
}
