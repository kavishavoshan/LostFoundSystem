import { Controller, Post, Get, Body, UploadedFile, UseInterceptors, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { NewsPageService } from './news-page.service';
import { CreateNewsPageDto } from './dto/news-page.create-news-page';
import { GetNewsPageDto } from './dto/news-page.get-news-page';

@Controller('news-pages')
export class NewsPageController {
  constructor(private readonly newsPageService: NewsPageService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createNewsPageDto: CreateNewsPageDto,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<GetNewsPageDto> {
    const imagePath = image ? `/uploads/${image.filename}` : undefined;
    const newsPage = await this.newsPageService.create(createNewsPageDto, imagePath);
    return new GetNewsPageDto(newsPage);
  }

  @Get()
  async findAll(): Promise<GetNewsPageDto[]> {
    const newsPages = await this.newsPageService.findAll();
    return newsPages.map(page => new GetNewsPageDto(page));
  }

  @Post(':id/publish')
  async publish(@Param('id') id: string): Promise<GetNewsPageDto> {
    const newsPage = await this.newsPageService.publish(Number(id));
    return new GetNewsPageDto(newsPage);
  }
}