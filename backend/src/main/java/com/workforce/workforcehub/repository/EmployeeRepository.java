package com.workforce.workforcehub.repository;

import com.workforce.workforcehub.entity.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    
    Optional<Employee> findByUsername(String username);
    
    Optional<Employee> findByEmail(String email);
    
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);
    
    @Query("SELECT e FROM Employee e WHERE " +
           "(:name IS NULL OR :name = '' OR LOWER(e.name) LIKE LOWER(CONCAT('%', CAST(:name AS text), '%'))) AND " +
           "(:email IS NULL OR :email = '' OR LOWER(e.email) LIKE LOWER(CONCAT('%', CAST(:email AS text), '%')))")
    Page<Employee> searchByNameOrEmail(@Param("name") String name, @Param("email") String email, Pageable pageable);
    
    @Query("SELECT e FROM Employee e WHERE e.department = :department")
    Page<Employee> findByDepartment(@Param("department") String department, Pageable pageable);
    
    @Query("SELECT e FROM Employee e WHERE e.salary >= :minSalary AND e.salary <= :maxSalary")
    Page<Employee> findBySalaryRange(@Param("minSalary") Double minSalary, @Param("maxSalary") Double maxSalary, Pageable pageable);
    
    @Query("SELECT e FROM Employee e WHERE e.manager.id = :managerId")
    List<Employee> findByManagerId(@Param("managerId") Long managerId);
    
    List<Employee> findByRole(String role);
    
    List<Employee> findByDepartment(String department);
    
    @Query("SELECT DISTINCT e.department FROM Employee e")
    List<String> findAllDepartments();

    List<Employee> findByTeamId(Long teamId);
}