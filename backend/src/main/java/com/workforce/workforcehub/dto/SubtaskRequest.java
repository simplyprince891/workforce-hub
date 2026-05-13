package com.workforce.workforcehub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubtaskRequest {
    
    private Long id;
    
    private Long taskId;
    
    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;
    
    private Boolean isCompleted;
    
    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;
}