import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private stompClient!: Client;
  private connectedSubject = new BehaviorSubject<boolean>(false);
  public connected$ = this.connectedSubject.asObservable();

  // THÊM BIẾN NÀY ĐỂ KHÓA CHẾT ID PHÒNG ĐANG CHAT
  public activeRoomId: string = '';

  constructor() {}

  connectWebSocket(): void {
    if (this.stompClient && this.stompClient.connected) {
      this.connectedSubject.next(true);
      return;
    }

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/api/ws-chat'),
      debug: (msg: string) => console.log(msg),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.stompClient.onConnect = (_frame) => {
      console.log('Connected!');
      this.connectedSubject.next(true);
    };

    this.stompClient.onStompError = (frame) => {
      console.error('Error: ' + frame.headers['message']);
      this.connectedSubject.next(false);
    };

    this.stompClient.activate();
  }

  watchRoomMessages(roomId: string): Observable<any> {
    // LƯU LẠI ID PHÒNG VÀO SERVICE ĐỂ KHÔNG BAO GIỜ BỊ MẤT
    this.activeRoomId = roomId;

    return new Observable((observer) => {
      if (!this.stompClient || !this.stompClient.connected) {
        observer.error('STOMP client is not connected');
        return;
      }

      const subscription = this.stompClient.subscribe(
        `/topic/room/${roomId}`,
        (message: IMessage) => {
          if (message.body) {
            observer.next(JSON.parse(message.body));
          }
        },
      );
      return () => {
        subscription.unsubscribe();
      };
    });
  }

  sendMessage(roomId: string, messageObject: any): void {
    // SỬ DỤNG ID TRUYỀN VÀO, NẾU TRỐNG THÌ LẤY ID ĐANG LƯU TRONG SERVICE
    const finalRoomId = roomId || this.activeRoomId;

    if (this.stompClient && this.stompClient.connected && finalRoomId) {
      this.stompClient.publish({
        destination: `/app/chat.sendMessage/${finalRoomId}`,
        body: JSON.stringify(messageObject),
      });
    } else {
      console.error('Cannot send message: STOMP client is not connected or roomId missing. Target:', finalRoomId);
    }
  }

  disconnect(): void {
    if (this.stompClient) {
      void this.stompClient.deactivate();
      this.connectedSubject.next(false);
      this.activeRoomId = ''; // Reset khi ngắt kết nối
    }
  }
}
