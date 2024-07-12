import { Component, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { FaqService } from '../services/faq.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-faq-admin',
  templateUrl: './faq-admin.component.html',
  styleUrls: ['./faq-admin.component.css'],
  standalone: true,
  imports: [HttpClientModule, FormsModule, CommonModule]
})
export class FaqAdminComponent implements OnInit {
  faqs: any[] = [];

  constructor(private faqService: FaqService) { }

  ngOnInit(): void {
    this.faqService.getAdminFaqs()
      .subscribe(data => {
        this.faqs = data;
      });
  }

  updateFaq(faq: any): void {
    this.faqService.updateFaq(faq)
      .subscribe(response => {
      });
  }

  togglePublishStatus(faq: any): void {
    this.faqService.togglePublishStatus(faq.id)
      .subscribe((response: any) => {
        faq.is_published = response.is_published;
      });
  }
}
