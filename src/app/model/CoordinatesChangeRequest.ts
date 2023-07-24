export class CoordinatesChangeRequest {
  x: number
  y: number
  color: string
  userId: string

  constructor(x: number, y: number, color: string, userId: string) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.userId = userId;
  }

  json(): string {
    return JSON.stringify(this)
  }
}
