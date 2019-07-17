export class User {
  private isAlive: boolean = false;
  constructor(private id: string) { }

  public hartbeat(): void {
    this.isAlive = true
  }

  public kill(): void {
    this.isAlive = false
  }
}
