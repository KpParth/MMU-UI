import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ConfirmationService } from './../../core/services/confirmation.service';
import { Router, Route } from '@angular/router';

@Component({
  selector: 'app-redir-fallback',
  templateUrl: './redir-fallback.component.html',
  styleUrls: ['./redir-fallback.component.css']
})
export class RedirFallbackComponent implements OnInit, AfterViewInit {

  constructor(private confirmationService: ConfirmationService, private router: Router, private cd: ChangeDetectorRef) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    Promise.resolve(null).then(() => {
      this.confirmationService.alert('Issues in connecting to Inventory, try again later', 'error');
      this.router.navigate(['/pharmacist/pharmacist-worklist'])
    }
    );
    // setTimeout(() => {
    //   this.confirmationService.alert('Issues in connecting to Inventory, try again later', 'error');
    //   this.router.navigate(['/pharmacist/pharmacist-worklist'])
    // }, 100);

  }

}
