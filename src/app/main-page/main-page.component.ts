import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FaqService } from '../services/faq.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements OnInit {
  questionForm!: FormGroup;

  constructor(private fb: FormBuilder, private faqService: FaqService) {}

  ngOnInit(): void {
    this.questionForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{9}$')]],
      desc: ['', Validators.required]
    });
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
    } else {
    }
  }
}
