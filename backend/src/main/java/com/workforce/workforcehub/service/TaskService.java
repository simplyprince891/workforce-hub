package com.workforce.workforcehub.service;

import com.workforce.workforcehub.dto.*;
import com.workforce.workforcehub.entity.Employee;
import com.workforce.workforcehub.entity.Subtask;
import com.workforce.workforcehub.entity.Task;
import com.workforce.workforcehub.entity.TaskComment;
import com.workforce.workforcehub.repository.EmployeeRepository;
import com.workforce.workforcehub.repository.SubtaskRepository;
import com.workforce.workforcehub.repository.TaskCommentRepository;
import com.workforce.workforcehub.repository.TaskRepository;
import com.workforce.workforcehub.entity.Team;
import com.workforce.workforcehub.repository.TeamRepository;
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
    private final TaskCommentRepository taskCommentRepository;
    private final EmployeeRepository employeeRepository;
    private final TeamRepository teamRepository;
    
    @Transactional
    public TaskResponse createTask(TaskRequest request) {
        Task task = new Task();
        updateTaskFromRequest(task, request);
        
        Employee assignedBy = employeeRepository.findById(request.getAssignedById())
                .orElseThrow(() -> new RuntimeException("Assigned by employee not found"));
        task.setAssignedBy(assignedBy);
        
        if (request.getTeamId() != null) {
            Team team = teamRepository.findById(request.getTeamId())
                    .orElseThrow(() -> new RuntimeException("Team not found"));
            task.setTeam(team);
        } else if (request.getAssignedToId() != null) {
            Employee assignedTo = employeeRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new RuntimeException("Assigned to employee not found"));
            validateAssignmentHierarchy(assignedBy, assignedTo);
            task.setAssignedTo(assignedTo);
        }
        
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

        // Basic Info
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        task.setStatus(request.getStatus());
        task.setDeadline(request.getDeadline());

        // Assigner update (if admin or manager override)
        if (request.getAssignedById() != null) {
            Employee assignedBy = employeeRepository.findById(request.getAssignedById())
                    .orElseThrow(() -> new RuntimeException("Assigned by employee not found"));
            task.setAssignedBy(assignedBy);
        }

        // Dynamic Reassignment logic
        if (request.getTeamId() != null) {
            Team team = teamRepository.findById(request.getTeamId())
                    .orElseThrow(() -> new RuntimeException("Team not found"));
            task.setTeam(team);
            task.setAssignedTo(null); // Mutually exclusive
        } else if (request.getAssignedToId() != null) {
            Employee assignedTo = employeeRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new RuntimeException("Assigned to employee not found"));
            
            // Validate hierarchy for the new assignment
            if (task.getAssignedBy() != null) {
                validateAssignmentHierarchy(task.getAssignedBy(), assignedTo);
            }
            
            task.setAssignedTo(assignedTo);
            task.setTeam(null); // Mutually exclusive
        } else {
            // Unassigned task
            task.setAssignedTo(null);
            task.setTeam(null);
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
        
        Task task = saved.getTask();
        List<Subtask> allSubtasks = subtaskRepository.findByTaskId(task.getId());
        boolean allCompleted = !allSubtasks.isEmpty() && allSubtasks.stream().allMatch(Subtask::getIsCompleted);
        
        if (allCompleted && !task.getStatus().equals("DONE")) {
            task.setStatus("DONE");
            taskRepository.save(task);
        } else if (!allCompleted && task.getStatus().equals("DONE")) {
            task.setStatus("IN_PROGRESS");
            taskRepository.save(task);
        }
        
        return mapToSubtaskResponse(saved);
    }
    
    @Transactional
    public void deleteSubtask(Long id) {
        if (!subtaskRepository.existsById(id)) {
            throw new RuntimeException("Subtask not found");
        }
        subtaskRepository.deleteById(id);
    }
    
    @Transactional
    public TaskCommentResponse addComment(com.workforce.workforcehub.dto.TaskCommentRequest request) {
        Task task = taskRepository.findById(request.getTaskId())
                .orElseThrow(() -> new RuntimeException("Task not found"));
        Employee author = employeeRepository.findById(request.getAuthorId())
                .orElseThrow(() -> new RuntimeException("Author not found"));
                
        TaskComment comment = new TaskComment();
        comment.setTask(task);
        comment.setAuthor(author);
        comment.setContent(request.getContent());
        
        return mapToCommentResponse(taskCommentRepository.save(comment));
    }
    
    @Transactional
    public void deleteComment(Long id) {
        if (!taskCommentRepository.existsById(id)) {
            throw new RuntimeException("Comment not found");
        }
        taskCommentRepository.deleteById(id);
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
                
        List<TaskCommentResponse> comments = taskCommentRepository.findByTaskIdOrderByCreatedAtDesc(task.getId()).stream()
                .map(this::mapToCommentResponse)
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
                task.getTeam() != null ? task.getTeam().getId() : null,
                task.getTeam() != null ? task.getTeam().getName() : null,
                subtasks,
                comments
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
    
    private TaskCommentResponse mapToCommentResponse(TaskComment comment) {
        return new TaskCommentResponse(
                comment.getId(),
                comment.getTask().getId(),
                comment.getAuthor().getId(),
                comment.getAuthor().getName(),
                comment.getAuthor().getRole(),
                comment.getContent(),
                comment.getCreatedAt() != null ? comment.getCreatedAt().toString() : null
        );
    }
    private void validateAssignmentHierarchy(Employee assignedBy, Employee assignedTo) {
        String byRole = assignedBy.getRole();
        String toRole = assignedTo.getRole();
        
        if (byRole.equals("ADMIN")) return;
        
        if (byRole.equals("MANAGER")) {
            if (toRole.equals("ADMIN") || toRole.equals("MANAGER")) {
                throw new RuntimeException("Managers can only assign tasks to Team Leads and Employees");
            }
            return;
        }
        
        if (byRole.equals("TEAM_LEAD")) {
            if (!toRole.equals("EMPLOYEE")) {
                throw new RuntimeException("Team Leads can only assign tasks to Employees");
            }
            return;
        }
        
        throw new RuntimeException("Only Admins, Managers, and Team Leads can assign tasks");
    }
}