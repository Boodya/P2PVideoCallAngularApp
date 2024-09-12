import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { VideoChatComponent } from './video-chat/video-chat.component'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, VideoChatComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'p2p-video-chat';
}
