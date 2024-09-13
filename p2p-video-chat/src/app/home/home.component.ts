import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  constructor(private router: Router, private themeService: ThemeService) {}

  ngOnInit() {
  }

  createChat() {
    this.router.navigate(['/chat']);
  }

  joinChat() {
    const roomId = document.getElementById("roomId") as HTMLInputElement;
    if (roomId.value) {
      this.router.navigate(['/chat', roomId.value]);
    } else {
      roomId.classList.add('invalid');
    }
  }

  toggleDarkMode(event: any){
    const isChecked = event.target.checked;
    this.themeService.toggleDarkMode(isChecked);
  }

  isDarkModeEnabled(){
    return this.themeService.isDarkModeEnabled();
  }
}
