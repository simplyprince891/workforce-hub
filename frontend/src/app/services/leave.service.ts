import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LeaveRequest {
  id?: number;
  employeeId: number;
  employeeName?: string;
  department?: string;
  startDate: string;
  endDate: string;
  type: string;
  status?: string;
  reason: string;
  adminRemarks?: string;
  days?: number;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class LeaveService {
  private apiUrl = 'http://localhost:8080/api/leaves';

  constructor(private http: HttpClient) {}

  applyForLeave(leave: LeaveRequest): Observable<LeaveRequest> {
    return this.http.post<LeaveRequest>(this.apiUrl, leave);
  }

  getLeavesByEmployee(employeeId: number): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(`${this.apiUrl}/employee/${employeeId}`);
  }

  getAllLeaves(): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(this.apiUrl);
  }

  getPendingLeaves(): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(`${this.apiUrl}/pending`);
  }

  updateLeaveStatus(id: number, status: string, remarks?: string): Observable<LeaveRequest> {
    let url = `${this.apiUrl}/${id}/status?status=${status}`;
    if (remarks) {
      url += `&remarks=${encodeURIComponent(remarks)}`;
    }
    return this.http.patch<LeaveRequest>(url, {});
  }

  withdrawLeave(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getLeaveSummary(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/summary`);
  }
}
