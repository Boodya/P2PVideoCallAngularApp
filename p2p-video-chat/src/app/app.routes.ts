import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { VideoChatComponent } from './video-chat/video-chat.component';

export const routes: Routes = [
  { path: '', component: HomeComponent }, // Главная страница
  { path: 'chat', component: VideoChatComponent }, // Создание нового чата
  { path: 'chat/:roomId', component: VideoChatComponent } // Присоединение к чату по ID
];
