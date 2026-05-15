package com.workforce.workforcehub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponse {
    private Long id;
    private String title;
    private String description;
    private Long assignedById;
    private String assignedByName;
    private Long assignedToId;
    private String assignedToName;
    private String priority;
    private String status;
    private LocalDate deadline;
    private LocalDateTime createdAt;
    private List<SubtaskResponse> subtasks;
    private List<TaskCommentResponse> comments;
}