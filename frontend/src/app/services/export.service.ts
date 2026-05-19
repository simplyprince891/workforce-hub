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

  downloadFile(data: Blob, filename: string): void {
    const blob = new Blob([data], { type: data.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    if ((window.navigator as any).msSaveOrOpenBlob) {
      (window.navigator as any).msSaveOrOpenBlob(blob, filename);
      return;
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    a.click();
    
    setTimeout(() => {
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
      window.URL.revokeObjectURL(url);
    }, 15000); // 15 seconds to be safe
  }
}