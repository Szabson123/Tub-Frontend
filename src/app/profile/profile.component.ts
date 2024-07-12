import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../services/profile.service';
import { ReservationService } from '../services/reservation.service';
import { TubService } from '../services/tub.service';

// Define the Reservation interface directly in the component file
interface Reservation {
  tub: number;  // Changed to number to store tub ID initially
  price: number;
  start_date: string;
  end_date: string;
  nobody_status: boolean;
  wait_status: boolean;
  accepted_status: boolean;
  total_price?: number; // Optional field for calculated total price
  tub_name?: string;    // Optional field to store the tub name
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userProfile: any = {};
  userReservations: Reservation[] = [];
  tubs: any[] = [];
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private profileService: ProfileService, 
    private reservationService: ReservationService,
    private tubService: TubService
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadTubs();
  }

  loadUserProfile(): void {
    this.profileService.getUserProfile().subscribe(
      data => {
        this.userProfile = data;
      },
      error => {
        this.errorMessage = 'Failed to load user profile.';
      }
    );
  }

  loadTubs(): void {
    this.tubService.getTubs().subscribe(
      data => {
        this.tubs = data;
        this.loadUserReservations();
      },
      error => {
        this.errorMessage = 'Failed to load tubs.';
      }
    );
  }

  loadUserReservations(): void {
    this.reservationService.getUserReservations().subscribe(
      (data: Reservation[]) => {
        this.userReservations = data.map((reservation: Reservation) => ({
          ...reservation,
          total_price: this.calculateTotalPrice(reservation),
          tub_name: this.getTubName(reservation.tub)  // Convert tub ID to tub name
        }));
      },
      error => {
        this.errorMessage = 'Failed to load user reservations.';
      }
    );
  }

  calculateTotalPrice(reservation: Reservation): number {
    const start = new Date(reservation.start_date);
    const end = new Date(reservation.end_date);
    const timeDiff = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

    return diffDays * reservation.price;
  }

  getTubName(tubId: number): string {
    const tub = this.tubs.find(t => t.id === tubId);
    return tub ? tub.name : 'Unknown';
  }

  updateUserProfile(): void {
    this.profileService.updateUserProfile(this.userProfile).subscribe(
      data => {
        this.successMessage = 'Profile updated successfully!';
      },
      error => {
        this.errorMessage = 'Failed to update profile.';
      }
    );
  }
}
