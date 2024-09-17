import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { VideoChatComponent } from './video-chat/video-chat.component';
import { ChatListComponent } from './chat-list/chat-list.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'chat', component: VideoChatComponent },
  { path: 'chat/:roomId', component: VideoChatComponent },
  { path: 'chatList', component: ChatListComponent }
];