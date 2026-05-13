package com.workforce.workforcehub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubtaskResponse {
    private Long id;
    private Long taskId;
    private String title;
    private Boolean isCompleted;
    private String notes;
    private LocalDateTime createdAt;
}