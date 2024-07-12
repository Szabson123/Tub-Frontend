import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservationService } from '../services/reservation.service';
import { TubService } from '../services/tub.service';
import { ProfileService } from '../services/profile.service';
import { HttpClientModule } from '@angular/common/http';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-all-reservations',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './admin-all-reservations.component.html',
  styleUrls: ['./admin-all-reservations.component.css'],
  providers: [ReservationService, ProfileService, TubService]
})
export class AdminAllReservationsComponent implements OnInit {
  allReservations: any[] = [];
  userProfiles: { [key: number]: any } = {};  // Cache for user profiles
  tubs: any[] = [];

  constructor(
    private reservationService: ReservationService,
    private profileService: ProfileService,
    private tubService: TubService
  ) { }

  ngOnInit(): void {
    this.loadTubs();
    this.fetchallReservations();
  }

  loadTubs(): void {
    this.tubService.getTubs().subscribe(
      data => {
        this.tubs = data;
        console.log('Loaded tubs:', this.tubs);
      },
      error => {
        console.error('Error loading tubs', error);
      }
    );
  }

  fetchallReservations(): void {
    this.reservationService.getAllReservations().subscribe(
      data => {
        const userIds: number[] = data
          .map((reservation: any) => reservation.user)
          .filter((userId: number) => userId !== undefined);  // Filtrujemy undefined

        const uniqueUserIds: number[] = [...new Set(userIds)];

        if (uniqueUserIds.length > 0) {
          const profileRequests = uniqueUserIds.map((id: number) => this.profileService.getSpecificUserProfile(id));

          forkJoin(profileRequests).subscribe(
            profiles => {
              profiles.forEach(profile => {
                this.userProfiles[profile.id] = profile;
              });

              this.allReservations = data.map((reservation: any) => {
                return {
                  ...reservation,
                  userProfile: this.userProfiles[reservation.user],
                  tubName: this.getTubName(reservation.tub),
                  status: this.getStatus(reservation)
                };
              });
              console.log('All reservations:', this.allReservations);
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
        console.error('Error fetching all reservations', error);
      }
    );
  }

  getTubName(tubId: number): string {
    const tub = this.tubs.find(t => t.id === tubId);
    return tub ? tub.name : 'Unknown';
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
