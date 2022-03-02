import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class Config {
  constructor(private readonly configService: ConfigService) {}

  get port() {
    return this.getNumber('port')
  }

  get cors() {
    return this.getBoolean('cors')
  }

  private get(key: string): string | undefined {
    return this.configService.get<string>(key) || undefined
  }

  private getString(key: string): string {
    const v = this.get(key)
    if (!v) {
      throw new Error(`Required config ${key} is missing`)
    }
    return v
  }

  private getNumber(key: string): number {
    const v = this.getString(key)
    return Number(v)
  }

  private getBoolean(key: string): boolean {
    return this.getString(key) === 'true'
  }
}
