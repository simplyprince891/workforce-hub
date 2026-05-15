package com.workforce.workforcehub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskCommentResponse {
    private Long id;
    private Long taskId;
    private Long authorId;
    private String authorName;
    private String authorRole;
    private String content;
    private String createdAt;
}
