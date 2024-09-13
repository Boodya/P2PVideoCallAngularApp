import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  constructor(private router: Router) {}

  ngOnInit() {
    this.triggerDarkMode(this.isDarkModeEnabled());
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

  isDarkModeEnabled() {
    return localStorage.getItem('darkMode') === 'enabled';
  }

  toggleDarkMode(event: any){
    this.triggerDarkMode(event.target.checked);
  }

  triggerDarkMode(isChecked: boolean) {
    if (isChecked) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('darkMode', 'enabled');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('darkMode', 'disabled');
    }
  }
}
