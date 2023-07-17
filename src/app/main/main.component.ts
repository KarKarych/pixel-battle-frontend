import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core'
import {NotifyService} from '../service/notify.service'
import {ApiService} from '../service/api.service'
import {SendingTimer} from './util/SendingTimer'

@Component({
  selector: `app-main`,
  templateUrl: `./main.component.html`,
  styleUrls: [`./main.component.css`]
})
export class MainComponent implements OnInit, OnDestroy {

  private isMouseDown = false
  private canvasWidth: number

  private timeMillis = 0

  private rows: number
  private columns: number

  private pixelSize: number
  private maxPixelSize = 100

  private dx: number
  private dy: number
  private lastMove = [0, 0]

  private prevDiff: number
  private prevLoc = [0, 0]
  private selected = [-1, -1]

  public selectedColor = `#000000`

  private image: Array<Array<string>> = []

  @ViewChild(`canvas`, {static: true})
  private canvas: ElementRef<HTMLCanvasElement>

  private ctx: CanvasRenderingContext2D | null

  public timer: SendingTimer = new SendingTimer()

  constructor(
    private notifyService: NotifyService,
    private service: ApiService
  ) {
  }

  ngOnInit(): void {
    this.service.connect()

    this.service.getField()
      .subscribe(res => {
        this.image = res.field;
        this.rows = this.image.length
        this.columns = this.image[0].length
        console.log(this.rows + "-11")
        console.log(this.columns)
        this.dx = 0
        this.dy = 15
        this.initCanvas()
      })

    this.service.onChange = (res) => {
      this.image[+res.row][+res.column] = res.color
      this.drawImage()
    }

    this.timer.start(0)
  }

  ngOnDestroy(): void {
    this.service.closeSocket()
  }

  touchstart(evt: TouchEvent) {
    if (evt.touches.length > 1) {
      this.prevDiff = Math.abs(evt.touches[0].clientX - evt.touches[1].clientX)
    }

    if (evt.touches.length > 0) {
      this.isMouseDown = true
      this.lastMove = [evt.touches[0].clientX, evt.touches[0].clientY]
    }
  }

  touchmove(evt: TouchEvent) {
    if (evt.touches.length > 1) {
      this.touchZoomOut(evt)
    }

    if (this.isMouseDown) {
      this.dx += evt.touches[0].clientX - this.lastMove[0]
      this.dy += evt.touches[0].clientY - this.lastMove[1]
      this.lastMove = [evt.touches[0].clientX, evt.touches[0].clientY]

    }

    this.saveState()
    this.drawImage()
  }

  touchEnd() {
    this.isMouseDown = false
  }

  mouseMove(evt: MouseEvent) {
    if (this.isMouseDown) {
      this.dx += evt.x - this.lastMove[0]
      this.dy += evt.y - this.lastMove[1]
      this.lastMove = [evt.x, evt.y]
      this.saveState()
      this.drawImage()
    }

    let curLoc = this.getPixelLocation(evt.x, evt.y);

    if (!(curLoc[0] > -1 && curLoc[0] < this.rows && curLoc[1] > -1 && curLoc[1] < this.columns)) {
      return;
    }

    if (this.selected[0] !== -1 && this.selected[1] !== -1) {
      return
    }

    if (curLoc[0] != this.prevLoc[0] || curLoc[1] != this.prevLoc[1]) {
      for (let i = 0; i < 6; i++) {
        this.extracted(this.prevLoc[0], this.prevLoc[1], `#ffffff`)
      }

      this.extracted(curLoc[0], curLoc[1], `#585858`)
      this.prevLoc = curLoc
    }
  }

  extracted(i: number, j: number, flag: string) {
    if (this.ctx === null) return
    this.ctx.clearRect(i * this.pixelSize + this.dx, j * this.pixelSize + this.dy, this.pixelSize, this.pixelSize)
    this.ctx.fillStyle = this.image[i][j]
    this.ctx.fillRect(i * this.pixelSize + this.dx, j * this.pixelSize + this.dy, this.pixelSize, this.pixelSize)
    this.ctx.strokeStyle = flag
    this.ctx.strokeRect(i * this.pixelSize + this.dx, j * this.pixelSize + this.dy, this.pixelSize, this.pixelSize)
  }

