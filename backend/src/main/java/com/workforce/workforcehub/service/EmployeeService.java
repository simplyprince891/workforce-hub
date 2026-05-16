package com.workforce.workforcehub.service;

import com.workforce.workforcehub.dto.EmployeeRequest;
import com.workforce.workforcehub.dto.EmployeeResponse;
import com.workforce.workforcehub.dto.PagedResponse;
import com.workforce.workforcehub.entity.*;
import com.workforce.workforcehub.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeService {
    
    private final EmployeeRepository employeeRepository;
    private final TeamRepository teamRepository;
    private final TaskRepository taskRepository;
    private final PayrollRepository payrollRepository;
    private final AttendanceRepository attendanceRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Transactional
    public EmployeeResponse createEmployee(EmployeeRequest request) {
        if (employeeRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        Employee employee = new Employee();
        updateEmployeeFromRequest(employee, request);
        employee.setPassword(passwordEncoder.encode(request.getPassword()));
        
        Employee saved = employeeRepository.save(employee);
        
        // Post-registration seeding: Give them a welcome task and initial record
        seedNewEmployeeData(saved);
        
        return mapToResponse(saved);
    }

    private void seedNewEmployeeData(Employee employee) {
        // 1. Welcome Task
        Task welcomeTask = new Task();
        welcomeTask.setTitle("Onboarding: Welcome to the Team!");
        welcomeTask.setDescription("Complete your profile setup and introduce yourself on Slack.");
        welcomeTask.setPriority("MEDIUM");
        welcomeTask.setStatus("PENDING");
        welcomeTask.setDeadline(LocalDate.now().plusDays(3));
        welcomeTask.setAssignedTo(employee);
        taskRepository.save(welcomeTask);

        // 2. Initial Payroll Record (Current Month)
        Payroll p = new Payroll();
        p.setEmployee(employee);
        p.setMonth(LocalDate.now().getMonthValue());
        p.setYear(LocalDate.now().getYear());
        p.setBaseSalary(employee.getSalary() != null ? employee.getSalary() : 500000.0);
        p.setBonus(0.0);
        p.setPfDeduction(p.getBaseSalary() * 0.12);
        p.setTaxDeduction(p.getBaseSalary() * 0.1);
        p.setTotalDeductions(p.getPfDeduction() + p.getTaxDeduction());
        p.setNetSalary(p.getBaseSalary() - p.getTotalDeductions());
        p.setStatus("DRAFT");
        payrollRepository.save(p);

        // 3. Today's initial attendance (Present by default for new joiner demo)
        Attendance att = new Attendance();
        att.setEmployee(employee);
        att.setDate(LocalDate.now());
        att.setStatus(Attendance.AttendanceStatus.PRESENT);
        att.setCheckInTime(java.time.LocalTime.of(9, 0));
        attendanceRepository.save(att);
    }
    
    @Transactional
    public EmployeeResponse updateEmployee(Long id, EmployeeRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        if (!employee.getUsername().equals(request.getUsername()) 
                && employeeRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (!employee.getEmail().equals(request.getEmail()) 
                && employeeRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        updateEmployeeFromRequest(employee, request);
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            employee.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        
        Employee saved = employeeRepository.save(employee);
        return mapToResponse(saved);
    }
    
    public EmployeeResponse getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        return mapToResponse(employee);
    }
    
    public PagedResponse<EmployeeResponse> getAllEmployees(int page, int size, String sortBy, String direction) {
        Sort sort = direction.equalsIgnoreCase("desc") 
                ? Sort.by(sortBy).descending() 
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Employee> employeePage = employeeRepository.findAll(pageable);
        
        return new PagedResponse<>(
                employeePage.getContent().stream().map(this::mapToResponse).collect(Collectors.toList()),
                employeePage.getNumber(),
                employeePage.getSize(),
                employeePage.getTotalElements(),
                employeePage.getTotalPages(),
                employeePage.isLast()
        );
    }
    
    public PagedResponse<EmployeeResponse> searchEmployees(String name, String email, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Employee> employeePage = employeeRepository.searchByNameOrEmail(name, email, pageable);
        
        return new PagedResponse<>(
                employeePage.getContent().stream().map(this::mapToResponse).collect(Collectors.toList()),
                employeePage.getNumber(),
                employeePage.getSize(),
                employeePage.getTotalElements(),
                employeePage.getTotalPages(),
                employeePage.isLast()
        );
    }
    
    public PagedResponse<EmployeeResponse> filterByDepartment(String department, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Employee> employeePage = employeeRepository.findByDepartment(department, pageable);
        
        return new PagedResponse<>(
                employeePage.getContent().stream().map(this::mapToResponse).collect(Collectors.toList()),
                employeePage.getNumber(),
                employeePage.getSize(),
                employeePage.getTotalElements(),
                employeePage.getTotalPages(),
                employeePage.isLast()
        );
    }
    
    public PagedResponse<EmployeeResponse> filterBySalary(Double minSalary, Double maxSalary, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Employee> employeePage = employeeRepository.findBySalaryRange(minSalary, maxSalary, pageable);
        
        return new PagedResponse<>(
                employeePage.getContent().stream().map(this::mapToResponse).collect(Collectors.toList()),
                employeePage.getNumber(),
                employeePage.getSize(),
                employeePage.getTotalElements(),
                employeePage.getTotalPages(),
                employeePage.isLast()
        );
    }
    
    @Transactional
    public void deleteEmployee(Long id) {
        if (!employeeRepository.existsById(id)) {
            throw new RuntimeException("Employee not found");
        }
        employeeRepository.deleteById(id);
    }
    
    public List<EmployeeResponse> getEmployeesByManager(Long managerId) {
        return employeeRepository.findByManagerId(managerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public List<EmployeeResponse> getEmployeesByRole(String role) {
        return employeeRepository.findByRole(role).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public List<String> getAllDepartments() {
        return employeeRepository.findAllDepartments();
    }
    
    public Employee findByUsername(String username) {
        return employeeRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
    }
    
    private void updateEmployeeFromRequest(Employee employee, EmployeeRequest request) {
        employee.setName(request.getName());
        employee.setEmail(request.getEmail());
        employee.setAge(request.getAge());
        employee.setMobile(request.getMobile());
        employee.setUsername(request.getUsername());
        employee.setDepartment(request.getDepartment());
        employee.setSalary(request.getSalary());
        employee.setRole(request.getRole());
        
        if (request.getManagerId() != null) {
            Employee manager = employeeRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new RuntimeException("Manager not found"));
            employee.setManager(manager);
        }

        if (request.getTeamId() != null) {
            Team team = teamRepository.findById(request.getTeamId())
                    .orElseThrow(() -> new RuntimeException("Team not found"));
            employee.setTeam(team);
        }
    }
    
    private EmployeeResponse mapToResponse(Employee employee) {
        return new EmployeeResponse(
                employee.getId(),
                employee.getName(),
                employee.getEmail(),
                employee.getAge(),
                employee.getMobile(),
                employee.getUsername(),
                employee.getDepartment(),
                employee.getSalary(),
                employee.getRole(),
                employee.getManager() != null ? employee.getManager().getId() : null,
                employee.getManagerName(),
                employee.getTeam() != null ? employee.getTeam().getId() : null,
                employee.getTeam() != null ? employee.getTeam().getName() : null,
                employee.getCreatedAt(),
                employee.getUpdatedAt()
        );
    }
}