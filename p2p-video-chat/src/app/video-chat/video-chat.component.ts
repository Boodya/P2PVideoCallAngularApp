import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Peer } from 'peerjs';
import { Router } from '@angular/router';
import { ThemeService } from '../services/theme.service';
import { PeerValidationService } from '../services/peervalidation.service';

@Component({
  selector: 'app-video-chat',
  standalone: true,
  templateUrl: './video-chat.component.html',
  styleUrls: ['./video-chat.component.css']
})
export class VideoChatComponent implements OnInit {
  @ViewChild('localVideo') localVideo!: ElementRef;
  private peer: Peer | undefined;
  private localStream: MediaStream | undefined;
  private currentCall: any;
  private roomId: string = '';

  constructor(private router: Router,
    private themeService: ThemeService,
    private peerValidationService: PeerValidationService) { }

  ngOnInit() {
    this.setupPeer();
    this.setupMedia();
  }

  setupPeer() {
    this.peer = new Peer();
    // Display the local peer ID to share with the other peer
    this.peer.on('open', (id: string) => {
      this.roomId = id;
      const myRoomIdInput = document.getElementById('myRoomId') as HTMLLabelElement;
      myRoomIdInput.textContent = id;
    });

    // Handle incoming calls
    this.peer.on('call', (call: any) => {
      call.answer(this.localStream);

      call.on('stream', (remoteStream: MediaStream) => {
        const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
        remoteVideo.srcObject = remoteStream;
      });

      call.on('close', () => {
        console.log("Call ended.");
      });

      this.currentCall = call;
    });
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

        setTimeout(() => {
          this.callPeer();
        }, 1000);

      })
      .catch((error: any) => {
        console.error('Error accessing media devices.', error);
      });
  }

  copyLinkToClipboard() {
    const url = `${window.location.href}?roomId=${this.roomId}`;
    navigator.clipboard.writeText(url);
    console.log("link copied");
  }

  getRemoteId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('roomId');
  }

  closeCall() {
    if (this.currentCall) {
      this.currentCall.close();
    }
    this.router.navigate(['']);
  }

  callPeer() {
    const remotePeerId = this.getRemoteId();
    if (remotePeerId == null || remotePeerId == '')
      return;
    if (this.peer == undefined || this.localStream == undefined)
      return;

    const call = this.peer.call(remotePeerId, this.localStream);
    
    const streamTimeout = setTimeout(() => {
      console.error('Room not found.');
      alert('Комната не найдена. Использован неправильный идентификатор!');
      this.router.navigate(['/']);
    }, 5000);

    call.on('stream', (remoteStream: MediaStream) => {
      console.log("Connection established");
      clearTimeout(streamTimeout);
      const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
      remoteVideo.srcObject = remoteStream;
    });

    call.on('close', () => {
      console.log("Call ended.");
    });

    call.on('error', (err: any) => {
      console.error('No peer found for this Room ID:', err);
      alert('Stream with this Room ID does not exist.');
    });

    this.currentCall = call;
  }

  swapVideo(type: string) {
    const localVideo = document.getElementById('localVideo') as HTMLVideoElement;
    const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
  
    if (type === 'local') {
      localVideo.classList.remove('secondaryVideo');
      localVideo.classList.add('primaryVideo');
  
      remoteVideo.classList.remove('primaryVideo');
      remoteVideo.classList.add('secondaryVideo');
    } else if (type === 'remote') {
      remoteVideo.classList.remove('secondaryVideo');
      remoteVideo.classList.add('primaryVideo');
  
      localVideo.classList.remove('primaryVideo');
      localVideo.classList.add('secondaryVideo');
    }
  }  
}
