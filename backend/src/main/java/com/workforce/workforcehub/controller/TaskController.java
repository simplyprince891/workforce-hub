package com.workforce.workforcehub.controller;

import com.workforce.workforcehub.dto.*;
import com.workforce.workforcehub.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@Tag(name = "Tasks", description = "Task Management APIs")
public class TaskController {
    
    private final TaskService taskService;
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "Create a new task")
    public ResponseEntity<TaskResponse> createTask(@Valid @RequestBody TaskRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.createTask(request));
    }
    
    @GetMapping
    @Operation(summary = "Get all tasks with pagination")
    public ResponseEntity<PagedResponse<TaskResponse>> getAllTasks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(taskService.getAllTasks(page, size));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get task by ID")
    public ResponseEntity<TaskResponse> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "Update task")
    public ResponseEntity<TaskResponse> updateTask(@PathVariable Long id, @Valid @RequestBody TaskRequest request) {
        return ResponseEntity.ok(taskService.updateTask(id, request));
    }
    
    @PatchMapping("/{id}/status")
    @Operation(summary = "Update task status")
    public ResponseEntity<TaskResponse> updateTaskStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(taskService.updateTaskStatus(id, status));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "Delete task")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/employee/{employeeId}")
    @Operation(summary = "Get tasks by employee")
    public ResponseEntity<List<TaskResponse>> getTasksByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(taskService.getTasksByEmployee(employeeId));
    }
    
    @GetMapping("/manager/{managerId}")
    @Operation(summary = "Get tasks by manager")
    public ResponseEntity<List<TaskResponse>> getTasksByManager(@PathVariable Long managerId) {
        return ResponseEntity.ok(taskService.getTasksByManager(managerId));
    }
    
    @PostMapping("/subtasks")
    @Operation(summary = "Add a subtask")
    public ResponseEntity<SubtaskResponse> addSubtask(@Valid @RequestBody SubtaskRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.addSubtask(request));
    }
    
    @PutMapping("/subtasks/{id}")
    @Operation(summary = "Update subtask")
    public ResponseEntity<SubtaskResponse> updateSubtask(@PathVariable Long id, @Valid @RequestBody SubtaskRequest request) {
        return ResponseEntity.ok(taskService.updateSubtask(id, request));
    }
    
    @PatchMapping("/subtasks/{id}/toggle")
    @Operation(summary = "Toggle subtask completion")
    public ResponseEntity<SubtaskResponse> toggleSubtaskCompletion(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.toggleSubtaskCompletion(id));
    }
    
    @DeleteMapping("/subtasks/{id}")
    @Operation(summary = "Delete subtask")
    public ResponseEntity<Void> deleteSubtask(@PathVariable Long id) {
        taskService.deleteSubtask(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/employee/{employeeId}/count")
    @Operation(summary = "Count tasks by employee")
    public ResponseEntity<Long> countTasksByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(taskService.countTasksByEmployee(employeeId));
    }
    
    @GetMapping("/employee/{employeeId}/count/status")
    @Operation(summary = "Count tasks by employee and status")
    public ResponseEntity<Long> countTasksByEmployeeAndStatus(
            @PathVariable Long employeeId, 
            @RequestParam String status) {
        return ResponseEntity.ok(taskService.countTasksByEmployeeAndStatus(employeeId, status));
    }
}