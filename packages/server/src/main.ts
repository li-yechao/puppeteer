import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { Config } from './Config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  if (app.get(Config).cors) {
    app.enableCors()
  }

  await app.listen(app.get(Config).port)
}

bootstrap()
