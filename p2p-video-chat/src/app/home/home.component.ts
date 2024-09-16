import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../services/theme.service';
import { PeerService } from '../services/peer.service';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  private localStream: MediaStream | undefined;
  
  constructor(private router: Router,
    private themeService: ThemeService,
    private pvService: PeerService) { }

  ngOnInit() {
    this.setupMedia();
  }

  joinChat() {
    const roomId = document.getElementById("roomId") as HTMLInputElement;
    if (roomId.value) {
      this.router.navigate(['/chat'], { queryParams: { roomId: roomId.value } });
    } else {
      roomId.classList.add('invalid');
    }
  }

  toggleDarkMode(event: any) {
    const isChecked = event.target.checked;
    this.themeService.toggleDarkMode(isChecked);
  }

  isDarkModeEnabled() {
    return this.themeService.isDarkModeEnabled();
  }

  setupMedia() {
    this.localStream = new MediaStream();
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream: MediaStream) => {
        this.localStream = stream;
        //const audioTracks = this.localStream.getAudioTracks();
        //audioTracks.forEach(track => track.enabled = false);
        const localVideo = document.getElementById('localVideo') as HTMLVideoElement;
        localVideo.srcObject = this.localStream;
        localVideo.volume = 0;
        localVideo.muted = true;
      })
      .catch((error: any) => {
        console.error('Error accessing media devices.', error);
      });
  }
}
