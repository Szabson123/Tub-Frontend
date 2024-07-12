import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservationService } from '../services/reservation.service';
import { TubService } from '../services/tub.service';
import { ProfileService } from '../services/profile.service';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-reservations-to-accept',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule],
  templateUrl: './reservations-to-accept.component.html',
  styleUrls: ['./reservations-to-accept.component.css'],
  providers: [ReservationService, TubService, ProfileService]
})
export class ReservationsToAcceptComponent implements OnInit {
  pendingReservations: any[] = [];
  tubs: any[] = [];
  userProfiles: { [key: number]: any } = {};

  constructor(
    private reservationService: ReservationService,
    private tubService: TubService,
    private profileService: ProfileService
  ) { }

  ngOnInit(): void {
    this.loadTubs();
    this.fetchPendingReservations();
  }

  loadTubs(): void {
    this.tubService.getTubs().subscribe(
      data => {
        this.tubs = data;
      },
      error => {
        console.error('Error loading tubs', error);
      }
    );
  }

  fetchPendingReservations(): void {
    this.reservationService.getPendingReservations().subscribe(
      data => {
        data.forEach((reservation: any) => {
        });
  
        const userIds: number[] = data
          .map((reservation: any) => reservation.user)
          .filter((userId: number) => userId !== undefined);  
  
        const uniqueUserIds: number[] = [...new Set(userIds)];
  
        if (uniqueUserIds.length > 0) {
          const profileRequests = uniqueUserIds.map((id: number) => this.profileService.getSpecificUserProfile(id));
  
          forkJoin(profileRequests).subscribe(
            profiles => {
              profiles.forEach(profile => {
                this.userProfiles[profile.id] = profile;
              });
  
              this.pendingReservations = data.map((reservation: any) => {
                return {
                  ...reservation,
                  tubName: this.getTubName(reservation.tub),
                };
              });
            },
            error => {
              console.error('Error loading user profiles', error);
            }
          );
        } else {
          console.error('No valid user IDs found in reservations');
        }
      },
      error => {
        console.error('Error fetching pending reservations', error);
      }
    );
  }
  
  getTubName(tubId: number): string {
    const tub = this.tubs.find(t => t.id === tubId);
    return tub ? tub.name : 'Unknown';
  }

  acceptReservation(reservationId: number): void {
    this.reservationService.acceptReservation(reservationId).subscribe(
      response => {
        this.fetchPendingReservations(); 
      },
      error => {
        console.error('Error accepting reservation', error);
      }
    );
  }

  deleteReservation(reservationId: number): void {
    this.reservationService.deleteReservation(reservationId).subscribe(
      response => {
        this.fetchPendingReservations(); 
      },
      error => {
        console.error('Error deleting reservation', error);
      }
    );
  }

  getStatus(reservation: any): string {
    if (reservation.accepted_status) {
      return 'Accepted';
    } else if (reservation.wait_status) {
      return 'Waiting';
    } else if (reservation.nobody_status) {
      return 'Nobody';
    } else {
      return 'Unknown';
    }
  }

  getUserProfile(userId: number): any {
    return this.userProfiles[userId] || {};
  }
}
