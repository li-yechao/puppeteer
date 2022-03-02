import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { Config } from './Config'
import { PuppeteerModule } from './puppeteer/puppeteer.module'

@Module({
  imports: [ConfigModule.forRoot({ envFilePath: ['.env.local', '.env'] }), PuppeteerModule],
  controllers: [AppController],
  providers: [Config, AppService],
})
export class AppModule {}
