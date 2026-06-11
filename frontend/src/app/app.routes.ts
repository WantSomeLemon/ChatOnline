import { Routes } from '@angular/router';
import { ChatComponent } from './components/chat/chat.component';

export const routes: Routes = [
  // Cấu hình route động nhận tham số :id ở đây
  { path: 'room/:id', component: ChatComponent },
];
