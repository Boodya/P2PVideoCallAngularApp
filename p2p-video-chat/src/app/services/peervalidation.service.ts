import { Injectable } from '@angular/core';
import { Peer, DataConnection } from 'peerjs';

@Injectable({
    providedIn: 'root'
})
export class PeerValidationService {
    isRoomExist(roomId: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const peer = new Peer(roomId);
            peer.on('open', () => {
                peer.destroy();
                resolve(false);
            });

            peer.on('error', (err) => {
                peer.destroy();
                resolve(true);
            });
        });
    }
}