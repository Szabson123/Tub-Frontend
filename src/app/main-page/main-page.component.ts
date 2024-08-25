import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FaqService } from '../services/faq.service';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements OnInit, AfterViewInit {
  questionForm!: FormGroup;

  constructor(private fb: FormBuilder, private faqService: FaqService, private router: Router) {}

  ngOnInit(): void {
    this.questionForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{9}$')]],
      desc: ['', Validators.required]
    });

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd && event.urlAfterRedirects === '/') {
        this.startObserver();
      }
    });
  }

  ngAfterViewInit(): void {
    this.startObserver();
  }

  startObserver(): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show2');
        } else {
          entry.target.classList.remove('show2');
        }
      });
    });

    const hiddenElements = document.querySelectorAll('.hidden2');
    hiddenElements.forEach((el) => observer.observe(el));
  }

  onSubmit(): void {
    if (this.questionForm.valid) {
      const formValue = this.questionForm.value;
      const questionData = {
        question: formValue.desc,
        email: formValue.email,
        phoneNumber: formValue.phoneNumber
      };

      this.faqService.askQuestion(questionData).subscribe(
        response => {
          this.questionForm.reset();
        },
        error => {
          console.error('Error submitting question', error);
        }
      );
    }
  }
}
