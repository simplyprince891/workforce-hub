import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AttendanceResponse {
  id?: number;
  employeeId: number;
  employeeName?: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'ON_LEAVE';
  checkInTime?: string;
  checkOutTime?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private apiUrl = 'http://localhost:8080/api/attendance';

  constructor(private http: HttpClient) {}

  checkIn(employeeId: number): Observable<AttendanceResponse> {
    return this.http.post<AttendanceResponse>(`${this.apiUrl}/${employeeId}/check-in`, {});
  }

  checkOut(employeeId: number): Observable<AttendanceResponse> {
    return this.http.post<AttendanceResponse>(`${this.apiUrl}/${employeeId}/check-out`, {});
  }

  getTodayStatus(employeeId: number): Observable<AttendanceResponse> {
    return this.http.get<AttendanceResponse>(`${this.apiUrl}/${employeeId}/today`);
  }

  getAllTodayLogs(): Observable<AttendanceResponse[]> {
    return this.http.get<AttendanceResponse[]>(`${this.apiUrl}/today/all`);
  }

  getMonthLogs(employeeId: number, month: number, year: number): Observable<AttendanceResponse[]> {
    return this.http.get<AttendanceResponse[]>(`${this.apiUrl}/${employeeId}/month?month=${month}&year=${year}`);
  }

  requestReset(employeeId: number, reason: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${employeeId}/request-reset`, reason);
  }

  getPendingResets(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/resets/pending`);
  }

  approveReset(requestId: number, remarks: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/resets/approve/${requestId}`, remarks);
  }

  getWorkHours(employeeId: number, month: number, year: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/${employeeId}/work-hours?month=${month}&year=${year}`);
  }
}
