import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ExportService {
  private apiUrl = 'http://localhost:8080/api/export';

  constructor(private http: HttpClient) {}

  exportEmployeesPdf(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/employees/pdf`, { responseType: 'blob' });
  }

  exportTasksPdf(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/tasks/pdf`, { responseType: 'blob' });
  }

  exportEmployeesExcel(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/employees/excel`, { responseType: 'blob' });
  }

  exportTasksExcel(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/tasks/excel`, { responseType: 'blob' });
  }

  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}