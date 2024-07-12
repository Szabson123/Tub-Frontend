import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = 'http://127.0.0.1:8000/api';  // Adjust as necessary

  constructor(private http: HttpClient) { }

  getUserProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile/`);
  }

  updateUserProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile/`, data);
  }

  getUserReservations(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile/reservations/`);
  }

  getSpecificUserProfile(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile/${userId}/`);
  }
}