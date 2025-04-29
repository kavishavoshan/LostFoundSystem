import { NewsPage } from "../news-page.entity";

export class GetNewsPageDto {
    id: number;
    headline: string;
    story: string;
    imagePath?: string;
    createdAt: Date;
    published: boolean;
  
    constructor(newsPage: NewsPage) {
      this.id = newsPage.id;
      this.headline = newsPage.headline;
      this.story = newsPage.story;
      this.imagePath = newsPage.imagePath;
      this.createdAt = newsPage.createdAt;
      this.published = newsPage.published;
    }
  }