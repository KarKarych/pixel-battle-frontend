export class SendingTimer {
  secondsLeft = 1;
  constructor(time: number = 3) {
    this.secondsLeft = time
  }

  start(time: number = 2){
    this.secondsLeft = time;
    this.tick();
  }

  tick() {
    this.secondsLeft--;
    if(this.secondsLeft <= 0){
      return
    }
    setTimeout(()=> {this.tick()}, 1000)
  }
}
