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
        log.info("Starting OpsFlow Data Synchronization...");
        
        // 1. Roles/Users (Persistent)
        Employee admin = getOrCreateEmployee("Admin User", "admin@workforce.com", "admin", "admin123", 35, "Management", 1200000.0, "ADMIN", null, "9876543210");
        Employee managerEng = getOrCreateEmployee("David Miller", "david@workforce.com", "david", "david123", 40, "Engineering", 950000.0, "MANAGER", admin, "9876543211");
        Employee managerHR = getOrCreateEmployee("Sarah Parker", "sarah@workforce.com", "sarah", "sarah123", 38, "Human Resources", 850000.0, "MANAGER", admin, "9876543212");
        Employee leadFrontend = getOrCreateEmployee("Alice Chen", "alice@workforce.com", "alice", "alice123", 32, "Frontend", 800000.0, "TEAM_LEAD", managerEng, "9876543215");
        Employee leadBackend = getOrCreateEmployee("Bob Smith", "bob@workforce.com", "bob", "bob123", 34, "Backend", 820000.0, "TEAM_LEAD", managerEng, "9876543216");
        Employee leadDesign = getOrCreateEmployee("Pam Beesly", "pam@workforce.com", "pam", "pam123", 28, "Design", 750000.0, "TEAM_LEAD", managerEng, "9876543217");

        // 2. Teams (Persistent)
        Team teamAlpha = getOrCreateTeam("Team Alpha", "Backend Core Services", leadBackend);
        Team teamBeta = getOrCreateTeam("Team Beta", "Frontend Experience", leadFrontend);
        Team teamGamma = getOrCreateTeam("Team Gamma", "Product Marketing", managerHR);
        Team teamZeta = getOrCreateTeam("Team Zeta", "UI/UX Design", leadDesign);

        // 3. Staff Synchronization (FORCED TEAM ASSIGNMENT)
        log.info("Syncing staff member team assignments...");
        String[] firstNames = {"James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen"};
        String[] lastNames = {"Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"};

        for (int i = 0; i < 20; i++) {
            final int index = i;
            String uName = "staff" + (i + 1);
            String fullName = firstNames[i] + " " + lastNames[i];
            
            Employee staff = employeeRepository.findByUsername(uName).orElseGet(() -> {
                Employee e = new Employee();
                e.setUsername(uName);
                e.setPassword(passwordEncoder.encode("password123"));
                e.setEmail(uName + "@workforce.com");
                e.setAge(22 + (new Random().nextInt(15)));
                e.setDepartment("Engineering");
                e.setSalary(450000.0 + (new Random().nextInt(50000)));
                e.setRole("EMPLOYEE");
                e.setManager(managerEng);
                e.setMobile("90000000" + (index < 10 ? "0" + index : index));
                return e;
            });
            
            // ALWAYS Update Name and Team (Force Visibility)
            staff.setName(fullName);
            if (i < 5) staff.setTeam(teamAlpha);
            else if (i < 10) staff.setTeam(teamBeta);
            else if (i < 15) staff.setTeam(teamGamma);
            else staff.setTeam(teamZeta);
            
            employeeRepository.save(staff);
        }

        // 4. Live Attendance (Today Only)
        log.info("Ensuring live attendance data for today...");
        LocalDate today = LocalDate.now();
        if (attendanceRepository.findByDate(today).size() < 10) {
            List<Employee> allEmployees = employeeRepository.findAll();
            for (int i = 0; i < 15; i++) {
                Employee e = allEmployees.get(i);
                if (attendanceRepository.findByEmployeeIdAndDate(e.getId(), today).isEmpty()) {
                    Attendance att = new Attendance();
                    att.setEmployee(e);
                    att.setDate(today);
                    att.setStatus(Attendance.AttendanceStatus.PRESENT);
                    att.setCheckInTime(LocalTime.of(8, 30).plusMinutes(new Random().nextInt(60)));
                    // Set check-out if it's already late in the day to show work hours
                    if (LocalTime.now().isAfter(LocalTime.of(17, 0))) {
                        att.setCheckOutTime(LocalTime.of(17, 30).plusMinutes(new Random().nextInt(60)));
                    }
                    attendanceRepository.save(att);
                }
            }
        }

        // 5. Tasks & Comments (FORCED VISIBILITY)
        log.info("Ensuring task and comment data...");
        Employee alice = employeeRepository.findByUsername("alice").orElse(null);
        Employee bob = employeeRepository.findByUsername("bob").orElse(null);
        Employee staff1 = employeeRepository.findByUsername("staff1").orElse(null);
        
        if (alice != null && staff1 != null && !taskRepository.existsByTitle("Migrate Database to PostgreSQL")) {
            Task t1 = new Task();
            t1.setTitle("Migrate Database to PostgreSQL");
            t1.setDescription("Upgrade from SQLite to PostgreSQL production instance.");
            t1.setAssignedBy(alice);
            t1.setAssignedTo(staff1);
            t1.setPriority("HIGH");
            t1.setStatus("IN_PROGRESS");
            t1.setDeadline(LocalDate.now().plusDays(7));
            Task savedT1 = taskRepository.save(t1);

            // Add Subtasks
            Subtask s1 = new Subtask();
            s1.setTask(savedT1); s1.setTitle("Export SQLite Data"); s1.setIsCompleted(true);
            subtaskRepository.save(s1);

            // Add Comments
            TaskComment c1 = new TaskComment();
            c1.setTask(savedT1); c1.setAuthor(alice);
            c1.setContent("Please ensure the data integrity check is performed before migration.");
            taskCommentRepository.save(c1);

            TaskComment c2 = new TaskComment();
            c2.setTask(savedT1); c2.setAuthor(staff1);
            c2.setContent("Working on it. Export completed successfully.");
            taskCommentRepository.save(c2);
            
            // USER REQUESTED COMMENT
            TaskComment cUser = new TaskComment();
            cUser.setTask(savedT1); cUser.setAuthor(admin);
            cUser.setContent("System Note: User message confirmed and permanently saved in conversation hub.");
            taskCommentRepository.save(cUser);
        }

        if (bob != null && managerEng != null && !taskRepository.existsByTitle("Security Audit 2024")) {
            Task t2 = new Task();
            t2.setTitle("Security Audit 2024");
            t2.setDescription("Perform full JWT and RBAC audit.");
            t2.setAssignedBy(managerEng);
            t2.setAssignedTo(bob);
            t2.setPriority("MEDIUM");
            t2.setStatus("PENDING");
            t2.setDeadline(LocalDate.now().plusDays(14));
            Task savedT2 = taskRepository.save(t2);

            TaskComment c3 = new TaskComment();
            c3.setTask(savedT2); c3.setAuthor(managerEng);
            c3.setContent("Focus on the token expiration logic.");
            taskCommentRepository.save(c3);
        }

        log.info("OpsFlow Synchronization complete. Teams, Tasks, and Comments are now populated.");
    }

    private Employee getOrCreateEmployee(String name, String email, String username, String pass, int age, String dept, Double salary, String role, Employee manager, String mobile) {
        return employeeRepository.findByUsername(username).orElseGet(() -> {
            Employee e = new Employee();
            e.setName(name); e.setEmail(email); e.setUsername(username);
            e.setPassword(passwordEncoder.encode(pass)); e.setAge(age); e.setDepartment(dept);
            e.setSalary(salary); e.setRole(role); e.setManager(manager); e.setMobile(mobile);
            return employeeRepository.save(e);
        });
    }

    private Team getOrCreateTeam(String name, String desc, Employee manager) {
        return teamRepository.findByName(name).orElseGet(() -> {
            Team t = new Team(); t.setName(name); t.setDescription(desc); t.setManager(manager);
            return teamRepository.save(t);
        });
    }
}