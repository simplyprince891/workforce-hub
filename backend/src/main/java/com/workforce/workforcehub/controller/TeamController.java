package com.workforce.workforcehub.controller;

import com.workforce.workforcehub.entity.Team;
import com.workforce.workforcehub.service.TeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TeamController {
    
    private final TeamService teamService;
    
    @GetMapping
    public ResponseEntity<List<TeamDto>> getAllTeams() {
        return ResponseEntity.ok(teamService.getAllTeams().stream().map(t -> new TeamDto(
            t.getId(), 
            t.getName(), 
            t.getDescription(), 
            t.getManager() != null ? t.getManager().getName() : "N/A",
            t.getManager() != null ? t.getManager().getId() : null
        )).collect(Collectors.toList()));
    }

    @PostMapping
    public ResponseEntity<Team> createTeam(@RequestBody Team team, @RequestParam(required = false) Long managerId) {
        return ResponseEntity.ok(teamService.createTeam(team, managerId));
    }

    @PostMapping("/{teamId}/members/{employeeId}")
    public ResponseEntity<Void> addMember(@PathVariable Long teamId, @PathVariable Long employeeId) {
        teamService.addMember(teamId, employeeId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{teamId}/members/{employeeId}")
    public ResponseEntity<Void> removeMember(@PathVariable Long teamId, @PathVariable Long employeeId) {
        teamService.removeMember(teamId, employeeId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{teamId}")
    public ResponseEntity<Void> deleteTeam(@PathVariable Long teamId) {
        teamService.deleteTeam(teamId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{teamId}/members")
    public ResponseEntity<List<EmployeeSimpleDto>> getTeamMembers(@PathVariable Long teamId) {
        return ResponseEntity.ok(teamService.getTeamMembers(teamId).stream()
            .map(e -> new EmployeeSimpleDto(e.getId(), e.getName(), e.getRole(), e.getDepartment()))
            .collect(Collectors.toList()));
    }
    
    public record TeamDto(Long id, String name, String description, String managerName, Long managerId) {}
    public record EmployeeSimpleDto(Long id, String name, String role, String department) {}
}
