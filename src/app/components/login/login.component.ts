import {Component} from '@angular/core';
import {ApiService} from "../../service/api.service";
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  credentials = {username: '', password: ''};

  constructor(private apiService: ApiService, private http: HttpClient, private router: Router) {
  }

  login() {
    this.apiService.authenticate(this.credentials, () => {
      this.router.navigateByUrl('/').then(r => r);
    });
    return false;
  }

  logout() {
    this.apiService.logout()
  }
}
