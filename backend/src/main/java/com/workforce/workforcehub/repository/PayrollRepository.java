package com.workforce.workforcehub.repository;

import com.workforce.workforcehub.entity.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PayrollRepository extends JpaRepository<Payroll, Long> {
    
    List<Payroll> findByEmployeeIdOrderByYearDescMonthDesc(Long employeeId);
    
    List<Payroll> findByMonthAndYearOrderByEmployeeNameAsc(Integer month, Integer year);
    
    boolean existsByEmployeeIdAndMonthAndYear(Long employeeId, Integer month, Integer year);
    
    @Query("SELECT p FROM Payroll p WHERE p.month = :month AND p.year = :year AND p.status = :status")
    List<Payroll> findByMonthAndYearAndStatus(@Param("month") Integer month, @Param("year") Integer year, @Param("status") String status);
    
    @Query("SELECT COALESCE(SUM(p.netSalary), 0) FROM Payroll p WHERE p.month = :month AND p.year = :year")
    Double getTotalPayrollForMonth(@Param("month") Integer month, @Param("year") Integer year);
    
    void deleteByEmployeeId(Long employeeId);
}
