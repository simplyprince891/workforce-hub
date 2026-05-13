package com.workforce.workforcehub.controller;

import com.workforce.workforcehub.service.ExportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/export")
@RequiredArgsConstructor
@Tag(name = "Export", description = "Export APIs")
public class ExportController {
    
    private final ExportService exportService;
    
    @GetMapping("/employees/pdf")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "Export employees to PDF")
    public ResponseEntity<byte[]> exportEmployeesPdf() throws Exception {
        byte[] pdfBytes = exportService.exportEmployeesToPdf();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "employees.pdf");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }
    
    @GetMapping("/tasks/pdf")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('TEAM_LEAD')")
    @Operation(summary = "Export tasks to PDF")
    public ResponseEntity<byte[]> exportTasksPdf() throws Exception {
        byte[] pdfBytes = exportService.exportTasksToPdf();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "tasks.pdf");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }
    
    @GetMapping("/employees/excel")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "Export employees to Excel")
    public ResponseEntity<byte[]> exportEmployeesExcel() throws Exception {
        byte[] excelBytes = exportService.exportEmployeesToExcel();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "employees.xlsx");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(excelBytes);
    }
    
    @GetMapping("/tasks/excel")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('TEAM_LEAD')")
    @Operation(summary = "Export tasks to Excel")
    public ResponseEntity<byte[]> exportTasksExcel() throws Exception {
        byte[] excelBytes = exportService.exportTasksToExcel();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "tasks.xlsx");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(excelBytes);
    }
}