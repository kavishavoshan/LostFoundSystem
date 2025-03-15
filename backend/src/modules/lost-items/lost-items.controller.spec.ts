import { Test, TestingModule } from '@nestjs/testing';
import { LostItemsController } from './lost-items.controller';

describe('LostItemsController', () => {
  let controller: LostItemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LostItemsController],
    }).compile();

    controller = module.get<LostItemsController>(LostItemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
