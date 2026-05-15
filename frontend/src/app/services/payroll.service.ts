import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PayrollRequest {
  employeeId: number;
  month: number;
  year: number;
  bonus: number;
  otherDeductions: number;
  notes: string;
}

export interface PayrollResponse {
  id: number;
  employeeId: number;
  employeeName: string;
  department: string;
  month: number;
  year: number;
  baseSalary: number;
  hra: number;
  conveyanceAllowance: number;
  medicalAllowance: number;
  specialAllowance: number;
  grossSalary: number;
  pfDeduction: number;
  taxDeduction: number;
  otherDeductions: number;
  totalDeductions: number;
  netSalary: number;
  bonus: number;
  status: string;
  paidDate: string;
  notes: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class PayrollService {
  private apiUrl = 'http://localhost:8080/api/payroll';

  constructor(private http: HttpClient) { }

  generatePayroll(request: PayrollRequest): Observable<PayrollResponse> {
    return this.http.post<PayrollResponse>(`${this.apiUrl}/generate`, request);
  }

  generateBulkPayroll(month: number, year: number): Observable<PayrollResponse[]> {
    let params = new HttpParams().set('month', month).set('year', year);
    return this.http.post<PayrollResponse[]>(`${this.apiUrl}/generate-bulk`, null, { params });
  }

  getPayrollByEmployee(employeeId: number): Observable<PayrollResponse[]> {
    return this.http.get<PayrollResponse[]>(`${this.apiUrl}/employee/${employeeId}`);
  }

  getPayrollByMonth(month: number, year: number): Observable<PayrollResponse[]> {
    let params = new HttpParams().set('month', month).set('year', year);
    return this.http.get<PayrollResponse[]>(`${this.apiUrl}/monthly`, { params });
  }

  getPayrollById(id: number): Observable<PayrollResponse> {
    return this.http.get<PayrollResponse>(`${this.apiUrl}/${id}`);
  }

  approvePayroll(id: number): Observable<PayrollResponse> {
    return this.http.patch<PayrollResponse>(`${this.apiUrl}/${id}/approve`, {});
  }

  markAsPaid(id: number): Observable<PayrollResponse> {
    return this.http.patch<PayrollResponse>(`${this.apiUrl}/${id}/pay`, {});
  }

  getTotalPayrollForMonth(month: number, year: number): Observable<number> {
    let params = new HttpParams().set('month', month).set('year', year);
    return this.http.get<number>(`${this.apiUrl}/monthly/total`, { params });
  }
}
