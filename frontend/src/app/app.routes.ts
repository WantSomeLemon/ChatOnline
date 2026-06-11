import { Routes } from '@angular/router';
import { ChatComponent } from './components/chat/chat.component'; // <--- CHÚ Ý: Sửa lại đường dẫn này cho đúng với thư mục chứa file chat.component.ts của bạn nhé

export const routes: Routes = [
  // Cấu hình route động nhận tham số :id ở đây
  { path: 'chat/:id', component: ChatComponent },
];
