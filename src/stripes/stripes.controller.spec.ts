import { Test, TestingModule } from '@nestjs/testing';
import { StripesController } from './stripes.controller';
import { StripesService } from './stripes.service';

describe('StripesController', () => {
  let controller: StripesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StripesController],
      providers: [StripesService],
    }).compile();

    controller = module.get<StripesController>(StripesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
