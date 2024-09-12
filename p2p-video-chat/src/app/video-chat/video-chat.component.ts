import { Component, OnInit } from '@angular/core';
import { Peer } from 'peerjs';

@Component({
  selector: 'app-video-chat',
  standalone: true,
  templateUrl: './video-chat.component.html',
  styleUrls: ['./video-chat.component.css']
})
export class VideoChatComponent implements OnInit {
  private peer: Peer;
  private localStream: MediaStream;
  private currentCall: any;

  constructor() {
    this.peer = new Peer();
    this.localStream = new MediaStream();
  }

  ngOnInit() {
    
    this.setupPeer();
    this.setupMedia();
  }

  setupPeer() {
    

    // Display the local peer ID to share with the other peer
    this.peer.on('open', (id: string) => {
      const myRoomIdInput = document.getElementById('myRoomId') as HTMLInputElement;
      myRoomIdInput.value = id;
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
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream: MediaStream) => {
        this.localStream = stream;
        const localVideo = document.getElementById('localVideo') as HTMLVideoElement;
        localVideo.srcObject = this.localStream;
      })
      .catch((error: any) => {
        console.error('Error accessing media devices.', error);
      });
  }

  callPeer() {
    const remotePeerIdInput = document.getElementById('remoteId') as HTMLInputElement;
    const remotePeerId = remotePeerIdInput.value;

    if (this.currentCall) {
      this.currentCall.close();
    }

    const call = this.peer.call(remotePeerId, this.localStream);

    call.on('stream', (remoteStream: MediaStream) => {
      const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
      remoteVideo.srcObject = remoteStream;
    });

    call.on('close', () => {
      console.log("Call ended.");
    });

    this.currentCall = call;
  }
}
