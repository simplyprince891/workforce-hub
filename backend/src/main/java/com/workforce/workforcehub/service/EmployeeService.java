package com.workforce.workforcehub.service;

import com.workforce.workforcehub.dto.EmployeeRequest;
import com.workforce.workforcehub.dto.EmployeeResponse;
import com.workforce.workforcehub.dto.PagedResponse;
import com.workforce.workforcehub.entity.Employee;
import com.workforce.workforcehub.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeService {
    
    private final EmployeeRepository employeeRepository;
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
        return mapToResponse(saved);
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
                employee.getCreatedAt(),
                employee.getUpdatedAt()
        );
    }
}