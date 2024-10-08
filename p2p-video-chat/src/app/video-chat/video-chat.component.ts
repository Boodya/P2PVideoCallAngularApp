import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Peer } from 'peerjs';
import { Router } from '@angular/router';
import { ThemeService } from '../services/theme.service';
import { PeerService } from '../services/peer.service';
import { v4 as uuidv4 } from 'uuid';

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
  private roomIdAnchor: string = '8519c17e-8ee2-42e0-a6c2-4b3657a69624';
  public roomId: string = '';
  public roomIdDisplay: string = '';
  public isRemoteVideoVisible: boolean = false;
  public isRoomAdmin: boolean = false;

  constructor(private router: Router,
    private themeService: ThemeService,
    private peerService: PeerService) { }

  ngOnInit() {
    document.addEventListener('fullscreenchange', this.onFullScreenChange);
    document.addEventListener('webkitfullscreenchange', this.onFullScreenChange); // Safari
    document.addEventListener('msfullscreenchange', this.onFullScreenChange); //IE11
    this.setupMedia().then((media) => {
      if (media == "error") {
        this.router.navigate(['/']);
      } else {
        this.setupPeer().then(() => {
          if (!this.isRoomAdmin) {
            setTimeout(() => {
              this.callPeer();
            }, 1000);
          } else {
            this.peerService.addData(this.roomIdDisplay);
          }
        });
      }
    });
  }

  ngOnDestroy() {
    document.removeEventListener('fullscreenchange', this.onFullScreenChange);
    document.removeEventListener('click', this.exitFullScreenOnClick);
  }

  async setupPeer() {
    const peerId = await this.initializePeerId();
    this.peer = new Peer(peerId);
    this.peer.on('open', (id: string) => {
      console.log("Peer started with id " + id);
      this.roomId = this.decodeRemoteId(id);
    });

    this.peer.on('call', (call: any) => {
      call.answer(this.localStream);
      call.on('stream', (remoteStream: MediaStream) => {
        const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
        this.isRemoteVideoVisible = true;
        remoteVideo.srcObject = remoteStream;
      });

      call.on('close', () => {
        console.log("Call ended.");
        this.isRemoteVideoVisible = false;
      });

      this.currentCall = call;
    });
  }

  setupMedia(): Promise<string> {
    return new Promise((resolve) => {
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
          resolve("media device configured");
        })
        .catch((error: any) => {
          console.error('Error accessing media devices.', error);
          resolve("error");
        });
    });
  }

  copyLinkToClipboard() {
    const fP = window.location.origin + window.location.pathname;
    const url = `${fP}?roomId=${this.roomId}`;
    navigator.clipboard.writeText(url);
  }

  async initializePeerId() {
    const remoteId = this.getRemoteId();
    if (remoteId == null || remoteId == '') {
      return uuidv4();
    }
    this.roomIdDisplay = remoteId;
    const encodedRoomId = this.encodeRemoteId(remoteId);
    if (await this.peerService.isRoomExist(encodedRoomId)) {
      return uuidv4();
    } else {
      this.isRoomAdmin = true;
      console.log("Starting room " + remoteId);
      return encodedRoomId;
    }
  }

  encodeRemoteId(remoteId: string) {
    return `${this.roomIdAnchor}-${remoteId}`;
  }

  decodeRemoteId(remoteId: string) {
    return remoteId.replaceAll(`${this.roomIdAnchor}-`, '');
  }

  getRemoteId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('roomId');
  }

  closeCall() {
    if (this.currentCall) {
      this.currentCall.close();
    }
    if (this.peer) {
      this.peer.destroy();
    }
    this.router.navigate(['']);
  }

  callPeer() {
    const remotePeerId = this.getRemoteId();
    if (remotePeerId == null || remotePeerId == '')
      return;
    if (this.peer == undefined || this.localStream == undefined)
      return;

    const call = this.peer.call(this.encodeRemoteId(remotePeerId), this.localStream);

    const streamTimeout = setTimeout(() => {
      console.log('Room not found.');
      alert('Комната не найдена. Использован неправильный идентификатор!');
      this.router.navigate(['/']);
    }, 5000);

    call.on('stream', (remoteStream: MediaStream) => {
      console.log("Connection established");
      clearTimeout(streamTimeout);
      const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
      this.isRemoteVideoVisible = true;
      remoteVideo.srcObject = remoteStream;
    });

    call.on('close', () => {
      this.router.navigate(['/']);
    });

    call.on('error', (err: any) => {
      console.error('No peer found for this Room ID:', err);
      alert('Stream with this Room ID does not exist.');
    });

    this.currentCall = call;
  }

  toggleFullScreen() {
    const videoContainer = document.querySelector('.call-area') as HTMLElement;
    if (videoContainer.requestFullscreen) {
      videoContainer.requestFullscreen();
    } else if ((videoContainer as any).webkitRequestFullscreen) {
      (videoContainer as any).webkitRequestFullscreen();
    } else if ((videoContainer as any).msRequestFullscreen) {
      (videoContainer as any).msRequestFullscreen();
    } else {
      console.error('Fullscreen API is not supported.');
    }

    videoContainer.requestFullscreen().catch(err => {
      console.error(`Error attempting to enable full-screen mode: ${err.message}`);
    });
  }

  onFullScreenChange = () => {
    const videoContainer = document.querySelector('.call-area') as HTMLElement;
    if (!document.fullscreenElement) {
      videoContainer.classList.remove('fullscreen');
      document.removeEventListener('click', this.exitFullScreenOnClick);
    } else {
      videoContainer.classList.add('fullscreen');
      document.addEventListener('click', this.exitFullScreenOnClick);
    }
  }

  exitFullScreenOnClick = (event: MouseEvent) => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      const videoContainer = document.querySelector('.call-area') as HTMLElement;
      videoContainer.classList.remove('fullscreen');
      document.removeEventListener('click', this.exitFullScreenOnClick);
    }
  }
}
