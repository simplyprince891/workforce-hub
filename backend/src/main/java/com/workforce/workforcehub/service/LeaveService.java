package com.workforce.workforcehub.service;

import com.workforce.workforcehub.dto.LeaveApplicationRequest;
import com.workforce.workforcehub.dto.LeaveDto;
import com.workforce.workforcehub.entity.Employee;
import com.workforce.workforcehub.entity.LeaveRequest;
import com.workforce.workforcehub.repository.EmployeeRepository;
import com.workforce.workforcehub.repository.LeaveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaveService {
    
    private final LeaveRepository leaveRepository;
    private final EmployeeRepository employeeRepository;
    
    @Transactional
    public LeaveDto applyForLeave(LeaveApplicationRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));
                
        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new RuntimeException("Start date cannot be after end date");
        }
        
        LeaveRequest leave = new LeaveRequest();
        leave.setEmployee(employee);
        leave.setStartDate(request.getStartDate());
        leave.setEndDate(request.getEndDate());
        leave.setType(request.getType());
        leave.setReason(request.getReason());
        leave.setStatus("PENDING");
        
        LeaveRequest saved = leaveRepository.save(leave);
        return mapToDto(saved);
    }
    
    public List<LeaveDto> getLeavesByEmployee(Long employeeId) {
        return leaveRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }
    
    public List<LeaveDto> getAllLeaves() {
        return leaveRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }
    
    public List<LeaveDto> getPendingLeaves() {
        return leaveRepository.findByStatusOrderByCreatedAtDesc("PENDING")
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }
    
    @Transactional
    public LeaveDto updateLeaveStatus(Long id, String status, String remarks) {
        LeaveRequest leave = leaveRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
                
        leave.setStatus(status);
        if (remarks != null) {
            leave.setAdminRemarks(remarks);
        }
        
        return mapToDto(leaveRepository.save(leave));
    }
    
    public java.util.Map<String, Long> getLeaveSummary() {
        java.util.Map<String, Long> summary = new java.util.HashMap<>();
        List<LeaveRequest> allLeaves = leaveRepository.findAll();
        
        long pending = allLeaves.stream().filter(l -> "PENDING".equals(l.getStatus())).count();
        long approved = allLeaves.stream().filter(l -> "APPROVED".equals(l.getStatus())).count();
        long rejected = allLeaves.stream().filter(l -> "REJECTED".equals(l.getStatus())).count();
        
        summary.put("pending", pending);
        summary.put("approved", approved);
        summary.put("rejected", rejected);
        summary.put("total", (long) allLeaves.size());
        
        return summary;
    }
    
    private LeaveDto mapToDto(LeaveRequest leave) {
        LeaveDto dto = new LeaveDto();
        dto.setId(leave.getId());
        dto.setEmployeeId(leave.getEmployee().getId());
        dto.setEmployeeName(leave.getEmployee().getName());
        dto.setDepartment(leave.getEmployee().getDepartment());
        dto.setStartDate(leave.getStartDate());
        dto.setEndDate(leave.getEndDate());
        dto.setType(leave.getType());
        dto.setStatus(leave.getStatus());
        dto.setReason(leave.getReason());
        dto.setAdminRemarks(leave.getAdminRemarks());
        
        long days = ChronoUnit.DAYS.between(leave.getStartDate(), leave.getEndDate()) + 1;
        dto.setDays(days);
        dto.setCreatedAt(leave.getCreatedAt() != null ? leave.getCreatedAt().toString() : null);
        return dto;
    }

    @Transactional
    public void withdrawLeave(Long id) {
        LeaveRequest leave = leaveRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        leaveRepository.delete(leave);
    }
}
