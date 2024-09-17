import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../services/theme.service';
import { PeerService } from '../services/peer.service';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  private localStream: MediaStream | undefined;
  peerIdControl = new FormControl('', [
    Validators.required,
    Validators.minLength(2),
    Validators.maxLength(30),
    Validators.pattern(/^[a-zA-Z0-9]{2,30}$/)
  ]);

  constructor(public router: Router,
    private themeService: ThemeService,
    private peerService: PeerService) { }

  ngOnInit() {
    this.setupMedia();
  }

  joinChat() {
    if(this.peerIdControl.valid){
      const peerIdEl = document.getElementById("roomId") as HTMLInputElement;
      peerIdEl.classList.remove('invalid');
      this.router.navigate(['/chat'], { queryParams: { roomId: this.peerIdControl.value } });
    } else {
      const peerIdEl = document.getElementById("roomId") as HTMLInputElement;
      peerIdEl.classList.add('invalid');
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
