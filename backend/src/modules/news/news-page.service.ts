import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NewsPage } from './news-page.entity';
import { CreateNewsPageDto } from './dto/news-page.create-news-page';

@Injectable()
export class NewsPageService {
  constructor(
    @InjectModel(NewsPage.name)
    private readonly newsPageModel: Model<NewsPage>,
  ) {}

  async create(createNewsPageDto: CreateNewsPageDto, imagePath?: string): Promise<NewsPage> {
    try {
      console.log('Creating news page with:', { ...createNewsPageDto, imagePath });
      const newsPage = new this.newsPageModel({
        headline: createNewsPageDto.headline,
        story: createNewsPageDto.story,
        imagePath,
      });
      return await newsPage.save();
    } catch (error) {
      console.error('Error creating news page:', error);
      throw error;
    }
  }

  async findAll(): Promise<NewsPage[]> {
    return this.newsPageModel.find().sort({ createdAt: -1 }).exec();
  }

  async publish(id: string): Promise<NewsPage> {
    const updatedNewsPage = await this.newsPageModel.findByIdAndUpdate(
      id,
      { published: true },
      { new: true },
    ).exec();

    if (!updatedNewsPage) {
      throw new NotFoundException(`NewsPage with id ${id} not found`);
    }

    return updatedNewsPage;
  }
}
