import { Component, OnInit, OnDestroy, ChangeDetectorRef} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Thêm để hỗ trợ hiển thị danh sách nếu cần

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

  private connectionSubscription!: Subscription;
  private messageSubscription!: Subscription;

  constructor(
    private chatService: ChatService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.currentUserId = localStorage.getItem('userId') || 'USER_TAM_THOI';

    //  CHỈ DÙNG LUỒNG LẮNG NGHE ĐỘNG
    this.route.paramMap.subscribe((params) => {
      const idFromUrl = params.get('id');
      console.log('--- KÍCH HOẠT PHÒNG CHAT: ID từ URL là:', idFromUrl);

      if (idFromUrl) {
        // Nếu chuyển sang phòng mới, xóa sạch danh sách tin nhắn cũ trên màn hình đi
        if (this.roomId !== idFromUrl) {
          this.messagesList = [];
        }

        this.roomId = idFromUrl;
        this.startChatSession();
      }
    });
  }

  startChatSession(): void {
    console.log('--- Chuẩn bị kết nối WebSocket với roomId:', this.roomId);

    // 1. NGẮT KẾT NỐI CŨ TRƯỚC (Quan trọng: Tránh mở nhiều Socket chồng lên nhau)
    this.chatService.disconnect();

    // 2. Hủy các Subscription cũ để không bị lặp luồng dữ liệu
    if (this.connectionSubscription) {
      this.connectionSubscription.unsubscribe();
    }
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }

    // 3. Tiến hành kết nối mới
    this.chatService.connectWebSocket();

    this.connectionSubscription = this.chatService.connected$.subscribe((isConnected: boolean) => {
      if (isConnected && this.roomId) {
        console.log(`--- SockJS kết nối THÀNH CÔNG tới phòng: ${this.roomId}`);

        // Đảm bảo an toàn, hủy lắng nghe tin nhắn cũ nếu có
        if (this.messageSubscription) {
          this.messageSubscription.unsubscribe();
        }

        // Lắng nghe luồng tin nhắn mới duy nhất
        this.messageSubscription = this.chatService.watchRoomMessages(this.roomId).subscribe({
          next: (newRawMessage: any) => {
            console.log('Nhận được tin nhắn mới:', newRawMessage);
            this.messagesList = [...this.messagesList, newRawMessage];
            this.cdr.detectChanges();
          },
          error: (err) => console.error('Lỗi lắng nghe tin nhắn:', err),
        });
      }
    });
  }

  onSendMessage(): void {
    if (!this.messageContent.trim()) return;

    // LẤY ID DỰ PHÒNG TỪ SERVICE NẾU BIẾN CỦA COMPONENT BỊ XOÁ MẤT
    if (!this.roomId || this.roomId === 'undefined') {
      this.roomId = this.chatService.activeRoomId;
    }

    console.log(
      '--- KIỂM TRA TRƯỚC KHI GỬI: roomId =',
      this.roomId,
      ' | userId =',
      this.currentUserId,
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

    // Gửi tin nhắn đi
    this.chatService.sendMessage(this.roomId, msgPayload);
    this.messageContent = '';
  }

  ngOnDestroy(): void {
    if (this.connectionSubscription) {
      this.connectionSubscription.unsubscribe();
    }
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    this.chatService.disconnect();
  }
}
