import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PagedResponse } from './employee.service';
export { PagedResponse };

export interface TaskRequest {
  id?: number;
  title: string;
  description?: string;
  assignedById: number;
  assignedToId?: number;
  teamId?: number;
  priority: string;
  status?: string;
  deadline: string;
}

export interface SubtaskRequest {
  id?: number;
  taskId: number;
  title: string;
  isCompleted?: boolean;
  notes?: string;
}

export interface SubtaskResponse {
  id: number;
  taskId: number;
  title: string;
  isCompleted: boolean;
  notes?: string;
  createdAt: string;
}

export interface TaskCommentResponse {
  id: number;
  taskId: number;
  authorId: number;
  authorName: string;
  authorRole: string;
  content: string;
  createdAt: string;
}

export interface TaskResponse {
  id: number;
  title: string;
  description?: string;
  assignedById: number;
  assignedByName: string;
  assignedToId?: number;
  assignedToName?: string;
  teamId?: number;
  teamName?: string;
  priority: string;
  status: string;
  deadline: string;
  createdAt: string;
  subtasks: SubtaskResponse[];
  comments: TaskCommentResponse[];
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private apiUrl = 'http://localhost:8080/api/tasks';

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 10): Observable<PagedResponse<TaskResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PagedResponse<TaskResponse>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<TaskResponse> {
    return this.http.get<TaskResponse>(`${this.apiUrl}/${id}`);
  }

  create(task: TaskRequest): Observable<TaskResponse> {
    return this.http.post<TaskResponse>(this.apiUrl, task);
  }

  update(id: number, task: TaskRequest): Observable<TaskResponse> {
    return this.http.put<TaskResponse>(`${this.apiUrl}/${id}`, task);
  }

  updateStatus(id: number, status: string): Observable<TaskResponse> {
    return this.http.patch<TaskResponse>(`${this.apiUrl}/${id}/status`, {}, { params: new HttpParams().set('status', status) });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getByEmployee(employeeId: number): Observable<TaskResponse[]> {
    return this.http.get<TaskResponse[]>(`${this.apiUrl}/employee/${employeeId}`);
  }

  getByManager(managerId: number): Observable<TaskResponse[]> {
    return this.http.get<TaskResponse[]>(`${this.apiUrl}/manager/${managerId}`);
  }

  addSubtask(subtask: SubtaskRequest): Observable<SubtaskResponse> {
    return this.http.post<SubtaskResponse>(`${this.apiUrl}/subtasks`, subtask);
  }

  updateSubtask(id: number, subtask: SubtaskRequest): Observable<SubtaskResponse> {
    return this.http.put<SubtaskResponse>(`${this.apiUrl}/subtasks/${id}`, subtask);
  }

  toggleSubtask(id: number): Observable<SubtaskResponse> {
    return this.http.patch<SubtaskResponse>(`${this.apiUrl}/subtasks/${id}/toggle`, {});
  }

  deleteSubtask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/subtasks/${id}`);
  }

  addComment(taskId: number, authorId: number, content: string): Observable<TaskCommentResponse> {
    return this.http.post<TaskCommentResponse>(`${this.apiUrl}/comments`, { taskId, authorId, content });
  }

  deleteComment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/comments/${id}`);
  }

  countByEmployee(employeeId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/employee/${employeeId}/count`);
  }

  countByEmployeeAndStatus(employeeId: number, status: string): Observable<number> {
    const params = new HttpParams().set('status', status);
    return this.http.get<number>(`${this.apiUrl}/employee/${employeeId}/count/status`, { params });
  }
}