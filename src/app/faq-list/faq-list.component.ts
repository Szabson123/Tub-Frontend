import { Component, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FaqService } from '../services/faq.service';

@Component({
  selector: 'app-faq-list',
  templateUrl: './faq-list.component.html',
  styleUrls: ['./faq-list.component.css'],
  standalone: true,
  imports: [HttpClientModule, CommonModule]
})
export class FaqListComponent implements OnInit {
  faqs: any[] = [];

  constructor(private faqService: FaqService) { }

  ngOnInit(): void {
    this.faqService.getPublishedFaqs()
      .subscribe(data => {
        this.faqs = data;
      });
  }
}
