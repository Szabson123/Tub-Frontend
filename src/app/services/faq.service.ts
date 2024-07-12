import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FaqService {
  private apiUrl = 'http://localhost:8000/api/faq';

  constructor(private http: HttpClient) { }

  getPublishedFaqs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/`);
  }

  getAdminFaqs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/manage/`);
  }

  updateFaq(faq: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/manage/${faq.id}/`, faq);
  }

  togglePublishStatus(faqId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/manage/${faqId}/status/`, {});
  }
  askQuestion(questionData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/question/`, questionData);
  }
}