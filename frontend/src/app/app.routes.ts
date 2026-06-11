import {Router, Routes} from '@angular/router';
import { ChatComponent } from './components/chat/chat.component';
import {Component, OnInit} from '@angular/core';
import {HttpClient, provideHttpClient} from '@angular/common/http';
import {ChatRoomComponent} from './components/chat-room/chat-room';


@Component({
  standalone: true,
  template: `<div style="text-align: center; margin-top: 100px; font-family: sans-serif;">
               <h3>🔄 Đang khởi tạo phòng chat từ Docker Database...</h3>
             </div>`,
  imports: []
})

export class RouteInitializerComponent implements OnInit{
  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    // Gọi API của Spring Boot để tạo phòng mới tinh, lấy ID động từ DB dưới Docker
    const defaultRoomPayload = { name: "Phòng Hệ Thống", members: [] };
    this.http.post<any>('http://localhost:8080/api/chat/room', defaultRoomPayload)
      .subscribe({
        next: (roomFromDb) => {
          console.log('--- DOCKER DB: Khởi tạo thành công phòng chat ID:', roomFromDb.id);
          // Điều hướng trình duyệt sang URL động với ID vừa sinh ra từ DB
          this.router.navigate(['/room', roomFromDb.id]);
        },
        error: (err) => {
          console.error('Lỗi kết nối Backend Spring Boot:', err);
        }
      });
  }
}


export const routes: Routes = [
  // Vào trang chủ thì chạy Component thông minh để lấy ID động từ Docker
  { path: '', component: RouteInitializerComponent },

  // Route động bóc tách ID phòng chat
  // { path: 'room/:id', component: ChatComponent },
  { path: 'room/:id', component: ChatRoomComponent },

];
