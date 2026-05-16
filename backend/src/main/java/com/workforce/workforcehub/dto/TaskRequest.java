package com.workforce.workforcehub.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskRequest {
    
    private Long id;
    
    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;
    
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;
    
    private Long assignedById;
    
    private Long assignedToId;
    
    @NotBlank(message = "Priority is required")
    private String priority;
    
    private String status;
    
    @NotNull(message = "Deadline is required")
    private LocalDate deadline;
    
    private Long teamId;
}