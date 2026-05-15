package com.workforce.workforcehub.service;

import com.workforce.workforcehub.dto.PayrollRequest;
import com.workforce.workforcehub.dto.PayrollResponse;
import com.workforce.workforcehub.entity.Employee;
import com.workforce.workforcehub.entity.Payroll;
import com.workforce.workforcehub.repository.EmployeeRepository;
import com.workforce.workforcehub.repository.PayrollRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PayrollService {
    
    private final PayrollRepository payrollRepository;
    private final EmployeeRepository employeeRepository;
    private final AttendanceService attendanceService;
    
    @Transactional
    public PayrollResponse generatePayroll(PayrollRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        if (payrollRepository.existsByEmployeeIdAndMonthAndYear(
                request.getEmployeeId(), request.getMonth(), request.getYear())) {
            throw new RuntimeException("Payroll already generated for this employee for " 
                    + request.getMonth() + "/" + request.getYear());
        }
        
        Payroll payroll = calculatePayroll(employee, request);
        Payroll saved = payrollRepository.save(payroll);
        return mapToResponse(saved);
    }
    
    public List<PayrollResponse> generateBulkPayroll(Integer month, Integer year) {
        List<Employee> employees = employeeRepository.findAll();
        
        // Fetch all existing payrolls for this month/year to avoid concurrent read/write locks in SQLite
        List<Payroll> existingPayrolls = payrollRepository.findByMonthAndYearOrderByEmployeeNameAsc(month, year);
        List<Long> employeesWithPayroll = existingPayrolls.stream()
                .map(p -> p.getEmployee().getId())
                .collect(Collectors.toList());
        
        List<Payroll> payrollsToSave = employees.stream()
                .filter(emp -> !employeesWithPayroll.contains(emp.getId()))
                .filter(emp -> emp.getSalary() != null && emp.getSalary() > 0)
                .map(emp -> {
                    PayrollRequest request = new PayrollRequest();
                    request.setEmployeeId(emp.getId());
                    request.setMonth(month);
                    request.setYear(year);
                    request.setBonus(0.0);
                    request.setOtherDeductions(0.0);
                    
                    return calculatePayroll(emp, request);
                })
                .collect(Collectors.toList());
                
        List<Payroll> savedPayrolls = payrollRepository.saveAll(payrollsToSave);
        return savedPayrolls.stream().map(this::mapToResponse).collect(Collectors.toList());
    }
    
    public List<PayrollResponse> getPayrollByEmployee(Long employeeId) {
        return payrollRepository.findByEmployeeIdOrderByYearDescMonthDesc(employeeId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }
    
    public List<PayrollResponse> getPayrollByMonth(Integer month, Integer year) {
        return payrollRepository.findByMonthAndYearOrderByEmployeeNameAsc(month, year)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }
    
    public PayrollResponse getPayrollById(Long id) {
        Payroll payroll = payrollRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payroll record not found"));
        return mapToResponse(payroll);
    }
    
    @Transactional
    public PayrollResponse markAsPaid(Long id) {
        Payroll payroll = payrollRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payroll record not found"));
        payroll.setStatus("PAID");
        payroll.setPaidDate(LocalDate.now());
        return mapToResponse(payrollRepository.save(payroll));
    }
    
    @Transactional
    public PayrollResponse approvePayroll(Long id) {
        Payroll payroll = payrollRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payroll record not found"));
        payroll.setStatus("APPROVED");
        return mapToResponse(payrollRepository.save(payroll));
    }
    
    public Double getTotalPayrollForMonth(Integer month, Integer year) {
        return payrollRepository.getTotalPayrollForMonth(month, year);
    }
    
    private Payroll calculatePayroll(Employee employee, PayrollRequest request) {
        double annualSalary = employee.getSalary() != null ? employee.getSalary() : 0;
        double monthlyCTC = annualSalary / 12.0;
        
        // Standard Indian payroll structure
        double baseSalary = monthlyCTC * 0.40;        // 40% of CTC
        double hra = baseSalary * 0.40;                // 40% of base
        double conveyanceAllowance = 1600;             // Standard
        double medicalAllowance = 1250;                // Standard
        double specialAllowance = monthlyCTC - baseSalary - hra - conveyanceAllowance - medicalAllowance;
        if (specialAllowance < 0) specialAllowance = 0;
        
        double grossSalary = baseSalary + hra + conveyanceAllowance + medicalAllowance + specialAllowance;
        
        // Deductions
        double pfDeduction = baseSalary * 0.12;        // 12% of base salary
        double taxDeduction = calculateTax(annualSalary) / 12.0;
        double otherDeductions = request.getOtherDeductions() != null ? request.getOtherDeductions() : 0;
        double totalDeductions = pfDeduction + taxDeduction + otherDeductions;
        
        double bonus = request.getBonus() != null ? request.getBonus() : 0;
        
        // Attendance-based deduction
        long absentDays = attendanceService.getAbsentDays(employee.getId(), request.getMonth(), request.getYear());
        double perDaySalary = monthlyCTC / 30.0; 
        double attendanceDeduction = absentDays * perDaySalary;
        
        double finalOtherDeductions = otherDeductions + attendanceDeduction;
        double totalDeductionsWithAttendance = pfDeduction + taxDeduction + finalOtherDeductions;
        double netSalary = grossSalary - totalDeductionsWithAttendance + bonus;
        
        Payroll payroll = new Payroll();
        payroll.setEmployee(employee);
        payroll.setMonth(request.getMonth());
        payroll.setYear(request.getYear());
        payroll.setBaseSalary(Math.round(baseSalary * 100.0) / 100.0);
        payroll.setHra(Math.round(hra * 100.0) / 100.0);
        payroll.setConveyanceAllowance(conveyanceAllowance);
        payroll.setMedicalAllowance(medicalAllowance);
        payroll.setSpecialAllowance(Math.round(specialAllowance * 100.0) / 100.0);
        payroll.setGrossSalary(Math.round(grossSalary * 100.0) / 100.0);
        payroll.setPfDeduction(Math.round(pfDeduction * 100.0) / 100.0);
        payroll.setTaxDeduction(Math.round(taxDeduction * 100.0) / 100.0);
        payroll.setOtherDeductions(Math.round(finalOtherDeductions * 100.0) / 100.0);
        payroll.setTotalDeductions(Math.round(totalDeductionsWithAttendance * 100.0) / 100.0);
        payroll.setNetSalary(Math.round(netSalary * 100.0) / 100.0);
        payroll.setBonus(bonus);
        payroll.setStatus("DRAFT");
        payroll.setNotes(request.getNotes() + (absentDays > 0 ? " | Absent days: " + absentDays : ""));
        
        return payroll;
    }
    
    // Simplified Indian tax slab (New Regime FY 2024-25)
    private double calculateTax(double annualIncome) {
        if (annualIncome <= 300000) return 0;
        if (annualIncome <= 700000) return (annualIncome - 300000) * 0.05;
        if (annualIncome <= 1000000) return 20000 + (annualIncome - 700000) * 0.10;
        if (annualIncome <= 1200000) return 50000 + (annualIncome - 1000000) * 0.15;
        if (annualIncome <= 1500000) return 80000 + (annualIncome - 1200000) * 0.20;
        return 140000 + (annualIncome - 1500000) * 0.30;
    }
    
    private PayrollResponse mapToResponse(Payroll payroll) {
        return new PayrollResponse(
                payroll.getId(),
                payroll.getEmployee().getId(),
                payroll.getEmployee().getName(),
                payroll.getEmployee().getDepartment(),
                payroll.getMonth(),
                payroll.getYear(),
                payroll.getBaseSalary(),
                payroll.getHra(),
                payroll.getConveyanceAllowance(),
                payroll.getMedicalAllowance(),
                payroll.getSpecialAllowance(),
                payroll.getGrossSalary(),
                payroll.getPfDeduction(),
                payroll.getTaxDeduction(),
                payroll.getOtherDeductions(),
                payroll.getTotalDeductions(),
                payroll.getNetSalary(),
                payroll.getBonus(),
                payroll.getStatus(),
                payroll.getPaidDate(),
                payroll.getNotes(),
                payroll.getCreatedAt()
        );
    }
}
