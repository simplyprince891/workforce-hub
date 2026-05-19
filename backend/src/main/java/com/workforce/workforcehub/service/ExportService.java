package com.workforce.workforcehub.service;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.workforce.workforcehub.dto.EmployeeResponse;
import com.workforce.workforcehub.dto.TaskResponse;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExportService {
    
    private final EmployeeService employeeService;
    private final TaskService taskService;
    
    public byte[] exportEmployeesToPdf() throws Exception {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(outputStream);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);
        
        document.add(new Paragraph("Employee Report")
                .setFontSize(20)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER));
        document.add(new Paragraph("Generated on: " + LocalDate.now())
                .setFontSize(10)
                .setTextAlignment(TextAlignment.CENTER));
        document.add(new Paragraph("\n"));
        
        Table table = new Table(UnitValue.createPercentArray(new float[]{2, 3, 3, 2, 2, 2, 2}));
        table.setWidth(UnitValue.createPercentValue(100));
        
        String[] headers = {"ID", "Name", "Email", "Age", "Department", "Role", "Salary"};
        for (String header : headers) {
            table.addHeaderCell(new Cell()
                    .add(new Paragraph(header).setBold())
                    .setBackgroundColor(com.itextpdf.kernel.colors.ColorConstants.LIGHT_GRAY));
        }
        
        for (int page = 0; page < 100; page++) {
            var pagedResponse = employeeService.getAllEmployees(page, 100, "id", "asc");
            for (EmployeeResponse emp : pagedResponse.getContent()) {
                table.addCell(new Cell().add(new Paragraph(String.valueOf(emp.getId()))));
                table.addCell(new Cell().add(new Paragraph(emp.getName() != null ? emp.getName() : "")));
                table.addCell(new Cell().add(new Paragraph(emp.getEmail() != null ? emp.getEmail() : "")));
                table.addCell(new Cell().add(new Paragraph(String.valueOf(emp.getAge()))));
                table.addCell(new Cell().add(new Paragraph(emp.getDepartment() != null ? emp.getDepartment() : "")));
                table.addCell(new Cell().add(new Paragraph(emp.getRole() != null ? emp.getRole() : "")));
                table.addCell(new Cell().add(new Paragraph(emp.getSalary() != null ? String.valueOf(emp.getSalary()) : "")));
            }
            if (pagedResponse.isLast()) break;
        }
        
        document.add(table);
        document.close();
        
        return outputStream.toByteArray();
    }
    
    public byte[] exportTasksToPdf() throws Exception {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(outputStream);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);
        
        document.add(new Paragraph("Task Report")
                .setFontSize(20)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER));
        document.add(new Paragraph("Generated on: " + LocalDate.now())
                .setFontSize(10)
                .setTextAlignment(TextAlignment.CENTER));
        document.add(new Paragraph("\n"));
        
        Table table = new Table(UnitValue.createPercentArray(new float[]{1, 3, 2, 2, 2, 2, 2}));
        table.setWidth(UnitValue.createPercentValue(100));
        
        String[] headers = {"ID", "Title", "Assigned To", "Priority", "Status", "Deadline", "Created"};
        for (String header : headers) {
            table.addHeaderCell(new Cell()
                    .add(new Paragraph(header).setBold())
                    .setBackgroundColor(com.itextpdf.kernel.colors.ColorConstants.LIGHT_GRAY));
        }
        
        for (int page = 0; page < 100; page++) {
            var pagedResponse = taskService.getAllTasks(page, 100);
            for (TaskResponse task : pagedResponse.getContent()) {
                table.addCell(new Cell().add(new Paragraph(String.valueOf(task.getId()))));
                table.addCell(new Cell().add(new Paragraph(task.getTitle() != null ? task.getTitle() : "")));
                table.addCell(new Cell().add(new Paragraph(task.getAssignedToName() != null ? task.getAssignedToName() : "")));
                table.addCell(new Cell().add(new Paragraph(task.getPriority() != null ? task.getPriority() : "")));
                table.addCell(new Cell().add(new Paragraph(task.getStatus() != null ? task.getStatus() : "")));
                table.addCell(new Cell().add(new Paragraph(task.getDeadline() != null ? task.getDeadline().toString() : "")));
                table.addCell(new Cell().add(new Paragraph(task.getCreatedAt() != null ? task.getCreatedAt().toLocalDate().toString() : "")));
            }
            if (pagedResponse.isLast()) break;
        }
        
        document.add(table);
        document.close();
        
        return outputStream.toByteArray();
    }
    
    public byte[] exportEmployeesToExcel() throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Employees");
        
        CellStyle headerStyle = workbook.createCellStyle();
        org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);
        
        Row headerRow = sheet.createRow(0);
        String[] headers = {"ID", "Name", "Email", "Age", "Mobile", "Username", "Department", "Salary", "Role", "Manager"};
        
        for (int i = 0; i < headers.length; i++) {
            org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        int rowNum = 1;
        for (int page = 0; page < 100; page++) {
            var pagedResponse = employeeService.getAllEmployees(page, 100, "id", "asc");
            for (EmployeeResponse emp : pagedResponse.getContent()) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(emp.getId());
                row.createCell(1).setCellValue(emp.getName() != null ? emp.getName() : "");
                row.createCell(2).setCellValue(emp.getEmail() != null ? emp.getEmail() : "");
                row.createCell(3).setCellValue(emp.getAge());
                row.createCell(4).setCellValue(emp.getMobile() != null ? emp.getMobile() : "");
                row.createCell(5).setCellValue(emp.getUsername() != null ? emp.getUsername() : "");
                row.createCell(6).setCellValue(emp.getDepartment() != null ? emp.getDepartment() : "");
                row.createCell(7).setCellValue(emp.getSalary() != null ? emp.getSalary() : 0);
                row.createCell(8).setCellValue(emp.getRole() != null ? emp.getRole() : "");
                row.createCell(9).setCellValue(emp.getManagerName() != null ? emp.getManagerName() : "");
            }
            if (pagedResponse.isLast()) break;
        }
        
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
        
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();
        
        return outputStream.toByteArray();
    }
    
    public byte[] exportTasksToExcel() throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Tasks");
        
        CellStyle headerStyle = workbook.createCellStyle();
        org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);
        
        Row headerRow = sheet.createRow(0);
        String[] headers = {"ID", "Title", "Description", "Assigned By", "Assigned To", "Priority", "Status", "Deadline", "Created At"};
        
        for (int i = 0; i < headers.length; i++) {
            org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        int rowNum = 1;
        for (int page = 0; page < 100; page++) {
            var pagedResponse = taskService.getAllTasks(page, 100);
            for (TaskResponse task : pagedResponse.getContent()) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(task.getId());
                row.createCell(1).setCellValue(task.getTitle() != null ? task.getTitle() : "");
                row.createCell(2).setCellValue(task.getDescription() != null ? task.getDescription() : "");
                row.createCell(3).setCellValue(task.getAssignedByName() != null ? task.getAssignedByName() : "");
                row.createCell(4).setCellValue(task.getAssignedToName() != null ? task.getAssignedToName() : "");
                row.createCell(5).setCellValue(task.getPriority() != null ? task.getPriority() : "");
                row.createCell(6).setCellValue(task.getStatus() != null ? task.getStatus() : "");
                row.createCell(7).setCellValue(task.getDeadline() != null ? task.getDeadline().toString() : "");
                row.createCell(8).setCellValue(task.getCreatedAt() != null ? task.getCreatedAt().toString() : "");
            }
            if (pagedResponse.isLast()) break;
        }
        
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
        
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();
        
        return outputStream.toByteArray();
    }

    public byte[] exportEmployeesToCsv() {
        StringBuilder csv = new StringBuilder();
        csv.append("ID,Name,Email,Age,Mobile,Username,Department,Salary,Role,Manager\n");
        
        for (int page = 0; page < 100; page++) {
            var pagedResponse = employeeService.getAllEmployees(page, 100, "id", "asc");
            for (EmployeeResponse emp : pagedResponse.getContent()) {
                csv.append(emp.getId()).append(",");
                csv.append(escapeCsv(emp.getName())).append(",");
                csv.append(escapeCsv(emp.getEmail())).append(",");
                csv.append(emp.getAge()).append(",");
                csv.append(escapeCsv(emp.getMobile())).append(",");
                csv.append(escapeCsv(emp.getUsername())).append(",");
                csv.append(escapeCsv(emp.getDepartment())).append(",");
                csv.append(emp.getSalary() != null ? emp.getSalary() : 0).append(",");
                csv.append(escapeCsv(emp.getRole())).append(",");
                csv.append(escapeCsv(emp.getManagerName())).append("\n");
            }
            if (pagedResponse.isLast()) break;
        }
        return csv.toString().getBytes();
    }
    
    public byte[] exportTasksToCsv() {
        StringBuilder csv = new StringBuilder();
        csv.append("ID,Title,Description,Assigned By,Assigned To,Priority,Status,Deadline,Created At\n");
        
        for (int page = 0; page < 100; page++) {
            var pagedResponse = taskService.getAllTasks(page, 100);
            for (TaskResponse task : pagedResponse.getContent()) {
                csv.append(task.getId()).append(",");
                csv.append(escapeCsv(task.getTitle())).append(",");
                csv.append(escapeCsv(task.getDescription())).append(",");
                csv.append(escapeCsv(task.getAssignedByName())).append(",");
                csv.append(escapeCsv(task.getAssignedToName())).append(",");
                csv.append(escapeCsv(task.getPriority())).append(",");
                csv.append(escapeCsv(task.getStatus())).append(",");
                csv.append(task.getDeadline() != null ? task.getDeadline().toString() : "").append(",");
                csv.append(task.getCreatedAt() != null ? task.getCreatedAt().toString() : "").append("\n");
            }
            if (pagedResponse.isLast()) break;
        }
        return csv.toString().getBytes();
    }
    
    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}