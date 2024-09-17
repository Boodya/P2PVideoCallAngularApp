import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PeerService } from '../services/peer.service';
import { CommonModule } from '@angular/common'; 
import { ThemeService } from '../services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-list.component.html',
  styleUrl: './chat-list.component.css'
})
export class ChatListComponent {
  activeRooms: any[] = [];
  private dataListSubscription!: Subscription;
  public isValidating = true;

  constructor(public router: Router,
    private themeService: ThemeService,
    private pvService: PeerService) {
      
  }

  ngOnInit() {
    this.pvService.ready.then(() => {
      this.dataListSubscription = this.pvService.dataList$.subscribe((dataList) => {
        this.activeRooms = dataList;
      });
      this.isValidating = false;
    });
  }

  ngOnDestroy() {
    if (this.dataListSubscription) {
      this.dataListSubscription.unsubscribe();
    }
  }

  renderActiveRoomLinks(){
    const rooms = this.pvService.getDataList();
    rooms.forEach(room => {
      this.pvService.isRoomExist(room).then(isExist => {
        if(isExist){
          this.activeRooms.push(isExist);
        }
      });
    });
  }

  onRoomConnectButtonClick(roomId: string){
    this.router.navigate(['/chat'], { queryParams: { roomId: roomId } });
  }

  goHome(){
    this.router.navigate(['']);
  }

}
