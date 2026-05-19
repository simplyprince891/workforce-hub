package com.workforce.workforcehub.config;

import com.workforce.workforcehub.entity.*;
import com.workforce.workforcehub.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {
    
    private final EmployeeRepository employeeRepository;
    private final TeamRepository teamRepository;
    private final TaskRepository taskRepository;
    private final SubtaskRepository subtaskRepository;
    private final PayrollRepository payrollRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRepository leaveRepository;
    private final TaskCommentRepository taskCommentRepository;
    private final AttendanceResetRequestRepository attendanceResetRequestRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Starting OpsFlow Comprehensive Data Seeding...");
        
        // 1. Core Users (Persistent)
        Employee admin = getOrCreateEmployee("Admin User", "admin@workforce.com", "admin", "admin123", 35, "Management", 1200000.0, "ADMIN", null, "9876543210");
        Employee managerEng = getOrCreateEmployee("David Miller", "david@workforce.com", "david", "david123", 40, "Engineering", 950000.0, "MANAGER", admin, "9876543211");
        Employee managerHR = getOrCreateEmployee("Sarah Parker", "sarah@workforce.com", "sarah", "sarah123", 38, "Human Resources", 850000.0, "MANAGER", admin, "9876543212");
        Employee leadFrontend = getOrCreateEmployee("Alice Chen", "alice@workforce.com", "alice", "alice123", 32, "Frontend", 800000.0, "TEAM_LEAD", managerEng, "9876543215");
        Employee leadBackend = getOrCreateEmployee("Bob Smith", "bob@workforce.com", "bob", "bob123", 34, "Backend", 820000.0, "TEAM_LEAD", managerEng, "9876543216");
        Employee leadDesign = getOrCreateEmployee("Pam Beesly", "pam@workforce.com", "pam", "pam123", 28, "Design", 750000.0, "TEAM_LEAD", managerEng, "9876543217");

        // 2. Teams
        Team teamAlpha = getOrCreateTeam("Team Alpha", "Backend Core Services", leadBackend);
        Team teamBeta = getOrCreateTeam("Team Beta", "Frontend Experience", leadFrontend);
        Team teamGamma = getOrCreateTeam("Team Gamma", "Product Marketing", managerHR);
        Team teamZeta = getOrCreateTeam("Team Zeta", "UI/UX Design", leadDesign);

        // 3. Generate 30 Employees total (add 24 more)
        String[] firstNames = {"James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa", "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra"};
        String[] lastNames = {"Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson"};

        List<Employee> allEmployees = new ArrayList<>();
        allEmployees.add(admin); allEmployees.add(managerEng); allEmployees.add(managerHR);
        allEmployees.add(leadFrontend); allEmployees.add(leadBackend); allEmployees.add(leadDesign);

        Random random = new Random();
        for (int i = 0; i < 24; i++) {
            String username = "staff" + (i + 1);
            String email = username + "@workforce.com";
            String fullName = firstNames[i] + " " + lastNames[i];
            
            Employee staff = getOrCreateEmployee(fullName, email, username, "password123", 
                22 + random.nextInt(15), "Engineering", 
                450000.0 + random.nextInt(50000), "EMPLOYEE", managerEng, 
                "91000000" + (i < 10 ? "0" + i : i));
            
            // Force Team Assignment for Visibility
            if (i < 6) staff.setTeam(teamAlpha);
            else if (i < 12) staff.setTeam(teamBeta);
            else if (i < 18) staff.setTeam(teamGamma);
            else staff.setTeam(teamZeta);
            
            allEmployees.add(employeeRepository.save(staff));
        }

        // 4. Attendance History (Last 30 Days)
        log.info("Seeding 30 days of attendance history...");
        LocalDate today = LocalDate.now();
        for (Employee e : allEmployees) {
            for (int d = 0; d < 30; d++) {
                LocalDate date = today.minusDays(d);
                if (date.getDayOfWeek().getValue() < 6) { // Weekdays
                    if (attendanceRepository.findByEmployeeIdAndDate(e.getId(), date).isEmpty()) {
                        Attendance att = new Attendance();
                        att.setEmployee(e);
                        att.setDate(date);
                        if (random.nextInt(10) > 0) { // 90% Present
                            att.setStatus(Attendance.AttendanceStatus.PRESENT);
                            att.setCheckInTime(LocalTime.of(8, 30).plusMinutes(random.nextInt(60)));
                            att.setCheckOutTime(LocalTime.of(17, 30).plusMinutes(random.nextInt(60)));
                        } else {
                            att.setStatus(Attendance.AttendanceStatus.ABSENT);
                        }
                        attendanceRepository.save(att);
                    }
                }
            }
        }

        // 5. Tasks (30 Tasks)
        log.info("Seeding 30 tasks...");
        String[] taskTitles = {
            "Database Optimization", "UI Bug Fixes", "Security Patch", "Report Generation", "Client Meeting",
            "API Documentation", "Unit Test Coverage", "Cloud Deployment", "Frontend Refactoring", "Backend Integration",
            "Performance Tuning", "Log Analysis", "Feature Roadmap", "Code Review", "Onboarding Documentation",
            "Infrastructure Scaling", "Data Migration", "UX Audit", "Mobile App Preview", "Auth Flow Debugging",
            "Newsletter Template", "Analytics Dashboard", "System Health Check", "Cache Implementation", "CI/CD Pipeline Fix",
            "Docker Image Update", "Kubernetes Config", "Redis Integration", "Elasticsearch Query Fix", "Monitoring Setup"
        };

        for (int i = 0; i < 30; i++) {
            if (!taskRepository.existsByTitle(taskTitles[i])) {
                Task t = new Task();
                t.setTitle(taskTitles[i]);
                t.setDescription("Comprehensive work on " + taskTitles[i]);
                t.setAssignedBy(managerEng);
                t.setAssignedTo(allEmployees.get(random.nextInt(allEmployees.size())));
                t.setPriority(i % 3 == 0 ? "HIGH" : (i % 3 == 1 ? "MEDIUM" : "LOW"));
                t.setStatus(i % 4 == 0 ? "COMPLETED" : (i % 4 == 1 ? "IN_PROGRESS" : "PENDING"));
                t.setDeadline(today.plusDays(random.nextInt(20) - 5));
                taskRepository.save(t);
            }
        }

        // 6. Leave Requests (15+)
        log.info("Seeding 15+ leave requests...");
        for (int i = 0; i < 20; i++) {
            Employee e = allEmployees.get(random.nextInt(allEmployees.size()));
            if (leaveRepository.findByEmployeeIdOrderByCreatedAtDesc(e.getId()).size() < 2) {
                LocalDate start = i < 3 ? today : today.plusDays(random.nextInt(30) - 15);
                LeaveRequest lr = new LeaveRequest();
                lr.setEmployee(e);
                lr.setStartDate(start);
                lr.setEndDate(start.plusDays(2));
                lr.setType(i % 2 == 0 ? "CASUAL" : "SICK");
                lr.setStatus(i < 3 ? "APPROVED" : (i % 3 == 1 ? "PENDING" : "REJECTED"));
                lr.setReason("Personal matters/Health");
                leaveRepository.save(lr);
                
                // If leave is today and approved, update attendance status
                if (i < 3) {
                    Attendance att = attendanceRepository.findByEmployeeIdAndDate(e.getId(), today)
                            .orElse(new Attendance());
                    att.setEmployee(e);
                    att.setDate(today);
                    att.setStatus(Attendance.AttendanceStatus.ON_LEAVE);
                    att.setCheckInTime(null);
                    att.setCheckOutTime(null);
                    attendanceRepository.save(att);
                }
            }
        }

        // 6a. Attendance Reset Requests (Live Activity)
        log.info("Seeding attendance reset requests...");
        for (int i = 0; i < 5; i++) {
            Employee e = allEmployees.get(10 + i);
            if (attendanceResetRequestRepository.findByEmployeeIdAndTargetDateAndStatus(e.getId(), today, "PENDING").isEmpty()) {
                AttendanceResetRequest arr = new AttendanceResetRequest();
                arr.setEmployee(e);
                arr.setTargetDate(today);
                arr.setReason("Forgot to check out yesterday / biometric glitch");
                arr.setStatus("PENDING");
                attendanceResetRequestRepository.save(arr);
            }
        }

        // 7. Payroll (Last 2 Months)
        log.info("Seeding payroll history...");
        for (Employee e : allEmployees) {
            for (int m = 1; m <= 2; m++) {
                int month = today.minusMonths(m).getMonthValue();
                int year = today.minusMonths(m).getYear();
                if (!payrollRepository.existsByEmployeeIdAndMonthAndYear(e.getId(), month, year)) {
                    Payroll p = new Payroll();
                    p.setEmployee(e);
                    p.setMonth(month);
                    p.setYear(year);
                    p.setBaseSalary(e.getSalary() / 12);
                    p.setHra(p.getBaseSalary() * 0.4);
                    p.setGrossSalary(p.getBaseSalary() + p.getHra());
                    p.setNetSalary(p.getGrossSalary() * 0.9);
                    p.setStatus("PAID");
                    p.setPaidDate(LocalDate.of(year, month, 5));
                    payrollRepository.save(p);
                }
            }
        }

        log.info("OpsFlow Seeding complete. Stable demo environment ready.");
    }

    private Employee getOrCreateEmployee(String name, String email, String username, String pass, int age, String dept, Double salary, String role, Employee manager, String mobile) {
        return employeeRepository.findByUsername(username)
                .orElseGet(() -> employeeRepository.findByEmail(email)
                .orElseGet(() -> {
                    Employee e = new Employee();
                    e.setName(name); e.setEmail(email); e.setUsername(username);
                    e.setPassword(passwordEncoder.encode(pass)); e.setAge(age); e.setDepartment(dept);
                    e.setSalary(salary); e.setRole(role); e.setManager(manager); e.setMobile(mobile);
                    return employeeRepository.save(e);
                }));
    }

    private Team getOrCreateTeam(String name, String desc, Employee manager) {
        return teamRepository.findByName(name).orElseGet(() -> {
            Team t = new Team(); t.setName(name); t.setDescription(desc); t.setManager(manager);
            return teamRepository.save(t);
        });
    }
}