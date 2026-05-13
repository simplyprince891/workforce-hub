package com.workforce.workforcehub.repository;

import com.workforce.workforcehub.entity.Subtask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubtaskRepository extends JpaRepository<Subtask, Long> {
    
    List<Subtask> findByTaskId(Long taskId);
    
    List<Subtask> findByTaskIdAndIsCompleted(Long taskId, Boolean isCompleted);
    
    Long countByTaskIdAndIsCompleted(Long taskId, Boolean isCompleted);
}