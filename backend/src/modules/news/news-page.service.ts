import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsPage } from './news-page.entity';
import { CreateNewsPageDto } from './dto/news-page.create-news-page';

@Injectable()
export class NewsPageService {
  constructor(
    @InjectRepository(NewsPage)
    private readonly newsPageRepository: Repository<NewsPage>,
  ) {}

  async create(createNewsPageDto: CreateNewsPageDto, imagePath?: string): Promise<NewsPage> {
    const newsPage = new NewsPage();
    newsPage.headline = createNewsPageDto.headline;
    newsPage.story = createNewsPageDto.story;
    if (imagePath) {
      newsPage.imagePath = imagePath;
    }

    return this.newsPageRepository.save(newsPage);
  }

  async findAll(): Promise<NewsPage[]> {
    return this.newsPageRepository.find();
  }

  async publish(id: number): Promise<NewsPage> {
    const item = await this.newsPageRepository.findOne({ where: { id } });
    if (!item) {
      throw new Error('News page not found');
    }
    item.published = true;
    return this.newsPageRepository.save(item);
  }
}