package com.workforce.workforcehub.repository;

import com.workforce.workforcehub.entity.AttendanceResetRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceResetRequestRepository extends JpaRepository<AttendanceResetRequest, Long> {
    List<AttendanceResetRequest> findByStatus(String status);
    Optional<AttendanceResetRequest> findByEmployeeIdAndTargetDateAndStatus(Long employeeId, LocalDate targetDate, String status);
    void deleteByEmployeeId(Long employeeId);
}
