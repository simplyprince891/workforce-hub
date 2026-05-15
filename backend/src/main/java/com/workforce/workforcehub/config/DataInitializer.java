package com.workforce.workforcehub.config;

import com.workforce.workforcehub.entity.*;
import com.workforce.workforcehub.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {
    
    private final EmployeeRepository employeeRepository;
    private final TaskRepository taskRepository;
    private final TaskCommentRepository taskCommentRepository;
    private final LeaveRepository leaveRepository;
    private final PayrollRepository payrollRepository;
    private final TeamRepository teamRepository;
    private final AttendanceRepository attendanceRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) {
        log.info("Checking and seeding demo data...");
        LocalDate today = LocalDate.now();
            
            // 1. Admin (Always check and create/update if missing)
        Employee admin = employeeRepository.findByUsername("admin")
                .orElseGet(() -> employeeRepository.findByEmail("admin@workforce.com").orElse(new Employee()));
        
        if (admin.getId() == null) {
            admin.setUsername("admin");
            admin.setEmail("admin@workforce.com");
        }
            admin.setName("System Admin");
            admin.setAge(40);
            admin.setMobile("9876543210");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setDepartment("IT Administration");
            admin.setSalary(1500000.0);
            admin.setRole("ADMIN");
            employeeRepository.save(admin);

            // Create Managers if missing
            Employee managerEng = getOrCreateEmployee("David Manager", "david@workforce.com", "david", "david123", 35, "Engineering", 1200000.0, "MANAGER", admin);
            Employee managerHR = getOrCreateEmployee("Alice HR", "alice@workforce.com", "alice", "alice123", 38, "Human Resources", 1100000.0, "MANAGER", admin);

            // Create Teams if missing
            Team teamAlpha = getOrCreateTeam("Team Alpha", "Core Engineering Team", managerEng);
            Team teamBeta = getOrCreateTeam("Team Beta", "UI/UX Design Group", managerEng);

            // Create Team Leads
            Employee leadFrontend = getOrCreateEmployee("Sarah Lead", "sarah@workforce.com", "sarah", "sarah123", 30, "Frontend", 900000.0, "TEAM_LEAD", managerEng);
            leadFrontend.setTeam(teamBeta);
            employeeRepository.save(leadFrontend);

            Employee leadBackend = getOrCreateEmployee("Mike Lead", "mike@workforce.com", "mike", "mike123", 32, "Backend", 950000.0, "TEAM_LEAD", managerEng);
            leadBackend.setTeam(teamAlpha);
            employeeRepository.save(leadBackend);
            
            // Add a generic 'lead' user for the user
            Employee genericLead = getOrCreateEmployee("Team Lead", "lead@workforce.com", "lead", "lead123", 30, "Management", 850000.0, "TEAM_LEAD", managerEng);
            genericLead.setTeam(teamAlpha);
            employeeRepository.save(genericLead);

            // Create Employees
            Employee emp1 = getOrCreateEmployee("John Doe", "john@workforce.com", "john", "john123", 26, "Frontend", 600000.0, "EMPLOYEE", leadFrontend);
            emp1.setTeam(teamBeta);
            employeeRepository.save(emp1);

            Employee emp2 = getOrCreateEmployee("Jane Smith", "jane@workforce.com", "jane", "jane123", 28, "Frontend", 700000.0, "EMPLOYEE", leadFrontend);
            emp2.setTeam(teamBeta);
            employeeRepository.save(emp2);

            Employee emp3 = getOrCreateEmployee("Tom Wilson", "tom@workforce.com", "tom", "tom123", 25, "Backend", 650000.0, "EMPLOYEE", leadBackend);
            emp3.setTeam(teamAlpha);
            employeeRepository.save(emp3);

            Employee emp4 = getOrCreateEmployee("Emma Brown", "emma@workforce.com", "emma", "emma123", 29, "Human Resources", 680000.0, "EMPLOYEE", managerHR);
            employeeRepository.save(emp4);

            // Seed 15 more unique employees for pagination if they don't exist
            for (int i = 1; i <= 15; i++) {
                String uName = "staff" + i;
                if (!employeeRepository.existsByUsername(uName)) {
                    Employee staff = createEmployee("Staff Member " + i, uName + "@workforce.com", uName, "staff123", 22 + i, "General", 450000.0 + (i * 15000), "EMPLOYEE", managerEng);
                    staff.setTeam(i % 2 == 0 ? teamAlpha : teamBeta);
                    employeeRepository.save(staff);
                }
            }

            // Seed Attendance if not already seeded for Tom
            if (attendanceRepository.findByEmployeeIdAndDate(emp3.getId(), today.minusDays(1)).isEmpty()) {
                log.info("Seeding attendance history...");
                Employee[] demoEmployees = {emp1, emp2, emp3, emp4};
                for (Employee e : demoEmployees) {
                    for (int m = 0; m < 3; m++) {
                        LocalDate monthDate = today.minusMonths(m);
                        int limit = (m == 0) ? today.getDayOfMonth() : monthDate.lengthOfMonth() + 1;
                        
                        for (int d = 1; d < limit; d++) {
                            LocalDate logDate = monthDate.withDayOfMonth(d);
                            if (logDate.isAfter(today) || logDate.getDayOfWeek().getValue() >= 6) continue;

                            Attendance att = new Attendance();
                            att.setEmployee(e);
                            att.setDate(logDate);
                            if (Math.random() < 0.05) {
                                att.setStatus(Attendance.AttendanceStatus.ABSENT);
                            } else {
                                att.setStatus(Attendance.AttendanceStatus.PRESENT);
                                att.setCheckInTime(java.time.LocalTime.of(9, 0).plusMinutes((int)(Math.random() * 45)));
                                att.setCheckOutTime(java.time.LocalTime.of(17, 30).plusMinutes((int)(Math.random() * 90)));
                            }
                            attendanceRepository.save(att);
                        }
                    }
                }
            }
        log.info("Employee Tom: tom / tom123 (Check his payroll for deductions)");
    }
    
    private void seedPayroll(Employee employee, int month, int year) {
        Payroll payroll = new Payroll();
        payroll.setEmployee(employee);
        payroll.setMonth(month);
        payroll.setYear(year);
        
        double gross = employee.getSalary() / 12.0;
        double tax = gross * 0.15;
        double pf = gross * 0.05;
        
        double base = gross * 0.6;
        payroll.setBaseSalary(base);
        payroll.setHra(gross * 0.3);
        payroll.setSpecialAllowance(gross * 0.1);
        payroll.setConveyanceAllowance(0.0);
        payroll.setMedicalAllowance(0.0);
        payroll.setBonus(0.0);
        payroll.setOtherDeductions(0.0);
        payroll.setGrossSalary(gross);
        payroll.setTaxDeduction(tax);
        payroll.setPfDeduction(pf);
        payroll.setTotalDeductions(tax + pf);
        payroll.setNetSalary(gross - (tax + pf));
        payroll.setStatus("PAID");
        payroll.setPaidDate(LocalDate.now().minusDays(5));
        
        payrollRepository.save(payroll);
    }

    private Employee createEmployee(String name, String email, String username, String password, int age, String dept, double salary, String role, Employee manager) {
        Employee emp = new Employee();
        emp.setName(name);
        emp.setEmail(email);
        emp.setUsername(username);
        emp.setPassword(passwordEncoder.encode(password));
        emp.setAge(age);
        emp.setMobile("9876543210");
        emp.setDepartment(dept);
        emp.setSalary(salary);
        emp.setRole(role);
        emp.setManager(manager);
        return emp;
    }
    
    private Subtask createSubtask(Task task, String title, boolean isCompleted) {
        Subtask subtask = new Subtask();
        subtask.setTask(task);
        subtask.setTitle(title);
        subtask.setIsCompleted(isCompleted);
        return subtask;
    }

    private Employee getOrCreateEmployee(String name, String email, String username, String password, int age, String dept, double salary, String role, Employee manager) {
        Employee emp = employeeRepository.findByUsername(username)
                .orElseGet(() -> employeeRepository.findByEmail(email).orElse(new Employee()));
        
        if (emp.getId() == null) {
            emp.setUsername(username);
            emp.setEmail(email);
        }
        
        // Always update these fields to ensure demo data matches expectations
        emp.setName(name);
        emp.setPassword(passwordEncoder.encode(password));
        emp.setAge(age);
        emp.setMobile("9876543210");
        emp.setDepartment(dept);
        emp.setSalary(salary);
        emp.setRole(role);
        emp.setManager(manager);
        return employeeRepository.save(emp);
    }

    private Team getOrCreateTeam(String name, String desc, Employee manager) {
        return teamRepository.findAll().stream()
                .filter(t -> t.getName().equals(name))
                .findFirst()
                .orElseGet(() -> {
                    Team t = new Team();
                    t.setName(name);
                    t.setDescription(desc);
                    t.setManager(manager);
                    return teamRepository.save(t);
                });
    }
}