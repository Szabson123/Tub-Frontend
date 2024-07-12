import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReservationService } from '../services/reservation.service';
import { RouterModule } from '@angular/router';
import { TubService } from '../services/tub.service';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular'; 
import { CalendarOptions } from '@fullcalendar/core'; 
import dayGridPlugin from '@fullcalendar/daygrid'; 
import interactionPlugin from '@fullcalendar/interaction';
import plLocale from '@fullcalendar/core/locales/pl'; 

interface CalendarEvent {
  title: string;
  start: Date;
  end?: Date;
  allDay: boolean;
  display: string;
  backgroundColor: string;
  classNames?: string[];
}

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterModule, HttpClientModule, CommonModule, FullCalendarModule],
  providers: [ReservationService, TubService],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  
  tubId!: number;
  reservation: any[] = [];
  tub: any = {};
  selectedDates: Date[] = [];
  currentStartDate!: Date;
  currentEndDate!: Date;
  reservationsLoaded: boolean = false;
  tubInfoLoaded: boolean = false;
  totalPrice: number = 0;

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    dateClick: this.handleDateClick.bind(this),
    events: [],
    datesSet: this.handleDatesSet.bind(this),
    locales: [plLocale], // Dodajemy polską lokalizację
    locale: 'pl', // Ustawiamy język na polski
    headerToolbar: {
    }
  };

  constructor(
    private route: ActivatedRoute,
    private reservationService: ReservationService,
    private tubService: TubService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.tubId = +params.get('id')!;
      this.loadReservations();
      this.loadTubinfo();
    });
  }

  loadReservations(): void {
    this.reservationService.getReservationByTub(this.tubId).subscribe(data => {
      this.reservation = data;
      this.reservationsLoaded = true;
      this.updateCalendarReservationsIfNeeded();
    });
  }

  loadTubinfo(): void {
    this.tubService.getTub(this.tubId).subscribe(data => {
      this.tub = data;
      this.tubInfoLoaded = true;
      this.updateCalendarReservationsIfNeeded();
    });
  }

  updateCalendarReservationsIfNeeded() {
    if (this.reservationsLoaded && this.tubInfoLoaded) {
      const startDate = this.normalizeDate(new Date());
      const endDate = this.normalizeDate(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0));
      this.updateCalendarReservations(startDate, endDate);
    }
  }

  handleDateClick(arg: any) {
    if (this.selectedDates.length < 2) {
      this.selectedDates.push(this.normalizeDate(arg.date));
    } else {
      this.selectedDates = [this.normalizeDate(arg.date)];
    }
  
    this.checkAndSwapDates();
    this.updateCalendarReservations(this.currentStartDate!, this.currentEndDate!);
  
    if (this.selectedDates.length === 2) {
      this.calculateTotalPrice();
    }
  }

  handleDatesSet(arg: any) {
    this.currentStartDate = arg.start;
    this.currentEndDate = arg.end;
    this.updateCalendarReservations(arg.start, arg.end);
  }

  updateCalendarReservations(startDate: Date, endDate: Date) {
    let reservationEvents: CalendarEvent[] = [];

    this.reservation.forEach(res => {
      const start = this.normalizeDate(new Date(res.start_date));
      const end = this.normalizeDate(new Date(res.end_date));
      end.setDate(end.getDate() + 1);

      reservationEvents.push({
        title: '',
        start: start,
        end: end,
        allDay: true,
        display: 'background',
        backgroundColor: 'lightcoral',
        classNames: ['fc-event-lightcoral']
      });
    });

    let selectedEvents: CalendarEvent[] = this.selectedDates.map(date => ({
      title: 'Zaznaczone',
      start: date,
      allDay: true,
      display: 'background',
      backgroundColor: 'green',
      classNames: ['fc-event-selected']
    }));

    this.calendarOptions = {
      ...this.calendarOptions,
      events: [...reservationEvents, ...selectedEvents]
    };
    
    setTimeout(() => {
      if (this.calendarComponent) {
        this.calendarComponent.getApi().refetchEvents();
      }
    }, 100);
  }

  normalizeDate(date: Date): Date {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    return normalizedDate;
  }

  calculateTotalPrice() {
    const startDate = this.selectedDates[0];
    const endDate = this.selectedDates[1];
    const timeDiff = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    this.totalPrice = diffDays * parseFloat(this.tub.price_per_day);
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  goToReservationForm() {
    this.router.navigate(['/shop', this.tubId, 'reservation'], {
      queryParams: {
        start_date: this.formatDate(this.selectedDates[0]),
        end_date: this.formatDate(this.selectedDates[1])
      }
    });
  }

  checkAndSwapDates() {
    if (this.selectedDates.length === 2) {
      const startDate = this.selectedDates[0];
      const endDate = this.selectedDates[1];
  
      if (endDate < startDate) {
        this.selectedDates[0] = endDate;
        this.selectedDates[1] = startDate;
      }
    }
  }
}
