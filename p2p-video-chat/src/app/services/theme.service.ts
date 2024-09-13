import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  constructor() {
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
      this.enableDarkMode();
    }
  }

  enableDarkMode() {
    document.body.classList.add('dark-mode');
    localStorage.setItem('darkMode', 'enabled');
  }

  disableDarkMode() {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('darkMode', 'disabled');
  }

  toggleDarkMode(isDarkMode: boolean) {
    if (isDarkMode) {
      this.enableDarkMode();
    } else {
      this.disableDarkMode();
    }
  }

  isDarkModeEnabled(): boolean {
    return localStorage.getItem('darkMode') === 'enabled';
  }
}
