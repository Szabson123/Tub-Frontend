import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { Observable, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.authService.currentUser.pipe(
      take(1),
      switchMap(currentUser => {
        if (!currentUser) {
          this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
          return of(false);
        }
        return this.authService.loadProfile().pipe(
          map(() => {
            const isManager = this.authService.isManagerValue;
            const roles = route.data['roles'] as boolean[];
            console.log('AuthGuard: currentUser:', currentUser);
            console.log('AuthGuard: isManager:', isManager);
            console.log('AuthGuard: roles:', roles);

            if (roles && roles.length > 0 && !roles.includes(isManager)) {
              console.log('AuthGuard: User does not have the required role, redirecting...');
              this.router.navigate(['/']);
              return false;
            }
            return true;
          })
        );
      })
    );
  }
}
