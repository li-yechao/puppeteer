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

import { Injectable } from '@nestjs/common'
import { spawnSync } from 'child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { PaperFormat } from 'puppeteer'
import { Cluster } from 'puppeteer-cluster'

const DEFAULT_TIMEOUT = 180e3

@Injectable()
export class PuppeteerService {
  constructor(private readonly cluster: Cluster) {}

  async pdf({
    url,
    timezone,
    printBackground,
    margin,
    format,
  }: {
    url: string
    timezone?: string
    printBackground?: boolean
    margin?: string | number
    format?: PaperFormat
  }): Promise<Buffer> {
    const buffer = await this.cluster.execute(url, async ({ page }) => {
      if (timezone) {
        await page.emulateTimezone(timezone)
      }
      page.setDefaultTimeout(DEFAULT_TIMEOUT)
      await page.goto(url, { waitUntil: 'networkidle0' })

      return page.pdf({
        displayHeaderFooter: false,
        printBackground,
        format,
        timeout: DEFAULT_TIMEOUT,
        margin: { left: margin, top: margin, right: margin, bottom: margin },
      })
    })

    return this.compressPdf(buffer)
  }

  private async compressPdf(buffer: Buffer): Promise<Buffer> {
    const tempDir = mkdtempSync(tmpdir())
    try {
      const path = join(tempDir, 'original.pdf')
      const compressedPath = join(tempDir, 'compressed.pdf')

      writeFileSync(path, buffer)

      const res = spawnSync('gs', [
        '-q',
        '-dNOPAUSE',
        '-dBATCH',
        '-dSAFER',
        '-sDEVICE=pdfwrite',
        '-dPDFSETTINGS=/ebook',
        `-sOutputFile=${compressedPath}`,
        path,
      ])

      if (res.status !== 0) {
        throw new Error('Compress pdf failed')
      }

      return readFileSync(compressedPath)
    } finally {
      rmSync(tempDir, { recursive: true, force: true })
    }
  }
}
