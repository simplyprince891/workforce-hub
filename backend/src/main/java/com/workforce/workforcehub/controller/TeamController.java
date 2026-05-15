package com.workforce.workforcehub.controller;

import com.workforce.workforcehub.entity.Team;
import com.workforce.workforcehub.repository.TeamRepository;
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
    
    private final TeamRepository teamRepository;
    
    @GetMapping
    public ResponseEntity<List<TeamDto>> getAllTeams() {
        return ResponseEntity.ok(teamRepository.findAll().stream().map(t -> new TeamDto(
            t.getId(), 
            t.getName(), 
            t.getDescription(), 
            t.getManager() != null ? t.getManager().getName() : "N/A"
        )).collect(Collectors.toList()));
    }
    
    public record TeamDto(Long id, String name, String description, String managerName) {}
}
