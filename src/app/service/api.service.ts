import {Injectable} from '@angular/core'
import {NotifyService} from './notify.service'
import {RxStompService} from "./socket/rx-stomp.service"
import {Observable, Subscription} from "rxjs"
import {Message} from '@stomp/stompjs'
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Field} from "../model/Field";
import {CookieService} from "ngx-cookie-service";
import {CsrfToken} from "../model/CsrfToken";

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  key = ""
  backendURL: string

  receivedMessages: string[] = []

  private topicSubscription: Subscription

  constructor(
    private notifyService: NotifyService,
    private rxStompService: RxStompService,
    private http: HttpClient,
    private cookieService: CookieService
  ) {
    this.backendURL = `/backend/api`;
  }

  connect() {
    this.topicSubscription = this.rxStompService
      .watch('/topic/main')
      .subscribe((message: Message) => {
        let res = JSON.parse(message.body)
        this.onChange(res)
      })

    // this.ws = new WebSocket(this.url)
    // this.ws.onopen = () => {
    //   this.notifyService.success("connected")
    //   this.ws?.send(new Message("key", this.getKey()).json())
    // }
    // this.ws.onclose = () => {
    //   this.notifyService.error("connection closed reconnect in 5 sec")
    //   setTimeout(() => this.reconnect(), 5000)
    // }
    // this.ws.onmessage = (data) => {
    //   let m = JSON.parse(data.data)
    //   switch (m.type) {
    //     case "imageArray":
    //       this.onImage(m.data)
    //       break
    //     case "change":
    //       this.onChange(m.data)
    //       break
    //     case "changemulti":
    //       this.onChange(m.data)
    //       break
    //     case "error":
    //       this.notifyService.error(m.data)
    //   }
    // }
  }

  getField(): Observable<Field> {
    return this.http.get<Field>(this.backendURL + `/fields/main`);
  }

  sendCoordinates(row: number, column: number, color: string) {
    let headers = new HttpHeaders()
      .set('X-XSRF-TOKEN', localStorage.getItem(`csrf`) || "blank")
    this.http.post<void>(this.backendURL + "/fields/coordinates",
      {
        row: row,
        column: column,
        color: color
      },
      {
        headers: headers
      })
      .subscribe({
        error: error => {
          console.log(error)
        }
      })
  }

  onChange = (data: any) => {
  }

  reconnect() {
    this.notifyService.error("reconnecting")
    this.connect()
  }

  makeId(length: number): string {
    let result = []
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let charactersLength = characters.length
    for (let i = 0; i < length; i++) {
      result.push(characters.charAt(Math.floor(Math.random() *
        charactersLength)))
    }
    return result.join('')
  }

  getKey(): string {
    if (this.key == "") {
      let key = localStorage.getItem("socketKey")
      if (key == null) {
        key = this.makeId(15)
        localStorage.setItem("socketKey", key)
        return key
      } else {
        return key
      }
    } else {
      return this.key
    }
  }

  closeSocket() {
    this.topicSubscription.unsubscribe()
  }

  authenticate(credentials: { password: string; username: string }, param2: () => void) {
    this.http.post<CsrfToken>(this.backendURL + "/login",
      {
        login: credentials.username,
        password: credentials.password
      })
      .subscribe({
        next: res => {
          localStorage.setItem(`csrf`, res.csrf)
        },
        error: error => {
          console.log(error)
        }
      })
  }

  logout() {
    this.http.post<void>(this.backendURL + "/logout", {})
      .subscribe({
        next: res => {
          this.cookieService.deleteAll()
        },
        error: error => {
          console.log(error)
        }
      })
  }
}
