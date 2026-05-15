package com.workforce.workforcehub.service;

import com.workforce.workforcehub.dto.AuthResponse;
import com.workforce.workforcehub.dto.EmployeeRequest;
import com.workforce.workforcehub.dto.EmployeeResponse;
import com.workforce.workforcehub.entity.Employee;
import com.workforce.workforcehub.repository.EmployeeRepository;
import com.workforce.workforcehub.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    
    @Transactional
    public AuthResponse register(EmployeeRequest request) {
        if (employeeRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        Employee employee = new Employee();
        employee.setName(request.getName());
        employee.setEmail(request.getEmail());
        employee.setAge(request.getAge());
        employee.setMobile(request.getMobile());
        employee.setUsername(request.getUsername());
        employee.setPassword(passwordEncoder.encode(request.getPassword()));
        employee.setDepartment("Unassigned");
        employee.setSalary(0.0);
        employee.setRole("EMPLOYEE");
        
        if (request.getManagerId() != null) {
            Employee manager = employeeRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new RuntimeException("Manager not found"));
            employee.setManager(manager);
        }
        
        Employee saved = employeeRepository.save(employee);
        
        String token = jwtTokenProvider.generateToken(saved.getUsername(), saved.getRole());
        
        return new AuthResponse(token, saved.getUsername(), saved.getRole(), saved.getId(), saved.getName());
    }
    
    public AuthResponse login(String username, String password) {
        Employee employee = employeeRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));
        
        if (!passwordEncoder.matches(password, employee.getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }
        
        String token = jwtTokenProvider.generateToken(employee.getUsername(), employee.getRole());
        
        return new AuthResponse(token, employee.getUsername(), employee.getRole(), employee.getId(), employee.getName());
    }
    
    public EmployeeResponse getCurrentUser(String username) {
        Employee employee = employeeRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return mapToResponse(employee);
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