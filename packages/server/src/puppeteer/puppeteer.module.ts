// Copyright 2022 LiYechao
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Module } from '@nestjs/common'
import { PuppeteerService } from './puppeteer.service'
import { PuppeteerController } from './puppeteer.controller'
import { Cluster } from 'puppeteer-cluster'

@Module({
  controllers: [PuppeteerController],
  providers: [
    PuppeteerService,
    {
      provide: Cluster,
      useFactory: () =>
        Cluster.launch({
          concurrency: Cluster.CONCURRENCY_BROWSER,
          maxConcurrency: 10,
          puppeteerOptions: {
            headless: true,
            args: ['--no-sandbox'],
          },
        }),
    },
  ],
})
export class PuppeteerModule {}