  saveState() {
    let t = Math.floor(Date.now())
    if (t - this.timeMillis > 500) {
      localStorage.setItem(`dx`, this.dx + ``)
      localStorage.setItem(`dy`, this.dy + ``)
      localStorage.setItem(`ps`, this.pixelSize + ``)
      this.timeMillis = t
    }
  }

  touchZoomOut(evt: TouchEvent) {
    let curDiff = Math.abs(evt.touches[0].clientX - evt.touches[1].clientX)
    if (this.prevDiff > 0) {
      if (curDiff > this.prevDiff) {
        this.pixelSize += (curDiff - this.prevDiff) / this.rows
        if (this.pixelSize > this.maxPixelSize) {
          this.pixelSize = this.maxPixelSize
        }
      }
      if (curDiff < this.prevDiff) {
        this.pixelSize -= (this.prevDiff - curDiff) / this.rows
        if (this.pixelSize < 1) {
          this.pixelSize = 1
        }
      }
    }
  }

  zoomOut() {
    if (this.pixelSize < this.maxPixelSize) {
      this.pixelSize = this.pixelSize * 1.1
      this.drawImage()
      this.saveState()
    }
  }

  zoomIn() {
    if (this.pixelSize > 2) {
      this.pixelSize = Math.floor(this.pixelSize * 0.9)
      this.drawImage()
      this.saveState()
    }
  }

  mouseDown(evt: MouseEvent) {
    this.isMouseDown = true
    this.lastMove = [evt.x, evt.y]
  }

  mouseUp(evt: MouseEvent) {
    this.isMouseDown = false
    let selectedNew = this.getPixelLocation(evt.x, evt.y)

    if (this.selected[0] === selectedNew[0] && this.selected[1] === selectedNew[1]) {
      this.selected = [-1, -1]
    } else {
      this.selected = selectedNew
    }

    this.drawImage()
  }

  initCanvas() {
      if (this.canvas !== undefined) {
      this.ctx = this.canvas.nativeElement.getContext(`2d`)
      this.canvas.nativeElement.width = window.innerWidth
      this.canvas.nativeElement.height = window.innerHeight
      this.canvasWidth = this.canvas.nativeElement.width
      this.canvas.nativeElement.addEventListener(`touchstart`, (t: TouchEvent) => this.touchstart(t), {passive: true})
      this.canvas.nativeElement.addEventListener(`touchmove`, (t: TouchEvent) => this.touchmove(t), {passive: true})
      this.canvas.nativeElement.addEventListener(`touchend`, () => this.touchEnd())
    }
    this.pixelSize = 15
    this.drawImage()
  }

  drawImage() {
    if (this.ctx != null) {
      this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.ctx.fillStyle = this.image[i][j]
          this.ctx.fillRect(i * this.pixelSize + this.dx, j * this.pixelSize + this.dy, this.pixelSize, this.pixelSize)

          if (this.selected[0] == i && this.selected[1] == j) {
            this.ctx.strokeStyle = `#000000`
          } else {
            this.ctx.strokeStyle = `#ffffff00`
          }

          this.ctx.strokeRect(i * this.pixelSize + this.dx, j * this.pixelSize + this.dy, this.pixelSize, this.pixelSize)
        }
      }
    }
  }

  getPixelLocation(x: number, y: number): Array<number> {
    return [Math.floor((x - this.dx) / this.pixelSize), Math.floor((y - this.dy) / this.pixelSize)]
  }

  setToPixel() {
    if (this.selected[0] > -1 && this.selected[0] < this.rows && this.selected[1] > -1 && this.selected[1] < this.columns) {
      this.timer.start(3)
      this.service.sendCoordinates(this.selected[0], this.selected[1], this.selectedColor)
      this.selected = [-1, -1]
      this.drawImage()
    }
  }
}


