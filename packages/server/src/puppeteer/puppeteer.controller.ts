import { Controller, Get, HttpException, HttpStatus, Query, StreamableFile } from '@nestjs/common'
import { PuppeteerService } from './puppeteer.service'

@Controller('puppeteer')
export class PuppeteerController {
  constructor(private readonly puppeteerService: PuppeteerService) {}

  @Get('pdf')
  async pdf(
    @Query('url') url?: string,
    @Query('timezone') timezone?: string,
    @Query('printBackground') printBackground?: string,
    @Query('margin') margin?: string,
    @Query('marginOfPageFirst') marginOfPageFirst?: string,
    @Query('marginOfPageLast') marginOfPageLast?: string,
    @Query('filename') filename?: string
  ): Promise<StreamableFile> {
    if (!url?.match(/^https?:\/\//)) {
      throw new HttpException(`Invalid url "${url}"`, HttpStatus.BAD_REQUEST)
    }

    if (!filename?.trim()) {
      filename = 'download.pdf'
    }
    if (!filename.endsWith('.pdf')) {
      filename += '.pdf'
    }

    return new StreamableFile(
      await this.puppeteerService.pdf({
        url,
        timezone,
        printBackground: printBackground === 'true',
        margin,
        marginOfPageFirst,
        marginOfPageLast,
      }),
      {
        disposition: `attachment; filename="${filename}"`,
      }
    )
  }
}
