package com.workforce.workforcehub.config;

import com.workforce.workforcehub.entity.Employee;
import com.workforce.workforcehub.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {
    
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) {
        if (!employeeRepository.existsByUsername("admin")) {
            Employee admin = new Employee();
            admin.setName("System Administrator");
            admin.setEmail("admin@workforce.com");
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setAge(30);
            admin.setMobile("1234567890");
            admin.setDepartment("IT");
            admin.setSalary(100000.0);
            admin.setRole("ADMIN");
            
            employeeRepository.save(admin);
            log.info("Default admin user created with username: admin, password: admin123");
        }
    }
}