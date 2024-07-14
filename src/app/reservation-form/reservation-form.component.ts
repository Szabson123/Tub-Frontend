import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReservationService } from '../services/reservation.service';
import { TubService } from '../services/tub.service';


@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HttpClientModule],
  templateUrl: './reservation-form.component.html',
  styleUrls: ['./reservation-form.component.css'],
  providers: [ReservationService, TubService]
})
export class ReservationFormComponent implements OnInit {
  reservationForm: FormGroup;
  tubId: number = 0;
  startDate: string = '';
  endDate: string = '';
  totalPrice: number = 0;
  tub: any = {};

  constructor(
    private fb: FormBuilder,
    private reservationService: ReservationService,
    private tubService: TubService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.reservationForm = this.fb.group({
      city: ['', Validators.required],
      street: ['', Validators.required],
      home_number: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.tubId = +params.get('id')!;
      this.loadTubInfo();
    });
  
    this.route.queryParamMap.subscribe(params => {
      this.startDate = params.get('start_date')!;
      this.endDate = params.get('end_date')!;
      this.calculateTotalPrice();
    });
  }

  loadTubInfo(): void {
    this.tubService.getTub(this.tubId).subscribe(data => {
      this.tub = data;
      this.calculateTotalPrice();
    });
  }

  calculateTotalPrice() {
    if (!this.startDate || !this.endDate || !this.tub.price_per_day) {
      return;
    }

    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const timeDiff = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

    this.totalPrice = diffDays * parseFloat(this.tub.price_per_day);
  }

  onSubmit() {
    if (this.reservationForm.valid) {
      const formData = this.reservationForm.value;
      formData.start_date = this.startDate;
      formData.end_date = this.endDate;
      formData.counted_price = this.totalPrice;

      this.reservationService.createReservation(this.tubId, formData).subscribe(
        response => {
          this.router.navigate(['/shop']);
        },
        error => {
          console.error('Error creating reservation', error);
        }
      );
    }
  }
}
