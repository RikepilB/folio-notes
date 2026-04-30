import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { Note } from '../notes/note.entity';
import { Category } from '../categories/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Note, Category])],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeedModule implements OnModuleInit {
  constructor(private readonly seederService: SeederService) {}

  async onModuleInit(): Promise<void> {
    await this.seederService.seed();
  }
}