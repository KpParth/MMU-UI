import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-tm-logout',
  templateUrl: './tm-logout.component.html',
  styleUrls: ['./tm-logout.component.css']
})
export class TmLogoutComponent implements OnInit {

  constructor(private router:Router) { }

  ngOnInit() {
    sessionStorage.clear();
    localStorage.clear();
    this.router.navigate(['/login'])
  }

}
