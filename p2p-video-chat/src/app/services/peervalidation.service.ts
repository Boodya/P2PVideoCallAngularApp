import { Injectable } from '@angular/core';
import { Peer, DataConnection } from 'peerjs';

@Injectable({
    providedIn: 'root'
})
export class PeerService {
    private peer!: Peer;
    private connections: DataConnection[] = [];
    private connectedPeers: string[] = [];
    private peerId = 'p2pvideocalls_system_message_bus'; // Фиксированный ID для ведущего пира
    private isLeader = false; // Флаг для отслеживания роли ведущего пира

    constructor() {
        //this.initializePeer();
    }

    private initializePeer() {
        // Попытка подключиться к существующему ведущему пиру
        const testPeer = new Peer();

        testPeer.on('open', () => {
            const conn = testPeer.connect(this.peerId);
            conn.on('open', () => {
                console.log('Подключен к ведущему пиру:', this.peerId);
                this.isLeader = false; // Уже есть ведущий пир
                conn.close(); // Закрываем тестовое соединение
                this.initializeFollowerPeer(); // Инициализируем как "последователь"
            });

            conn.on('error', () => {
                console.log('Ведущий пир не найден, становимся ведущим пиром');
                this.isLeader = true;
                this.initializeLeaderPeer(); // Инициализируем как ведущий пир
            });
        });

        testPeer.on('error', () => {
            this.isLeader = true;
            this.initializeLeaderPeer();
        });
    }

    // Инициализация ведущего пира
    private initializeLeaderPeer() {
        this.peer = new Peer(this.peerId);

        this.peer.on('open', (id: string) => {
            console.log('Стартовал как ведущий пир:', id);
        });

        // Когда получаем соединение
        this.peer.on('connection', (conn: DataConnection) => {
            this.handleConnection(conn);
        });
    }

    // Инициализация как "последователь" (клиент)
    private initializeFollowerPeer() {
        this.peer = new Peer();

        this.peer.on('open', (id: string) => {
            console.log('Стартовал как обычный клиент с ID:', id);
        });

        // Когда получаем соединение
        this.peer.on('connection', (conn: DataConnection) => {
            this.handleConnection(conn);
        });

        // Подключаемся к ведущему пиру для синхронизации списка
        this.connectToLeaderPeer();
    }

    // Подключаемся к ведущему пиру
    private connectToLeaderPeer() {
        const conn = this.peer.connect(this.peerId);

        conn.on('open', () => {
            console.log('Подключились к ведущему пиру для синхронизации');
            conn.on('data', (data: unknown) => {
                const peerData = data as string[];
                console.log('Получены данные от ведущего пира:', data);
                this.connectedPeers = peerData.map((s: String) => s.toString());
                console.log(this.connectedPeers);
            });
        });

        conn.on('error', () => {
            console.log('Ошибка подключения к ведущему пиру');
        });
    }

    // Обрабатываем входящие соединения
    private handleConnection(conn: DataConnection) {
        console.log('Получено соединение от пира:', conn.peer);
        this.connections.push(conn);

        // Если это ведущий пир, отправляем список активных пиров
        conn.on('open', () => {
            conn.send(this.connectedPeers); // Отправляем список активных пиров новому клиенту
            this.broadcastPeerList(); // Отправляем список всем клиентам
        });

        conn.on('data', (data) => {
            console.log('Данные получены:', data);
        });

        conn.on('close', () => {
            console.log('Соединение закрыто:', conn.peer);
            this.removePeer(conn.peer); // Удаляем пир при отключении
        });
    }

    // Отправка обновленного списка активных пиров всем клиентам
    private broadcastPeerList() {
        this.connections.forEach((conn) => {
            conn.send(this.connectedPeers);
        });
    }

    // Возвращает список всех активных пиров
    public GetActivePeers(): string[] {
        return this.connectedPeers;
    }

    // Удаляет пир из списка активных при отключении
    public AddPeer(peerId: string): void {
        this.connectedPeers.push(peerId);
        if (this.isLeader) {
            this.broadcastPeerList(); // Обновляем список у всех клиентов
        }
    }

    // Удаляет пир из списка активных при отключении
    private removePeer(peerId: string): void {
        this.connectedPeers = this.connectedPeers.filter((id) => id !== peerId);
        this.connections = this.connections.filter((conn) => conn.peer !== peerId);
        if (this.isLeader) {
            this.broadcastPeerList(); // Обновляем список у всех клиентов
        }
    }

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