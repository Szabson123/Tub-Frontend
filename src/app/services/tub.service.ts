// tub.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TubService {
  private apiUrl = 'http://tub-backend-production.up.railway.app/api/';  

  constructor(private http: HttpClient) { }

  getTubs(): Observable<any> {
    return this.http.get(`${this.apiUrl}tubs/`);
  }

  getTub(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}tubs/${id}/`);
  }

  addTub(tubData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}add-tub/`, tubData);  
  }
}