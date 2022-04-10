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

import { Controller, Get, HttpException, HttpStatus, Query, StreamableFile } from '@nestjs/common'
import { PaperFormat } from 'puppeteer'
import { PuppeteerService } from './puppeteer.service'

@Controller('puppeteer')
export class PuppeteerController {
  constructor(private readonly puppeteerService: PuppeteerService) {}

  @Get('pdf')
  async pdf(
    @Query('url') url?: string,
    @Query('printBackground') printBackground?: string,
    @Query('timezone') timezone?: string,
    @Query('margin') margin?: string,
    @Query('filename') filename?: string,
    @Query('format') format?: PaperFormat
  ): Promise<StreamableFile> {
    if (!url?.match(/^https?:\/\//)) {
      throw new HttpException(`Invalid url "${url}"`, HttpStatus.BAD_REQUEST)
    }

    const buffer = await this.puppeteerService.pdf({
      url,
      printBackground: !!printBackground,
      timezone,
      margin,
      format,
    })

    return new StreamableFile(buffer, {
      type: 'application/pdf',
      disposition: filename
        ? `attachement; filename="${filename}"`
        : `inline; filename="print.pdf"`,
    })
  }
}
