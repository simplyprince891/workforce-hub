package com.workforce.workforcehub.dto;

import lombok.Data;

@Data
public class TaskCommentRequest {
    private Long taskId;
    private Long authorId;
    private String content;
}
