package com.workforce.workforcehub.controller;

import com.workforce.workforcehub.dto.LeaveApplicationRequest;
import com.workforce.workforcehub.dto.LeaveDto;
import com.workforce.workforcehub.service.LeaveService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
@RequiredArgsConstructor
@Tag(name = "Leaves", description = "Leave Management APIs")
public class LeaveController {
    
    private final LeaveService leaveService;
    
    @PostMapping
    @Operation(summary = "Apply for leave")
    public ResponseEntity<LeaveDto> applyForLeave(@RequestBody LeaveApplicationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(leaveService.applyForLeave(request));
    }
    
    @GetMapping("/employee/{employeeId}")
    @Operation(summary = "Get leaves by employee ID")
    public ResponseEntity<List<LeaveDto>> getLeavesByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(leaveService.getLeavesByEmployee(employeeId));
    }
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all leaves")
    public ResponseEntity<List<LeaveDto>> getAllLeaves() {
        return ResponseEntity.ok(leaveService.getAllLeaves());
    }
    
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get pending leave requests")
    public ResponseEntity<List<LeaveDto>> getPendingLeaves() {
        return ResponseEntity.ok(leaveService.getPendingLeaves());
    }
    
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Approve or reject a leave request")
    public ResponseEntity<LeaveDto> updateLeaveStatus(
            @PathVariable Long id, 
            @RequestParam String status, 
            @RequestParam(required = false) String remarks) {
        return ResponseEntity.ok(leaveService.updateLeaveStatus(id, status, remarks));
    }
    
    @GetMapping("/summary")
    @Operation(summary = "Get leave summary statistics")
    public ResponseEntity<java.util.Map<String, Long>> getLeaveSummary() {
        return ResponseEntity.ok(leaveService.getLeaveSummary());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Withdraw a leave request")
    public ResponseEntity<Void> withdrawLeave(@PathVariable Long id) {
        leaveService.withdrawLeave(id);
        return ResponseEntity.noContent().build();
    }
}
