package com.workforce.workforcehub.service;

import com.workforce.workforcehub.dto.*;
import com.workforce.workforcehub.entity.Employee;
import com.workforce.workforcehub.entity.Subtask;
import com.workforce.workforcehub.entity.Task;
import com.workforce.workforcehub.repository.EmployeeRepository;
import com.workforce.workforcehub.repository.SubtaskRepository;
import com.workforce.workforcehub.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {
    
    private final TaskRepository taskRepository;
    private final SubtaskRepository subtaskRepository;
    private final EmployeeRepository employeeRepository;
    
    @Transactional
    public TaskResponse createTask(TaskRequest request) {
        Task task = new Task();
        updateTaskFromRequest(task, request);
        
        Employee assignedBy = employeeRepository.findById(request.getAssignedById())
                .orElseThrow(() -> new RuntimeException("Assigned by employee not found"));
        task.setAssignedBy(assignedBy);
        
        Employee assignedTo = employeeRepository.findById(request.getAssignedToId())
                .orElseThrow(() -> new RuntimeException("Assigned to employee not found"));
        task.setAssignedTo(assignedTo);
        
        if (task.getStatus() == null) {
            task.setStatus("PENDING");
        }
        
        Task saved = taskRepository.save(task);
        return mapToResponse(saved);
    }
    
    @Transactional
    public TaskResponse updateTask(Long id, TaskRequest request) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        
        updateTaskFromRequest(task, request);
        
        if (request.getAssignedById() != null) {
            Employee assignedBy = employeeRepository.findById(request.getAssignedById())
                    .orElseThrow(() -> new RuntimeException("Assigned by employee not found"));
            task.setAssignedBy(assignedBy);
        }
        
        if (request.getAssignedToId() != null) {
            Employee assignedTo = employeeRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new RuntimeException("Assigned to employee not found"));
            task.setAssignedTo(assignedTo);
        }
        
        Task saved = taskRepository.save(task);
        return mapToResponse(saved);
    }
    
    @Transactional
    public TaskResponse updateTaskStatus(Long id, String status) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        
        task.setStatus(status);
        Task saved = taskRepository.save(task);
        return mapToResponse(saved);
    }
    
    public TaskResponse getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        return mapToResponse(task);
    }
    
    public PagedResponse<TaskResponse> getAllTasks(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Task> taskPage = taskRepository.findAll(pageable);
        
        return new PagedResponse<>(
                taskPage.getContent().stream().map(this::mapToResponse).collect(Collectors.toList()),
                taskPage.getNumber(),
                taskPage.getSize(),
                taskPage.getTotalElements(),
                taskPage.getTotalPages(),
                taskPage.isLast()
        );
    }
    
    public List<TaskResponse> getTasksByEmployee(Long employeeId) {
        return taskRepository.findByAssignedToId(employeeId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public List<TaskResponse> getTasksByManager(Long managerId) {
        return taskRepository.findByAssignedById(managerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public void deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new RuntimeException("Task not found");
        }
        taskRepository.deleteById(id);
    }
    
    @Transactional
    public SubtaskResponse addSubtask(SubtaskRequest request) {
        Task task = taskRepository.findById(request.getTaskId())
                .orElseThrow(() -> new RuntimeException("Task not found"));
        
        Subtask subtask = new Subtask();
        subtask.setTask(task);
        subtask.setTitle(request.getTitle());
        subtask.setIsCompleted(request.getIsCompleted() != null ? request.getIsCompleted() : false);
        subtask.setNotes(request.getNotes());
        
        Subtask saved = subtaskRepository.save(subtask);
        return mapToSubtaskResponse(saved);
    }
    
    @Transactional
    public SubtaskResponse updateSubtask(Long id, SubtaskRequest request) {
        Subtask subtask = subtaskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subtask not found"));
        
        if (request.getTitle() != null) {
            subtask.setTitle(request.getTitle());
        }
        if (request.getIsCompleted() != null) {
            subtask.setIsCompleted(request.getIsCompleted());
        }
        if (request.getNotes() != null) {
            subtask.setNotes(request.getNotes());
        }
        
        Subtask saved = subtaskRepository.save(subtask);
        return mapToSubtaskResponse(saved);
    }
    
    @Transactional
    public SubtaskResponse toggleSubtaskCompletion(Long id) {
        Subtask subtask = subtaskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subtask not found"));
        
        subtask.setIsCompleted(!subtask.getIsCompleted());
        Subtask saved = subtaskRepository.save(subtask);
        return mapToSubtaskResponse(saved);
    }
    
    @Transactional
    public void deleteSubtask(Long id) {
        if (!subtaskRepository.existsById(id)) {
            throw new RuntimeException("Subtask not found");
        }
        subtaskRepository.deleteById(id);
    }
    
    public Long countTasksByEmployee(Long employeeId) {
        return taskRepository.countTasksByEmployeeId(employeeId);
    }
    
    public Long countTasksByEmployeeAndStatus(Long employeeId, String status) {
        return taskRepository.countTasksByEmployeeIdAndStatus(employeeId, status);
    }
    
    private void updateTaskFromRequest(Task task, TaskRequest request) {
        if (request.getTitle() != null) {
            task.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }
        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        }
        if (request.getDeadline() != null) {
            task.setDeadline(request.getDeadline());
        }
    }
    
    private TaskResponse mapToResponse(Task task) {
        List<SubtaskResponse> subtasks = subtaskRepository.findByTaskId(task.getId()).stream()
                .map(this::mapToSubtaskResponse)
                .collect(Collectors.toList());
        
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getAssignedBy() != null ? task.getAssignedBy().getId() : null,
                task.getAssignedByName(),
                task.getAssignedTo() != null ? task.getAssignedTo().getId() : null,
                task.getAssignedToName(),
                task.getPriority(),
                task.getStatus(),
                task.getDeadline(),
                task.getCreatedAt(),
                subtasks
        );
    }
    
    private SubtaskResponse mapToSubtaskResponse(Subtask subtask) {
        return new SubtaskResponse(
                subtask.getId(),
                subtask.getTask().getId(),
                subtask.getTitle(),
                subtask.getIsCompleted(),
                subtask.getNotes(),
                subtask.getCreatedAt()
        );
    }
}