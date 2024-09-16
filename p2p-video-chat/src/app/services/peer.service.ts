import { Injectable } from '@angular/core';
import { Peer, DataConnection } from 'peerjs';

@Injectable({
    providedIn: 'root'
})
export class PeerService {
    private peer!: Peer;
    private connections: Map<string, DataConnection> = new Map();
    private dataList: string[] = [];
    private knownPeers: Set<string> = new Set();
    private readonly leaderId = 'ffb867ad-1848-46f6-b579-ea96ad746cbb';
    private isLeader = false;
    private lastBroadcastTime = 0;
    private broadcastDelay = 1000;

    constructor() {
        this.initializePeer();
    }

    private initializePeer() {
        this.peer = new Peer(this.leaderId);

        this.peer.on('open', (id: string) => {
            this.isLeader = true;
            this.startLeaderTasks();
        });

        this.peer.on('error', (err) => {
            this.isLeader = false;
            this.peer = new Peer();

            this.peer.on('open', (id: string) => {
                this.connectToLeader();
            });

            this.peer.on('connection', (conn: DataConnection) => {
                this.handleConnection(conn);
            });

            this.peer.on('error', (err) => {
                console.error('Ошибка пира:', err);
            });
        });

        this.peer.on('connection', (conn: DataConnection) => {
            this.handleConnection(conn);
        });
    }

    private startLeaderTasks() {
        this.peer.on('connection', (conn: DataConnection) => {
            this.handleConnection(conn);
        });
    }

    private connectToLeader() {
        const conn = this.peer.connect(this.leaderId);

        conn.on('open', () => {
            this.setupConnectionHandlers(conn);
        });

        conn.on('error', (err) => {
            console.error(`Ошибка соединения с лидером ${this.leaderId}:`, err);
            this.tryToBecomeLeader();
        });
    }

    private tryToBecomeLeader() {
        this.peer.destroy();
        this.peer = new Peer(this.leaderId);

        this.peer.on('open', (id: string) => {
            this.isLeader = true;
            this.startLeaderTasks();
        });

        this.peer.on('error', (err) => {
            console.error('Не удалось стать лидером:', err);
            setTimeout(() => {
                this.tryToBecomeLeader();
            }, 5000);
        });
    }

    private handleConnection(conn: DataConnection) {
        if (!this.connections.has(conn.peer)) {
            this.setupConnectionHandlers(conn);
        }
    }

    private setupConnectionHandlers(conn: DataConnection) {
        this.connections.set(conn.peer, conn);

        conn.on('open', () => {
            conn.send({
                type: 'sync',
                dataList: this.dataList
            });
        });

        conn.on('data', (data: any) => {
            this.handleReceivedData(data);
        });

        conn.on('close', () => {
            this.connections.delete(conn.peer);
        });

        conn.on('error', (err) => {
            this.connections.delete(conn.peer);
        });
    }

    private handleReceivedData(data: any) {
        if (data.type === 'sync') {
            this.mergeDataList(data.dataList);
        } else if (data.type === 'update') {
            this.mergeDataList([data.item]);
        }
    }

    private mergeDataList(receivedDataList: string[]) {
        const dataSet = new Set([...this.dataList, ...receivedDataList]);
        this.dataList = Array.from(dataSet);
        this.broadcastData();
    }

    private broadcastData() {
        const currentTime = Date.now();
        if (currentTime - this.lastBroadcastTime >= this.broadcastDelay) {
            this.sendDataToPeers();
            this.lastBroadcastTime = currentTime;
        } else {
            setTimeout(() => {
                this.broadcastData();
            }, this.broadcastDelay - (currentTime - this.lastBroadcastTime));
        }
    }
    
    private sendDataToPeers() {
        this.connections.forEach((conn) => {
            if (conn.open) {
                conn.send({
                    type: 'sync',
                    dataList: this.dataList
                });
            }
        });
    }

    public addData(item: string) {
        if (!this.dataList.includes(item)) {
            this.dataList.push(item);
            this.connections.forEach((conn) => {
                if (conn.open) {
                    conn.send({
                        type: 'update',
                        item: item
                    });
                }
            });
        }
    }

    public getDataList(): string[] {
        return this.dataList;
    }

    public isRoomExist(roomId: string): Promise<boolean> {
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