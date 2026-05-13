package com.workforce.workforcehub.repository;

import com.workforce.workforcehub.entity.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    
    List<Task> findByAssignedToId(Long employeeId);
    
    List<Task> findByAssignedById(Long managerId);
    
    Page<Task> findByAssignedToId(Long employeeId, Pageable pageable);
    
    Page<Task> findByAssignedById(Long managerId, Pageable pageable);
    
    @Query("SELECT t FROM Task t WHERE t.assignedTo.id = :employeeId AND t.status = :status")
    List<Task> findByEmployeeIdAndStatus(@Param("employeeId") Long employeeId, @Param("status") String status);
    
    @Query("SELECT t FROM Task t WHERE t.priority = :priority")
    List<Task> findByPriority(@Param("priority") String priority);
    
    @Query("SELECT COUNT(t) FROM Task t WHERE t.assignedTo.id = :employeeId")
    Long countTasksByEmployeeId(@Param("employeeId") Long employeeId);
    
    @Query("SELECT COUNT(t) FROM Task t WHERE t.assignedTo.id = :employeeId AND t.status = :status")
    Long countTasksByEmployeeIdAndStatus(@Param("employeeId") Long employeeId, @Param("status") String status);
    
    @Query("SELECT COUNT(t) FROM Task t WHERE t.assignedBy.id = :managerId")
    Long countTasksByManagerId(@Param("managerId") Long managerId);
}