package com.workforce.workforcehub.controller;

import com.workforce.workforcehub.dto.PayrollRequest;
import com.workforce.workforcehub.dto.PayrollResponse;
import com.workforce.workforcehub.service.PayrollService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payroll")
@RequiredArgsConstructor
@Tag(name = "Payroll", description = "Payroll Management APIs")
public class PayrollController {
    
    private final PayrollService payrollService;
    
    @PostMapping("/generate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Generate payroll for a single employee")
    public ResponseEntity<PayrollResponse> generatePayroll(@RequestBody PayrollRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(payrollService.generatePayroll(request));
    }
    
    @PostMapping("/generate-bulk")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Generate payroll for all employees")
    public ResponseEntity<List<PayrollResponse>> generateBulkPayroll(
            @RequestParam Integer month, @RequestParam Integer year) {
        return ResponseEntity.status(HttpStatus.CREATED).body(payrollService.generateBulkPayroll(month, year));
    }
    
    @GetMapping("/employee/{employeeId}")
    @Operation(summary = "Get payroll history for an employee")
    public ResponseEntity<List<PayrollResponse>> getPayrollByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(payrollService.getPayrollByEmployee(employeeId));
    }
    
    @GetMapping("/monthly")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get monthly payroll report")
    public ResponseEntity<List<PayrollResponse>> getPayrollByMonth(
            @RequestParam Integer month, @RequestParam Integer year) {
        return ResponseEntity.ok(payrollService.getPayrollByMonth(month, year));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get payroll by ID")
    public ResponseEntity<PayrollResponse> getPayrollById(@PathVariable Long id) {
        return ResponseEntity.ok(payrollService.getPayrollById(id));
    }
    
    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Approve payroll")
    public ResponseEntity<PayrollResponse> approvePayroll(@PathVariable Long id) {
        return ResponseEntity.ok(payrollService.approvePayroll(id));
    }
    
    @PatchMapping("/{id}/pay")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Mark payroll as paid")
    public ResponseEntity<PayrollResponse> markAsPaid(@PathVariable Long id) {
        return ResponseEntity.ok(payrollService.markAsPaid(id));
    }
    
    @GetMapping("/monthly/total")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get total payroll cost for a month")
    public ResponseEntity<Double> getTotalPayrollForMonth(
            @RequestParam Integer month, @RequestParam Integer year) {
        return ResponseEntity.ok(payrollService.getTotalPayrollForMonth(month, year));
    }
}
