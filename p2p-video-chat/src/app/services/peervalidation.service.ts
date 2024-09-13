import { Injectable } from '@angular/core';
import { Peer, DataConnection } from 'peerjs';

@Injectable({
    providedIn: 'root'
})
export class PeerValidationService {
    isRoomActive(roomId: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const peer = new Peer();
            const conn: DataConnection = peer.connect(roomId);

            conn.on('open', () => {
                console.log('Peer exists, connection established');
                conn.close();
                resolve(true);
            });

            conn.on('error', (err) => {
                console.error('Error connecting to peer:', err);
                reject('Peer does not exist or is unavailable');
            });
            peer.destroy();
        });
    }
}