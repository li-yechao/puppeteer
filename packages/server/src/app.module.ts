import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { Config } from './Config'
import { PuppeteerModule } from './puppeteer/puppeteer.module'

@Module({
  imports: [ConfigModule.forRoot({ envFilePath: ['.env.local', '.env'] }), PuppeteerModule],
  controllers: [],
  providers: [Config],
})
export class AppModule {}
