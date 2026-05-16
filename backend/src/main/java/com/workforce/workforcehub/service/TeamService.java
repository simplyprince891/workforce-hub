package com.workforce.workforcehub.service;

import com.workforce.workforcehub.entity.Employee;
import com.workforce.workforcehub.entity.Team;
import com.workforce.workforcehub.repository.EmployeeRepository;
import com.workforce.workforcehub.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeamService {
    
    private final TeamRepository teamRepository;
    private final EmployeeRepository employeeRepository;
    
    public List<Team> getAllTeams() {
        return teamRepository.findAll();
    }
    
    @Transactional
    public Team createTeam(Team team, Long managerId) {
        if (managerId != null) {
            Employee manager = employeeRepository.findById(managerId)
                    .orElseThrow(() -> new RuntimeException("Manager not found"));
            team.setManager(manager);
        }
        return teamRepository.save(team);
    }
    
    @Transactional
    public void addMember(Long teamId, Long employeeId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        employee.setTeam(team);
        employeeRepository.save(employee);
    }

    @Transactional
    public void removeMember(Long teamId, Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        // Ensure employee is actually in this team before removing
        if (employee.getTeam() != null && employee.getTeam().getId().equals(teamId)) {
            employee.setTeam(null);
            employeeRepository.save(employee);
        }
    }

    @Transactional
    public void deleteTeam(Long teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));
        
        // Unassign all members first
        List<Employee> members = employeeRepository.findByTeamId(teamId);
        for (Employee member : members) {
            member.setTeam(null);
            employeeRepository.save(member);
        }
        
        teamRepository.delete(team);
    }

    public List<Employee> getTeamMembers(Long teamId) {
        return employeeRepository.findByTeamId(teamId);
    }
}
