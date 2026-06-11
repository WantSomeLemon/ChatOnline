import { Component, OnInit, OnDestroy, ChangeDetectorRef} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy {
  roomId!: string;
  currentUserId!: string;

  messageContent: string = '';
  messagesList: any[] = [];

  private anonymousMap = new Map<string, string>();
  private anonymousCounter = 1;

  private connectionSubscription!: Subscription;
  private messageSubscription!: Subscription;

  constructor(
    private chatService: ChatService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.initCurrentUserAndLoadChat();
  }

  private initCurrentUserAndLoadChat(): void {
    const myUsername = 'Bách';
    console.log(`--- ĐANG GỌI API LOGIN-QUICK CHO USERNAME: [${myUsername}] ĐỂ LẤY ID THẬT...`);

    this.http.post<any>(`http://localhost:8080/api/chat/login-quick?username=${myUsername}`, {})
      .subscribe({
        next: (userFromDocker) => {
          if (userFromDocker && userFromDocker.id) {
            this.currentUserId = userFromDocker.id;
            console.log(`--- THÀNH CÔNG: ID thật trong Docker của bạn (${myUsername}) là:`, this.currentUserId);
          } else {
            this.currentUserId = 'USER_TAM_THOI';
            console.warn('--- CẢNH BÁO: Không nhận được ID từ API, dùng fallback USER_TAM_THOI');
          }

          this.extractRoomIdFromUrl();
        },
        error: (err) => {
          console.error('--- LỖI KẾT NỐI API LOGIN-QUICK:', err);

          this.currentUserId = 'USER_TAM_THOI';
          this.extractRoomIdFromUrl();
        }
      });
  }

  private extractRoomIdFromUrl(): void {
    const idFromUrl = this.route.snapshot.paramMap.get('id');
    console.log('--- KÍCH HOẠT PHÒNG CHAT: ID bóc trực tiếp từ URL là:', idFromUrl);

    if (idFromUrl) {
      if (this.roomId !== idFromUrl) {
        this.messagesList = [];
        this.anonymousMap.clear();
        this.anonymousCounter = 1;
      }
      this.roomId = idFromUrl;
      this.startChatSession();
    } else {
      console.log('--- URL không có ID phòng. Luồng xử lý lỗi hoặc Room ảo.');
    }
  }

  startChatSession(): void {
    console.log('--- Chuẩn bị kết nối WebSocket với roomId:', this.roomId);

    this.loadMessageHistory();
    this.resetExistingConnections();
    this.connectAndListenToWebSocket();

  }

  private loadMessageHistory(): void {
    this.http.get<any[]>(`http://localhost:8080/api/chat/room/${this.roomId}/messages`)
      .subscribe({
        next: (historyMessages) => {
          console.log('--- ĐÃ LẤY LỊCH SỬ TIN NHẮN TỪ DOCKER DB: ', historyMessages);
          if(historyMessages){
            this.messagesList = historyMessages.map(msg => this.processMessageSenderName(msg));
          } else {
            this.messagesList = [];
          }
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Lỗi khi tải lịch sử chat:', err)
      })
  }

  private connectAndListenToWebSocket(): void {
    this.chatService.connectWebSocket();

    this.connectionSubscription = this.chatService.connected$.subscribe((isConnected: boolean) => {
      if (isConnected && this.roomId) {
        console.log(`--- SockJS kết nối THÀNH CÔNG tới phòng: ${this.roomId}`);

        if (this.messageSubscription) {
          this.messageSubscription.unsubscribe();
        }

        this.messageSubscription = this.chatService.watchRoomMessages(this.roomId).subscribe({
          next: (newRawMessage: any) => {
            console.log('Nhận được tin nhắn mới qua WebSocket:', newRawMessage);

            const processedMsg = this.processMessageSenderName(newRawMessage);
            this.messagesList = [...this.messagesList, processedMsg];

            this.cdr.detectChanges();
          },
          error: (err) => console.error('Lỗi lắng nghe tin nhắn:', err),
        });
      }
    });
  }

  private processMessageSenderName(msg: any): any {
    if (!msg) return msg;

    if (msg.senderId === this.currentUserId || msg.senderId === 'USER_TAM_THOI') {
      msg.displayUsername = 'Bách';
    }
    else {
      const rawSenderId = msg.senderId || 'unknown';


      if (!this.anonymousMap.has(rawSenderId)) {
        if (this.anonymousCounter === 1) {
          this.anonymousMap.set(rawSenderId, 'An');
        } else if (this.anonymousCounter === 2) {
          this.anonymousMap.set(rawSenderId, 'Binh');
        } else {
          this.anonymousMap.set(rawSenderId, `Anonymous${this.anonymousCounter - 2}`);
        }
        this.anonymousCounter++;
      }

      msg.displayUsername = this.anonymousMap.get(rawSenderId);
    }

    return msg;
  }

  private resetExistingConnections(): void {
    this.chatService.disconnect();

    if (this.connectionSubscription) {
      this.connectionSubscription.unsubscribe();
    }
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }

  onSendMessage(): void {
    if (!this.messageContent.trim()) return;

    if (!this.roomId || this.roomId === 'undefined') {
      this.roomId = this.chatService.activeRoomId;
    }

    console.log(
      '--- KIỂM TRA TRƯỚC KHI GỬI: roomId =', this.roomId,
      ' | userId =', this.currentUserId,
    );

    if (!this.roomId) {
      console.error('Không tìm thấy roomId hợp lệ ở cả Component lẫn Service!');
      return;
    }

    const msgPayload = {
      senderId: this.currentUserId,
      content: this.messageContent.trim(),
      timestamp: new Date().toISOString(),
    };

    this.chatService.sendMessage(this.roomId, msgPayload);
    this.messageContent = '';
  }

  ngOnDestroy(): void {
    this.resetExistingConnections();
    this.chatService.disconnect();
  }
}
