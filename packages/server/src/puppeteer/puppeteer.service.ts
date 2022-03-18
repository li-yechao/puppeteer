import { Injectable } from '@nestjs/common'
import { spawnSync } from 'child_process'
import { mkdtempSync, readFileSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import PDFMerger from 'pdf-merger-js'
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf'
import Puppeteer from 'puppeteer'

const DEFAULT_TIMEOUT = 180e3

@Injectable()
export class PuppeteerService {
  async pdf({
    url,
    printBackground,
    margin,
    marginOfPageFirst,
    marginOfPageLast,
  }: {
    url: string
    printBackground?: boolean
    margin?: string | number
    marginOfPageFirst?: string | number
    marginOfPageLast?: string | number
  }): Promise<Buffer> {
    const browser = await PuppeteerService.browser
    const page = await browser.newPage()
    page.setDefaultTimeout(DEFAULT_TIMEOUT)
    await page.goto(url, { waitUntil: 'networkidle0' })
    const buffer = await page.pdf({
      displayHeaderFooter: false,
      printBackground,
      format: 'a4',
      margin: { left: margin, top: margin, right: margin, bottom: margin },
      timeout: DEFAULT_TIMEOUT,
    })

    const { numPages } = await pdfjs.getDocument(buffer).promise

    const firstPage = marginOfPageFirst
      ? await page.pdf({
          displayHeaderFooter: false,
          printBackground,
          format: 'a4',
          pageRanges: '1',
          margin: {
            left: marginOfPageFirst,
            top: marginOfPageFirst,
            right: marginOfPageFirst,
            bottom: marginOfPageFirst,
          },
          timeout: DEFAULT_TIMEOUT,
        })
      : undefined

    const lastPage =
      numPages > 1 && marginOfPageLast
        ? await page.pdf({
            displayHeaderFooter: false,
            printBackground,
            format: 'a4',
            margin: {
              left: marginOfPageFirst,
              top: marginOfPageFirst,
              right: marginOfPageFirst,
              bottom: marginOfPageFirst,
            },
            timeout: DEFAULT_TIMEOUT,
          })
        : undefined

    const merger = new PDFMerger()
    if (firstPage) {
      merger.add(firstPage, ['1'])
    }

    {
      const start = firstPage ? 2 : 1
      const end = lastPage ? numPages - 1 : numPages
      if (end >= start) {
        const pages = end > start ? `${start}-${end}` : [`${start}`]
        merger.add(buffer, pages)
      }
    }

    if (lastPage) {
      merger.add(lastPage, [`${(await pdfjs.getDocument(lastPage).promise).numPages}`])
    }

    await page.close()
    const tempDir = mkdtempSync(tmpdir())
    try {
      const path = join(tempDir, 'original.pdf')
      await merger.save(path)
      const compressedPath = join(tempDir, 'compressed.pdf')
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

  private static _browser?: Promise<Puppeteer.Browser>

  private static get browser(): Promise<Puppeteer.Browser> {
    if (!this._browser) {
      this._browser = Puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
    }
    return this._browser
  }
}
