import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmployeeRequest } from './auth.service';
export { EmployeeRequest };

export interface EmployeeResponse {
  id: number;
  name: string;
  email: string;
  age: number;
  mobile: string;
  username: string;
  department: string;
  salary: number;
  role: string;
  managerId?: number;
  managerName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private apiUrl = 'http://localhost:8080/api/employees';

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 10, sortBy = 'id', direction = 'asc'): Observable<PagedResponse<EmployeeResponse>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sortBy', sortBy)
      .set('direction', direction);
    return this.http.get<PagedResponse<EmployeeResponse>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<EmployeeResponse> {
    return this.http.get<EmployeeResponse>(`${this.apiUrl}/${id}`);
  }

  create(employee: EmployeeRequest): Observable<EmployeeResponse> {
    return this.http.post<EmployeeResponse>(this.apiUrl, employee);
  }

  update(id: number, employee: EmployeeRequest): Observable<EmployeeResponse> {
    return this.http.put<EmployeeResponse>(`${this.apiUrl}/${id}`, employee);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  search(name?: string, email?: string, page = 0, size = 10): Observable<PagedResponse<EmployeeResponse>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (name) params = params.set('name', name);
    if (email) params = params.set('email', email);
    return this.http.get<PagedResponse<EmployeeResponse>>(`${this.apiUrl}/search`, { params });
  }

  filterByDepartment(department: string, page = 0, size = 10): Observable<PagedResponse<EmployeeResponse>> {
    const params = new HttpParams().set('page', page).set('size', size).set('department', department);
    return this.http.get<PagedResponse<EmployeeResponse>>(`${this.apiUrl}/filter/department`, { params });
  }

  filterBySalary(minSalary: number, maxSalary: number, page = 0, size = 10): Observable<PagedResponse<EmployeeResponse>> {
    const params = new HttpParams()
      .set('page', page).set('size', size)
      .set('minSalary', minSalary).set('maxSalary', maxSalary);
    return this.http.get<PagedResponse<EmployeeResponse>>(`${this.apiUrl}/filter/salary`, { params });
  }

  getByManager(managerId: number): Observable<EmployeeResponse[]> {
    return this.http.get<EmployeeResponse[]>(`${this.apiUrl}/manager/${managerId}`);
  }

  getByRole(role: string): Observable<EmployeeResponse[]> {
    return this.http.get<EmployeeResponse[]>(`${this.apiUrl}/role/${role}`);
  }

  getDepartments(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/departments`);
  }
}