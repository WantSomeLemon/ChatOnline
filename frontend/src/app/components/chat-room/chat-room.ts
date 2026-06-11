import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

interface ChatMessage {
  id?: string;
  roomId: string;
  senderId: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'VIDEO';
  timestamp?: string;
}

@Component({
  selector: 'app-chat-room',
  standalone:true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-room.html',
  styleUrls: ['./chat-room.css']
})
export class ChatRoomComponent implements OnInit, OnDestroy {
  private stompClient: any = null;

  @Input() id!: string;

  roomId: string = '';
  userId: string = '';
  messageContent: string = '';
  messages: ChatMessage[] = [];

  constructor() {
    this.userId = 'User_' + Math.floor(Math.random() * 1000);
  }

  ngOnInit(): void {
    this.roomId = this.id;
    this.connectWebSocket();
  }

  connectWebSocket(): void {
    const socket = new SockJS('http://localhost:8080/ws-chat');
    this.stompClient = Stomp.over(socket);
    this.stompClient.debug = () => {};

    this.stompClient.connect({}, (frame: any) => {
      console.log('Kết nối thành công WebSocket: ' + frame);

      this.stompClient.subscribe(`/topic/room/${this.roomId}`, (response: any) => {
        if (response.body) {
          const incomingMessage: ChatMessage = JSON.parse(response.body);
          this.messages.push(incomingMessage);
        }
      });

    }, (error: any) => {
      console.error('Lỗi kết nối Socket hệ thống: ', error);
    });
  }

  sendMessage(): void {
    if (this.messageContent.trim() && this.stompClient) {
      const chatPayload: ChatMessage = {
        senderId: this.userId,
        content: this.messageContent.trim(),
        roomId: this.roomId,
        type: 'TEXT'
      };

      this.stompClient.send(
        `/app/chat.sendMessage/${this.roomId}`,
        {},
        JSON.stringify(chatPayload)
      );

      this.messageContent = '';
    }
  }

  ngOnDestroy(): void {
    if (this.stompClient) {
      this.stompClient.disconnect();
    }
  }
}
