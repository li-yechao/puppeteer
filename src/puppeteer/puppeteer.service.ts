import { Injectable } from '@nestjs/common'
import PDFMerger from 'pdf-merger-js'
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf'
import Puppeteer from 'puppeteer'

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
    await page.goto(url, { waitUntil: 'networkidle2' })
    const buffer = await page.pdf({
      displayHeaderFooter: false,
      printBackground,
      format: 'a4',
      margin: { left: margin, top: margin, right: margin, bottom: margin },
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
    return merger.saveAsBuffer()
  }

  private static _browser?: Promise<Puppeteer.Browser>

  private static get browser(): Promise<Puppeteer.Browser> {
    if (!this._browser) {
      this._browser = Puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
    }
    return this._browser
  }
}
