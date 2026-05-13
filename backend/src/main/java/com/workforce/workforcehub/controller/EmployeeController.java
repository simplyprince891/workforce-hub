package com.workforce.workforcehub.controller;

import com.workforce.workforcehub.dto.*;
import com.workforce.workforcehub.service.EmployeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
@Tag(name = "Employees", description = "Employee Management APIs")
public class EmployeeController {
    
    private final EmployeeService employeeService;
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "Create a new employee")
    public ResponseEntity<EmployeeResponse> createEmployee(@Valid @RequestBody EmployeeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(employeeService.createEmployee(request));
    }
    
    @GetMapping
    @Operation(summary = "Get all employees with pagination")
    public ResponseEntity<PagedResponse<EmployeeResponse>> getAllEmployees(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        return ResponseEntity.ok(employeeService.getAllEmployees(page, size, sortBy, direction));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get employee by ID")
    public ResponseEntity<EmployeeResponse> getEmployeeById(@PathVariable Long id) {
        return ResponseEntity.ok(employeeService.getEmployeeById(id));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "Update employee")
    public ResponseEntity<EmployeeResponse> updateEmployee(@PathVariable Long id, @Valid @RequestBody EmployeeRequest request) {
        return ResponseEntity.ok(employeeService.updateEmployee(id, request));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete employee")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search employees by name or email")
    public ResponseEntity<PagedResponse<EmployeeResponse>> searchEmployees(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String email,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(employeeService.searchEmployees(name, email, page, size));
    }
    
    @GetMapping("/filter/department")
    @Operation(summary = "Filter employees by department")
    public ResponseEntity<PagedResponse<EmployeeResponse>> filterByDepartment(
            @RequestParam String department,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(employeeService.filterByDepartment(department, page, size));
    }
    
    @GetMapping("/filter/salary")
    @Operation(summary = "Filter employees by salary range")
    public ResponseEntity<PagedResponse<EmployeeResponse>> filterBySalary(
            @RequestParam Double minSalary,
            @RequestParam Double maxSalary,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(employeeService.filterBySalary(minSalary, maxSalary, page, size));
    }
    
    @GetMapping("/manager/{managerId}")
    @Operation(summary = "Get employees by manager")
    public ResponseEntity<List<EmployeeResponse>> getEmployeesByManager(@PathVariable Long managerId) {
        return ResponseEntity.ok(employeeService.getEmployeesByManager(managerId));
    }
    
    @GetMapping("/role/{role}")
    @Operation(summary = "Get employees by role")
    public ResponseEntity<List<EmployeeResponse>> getEmployeesByRole(@PathVariable String role) {
        return ResponseEntity.ok(employeeService.getEmployeesByRole(role));
    }
    
    @GetMapping("/departments")
    @Operation(summary = "Get all departments")
    public ResponseEntity<List<String>> getAllDepartments() {
        return ResponseEntity.ok(employeeService.getAllDepartments());
    }
}