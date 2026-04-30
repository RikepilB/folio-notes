import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Note } from './note.entity';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  findAll(
    @Query('archived') archived?: string,
    @Query('deleted') deleted?: string,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
  ): Promise<Note[]> {
    return this.notesService.findAll(
      archived === 'true',
      deleted === 'true',
      search,
      categoryId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Note> {
    return this.notesService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateNoteDto): Promise<Note> {
    return this.notesService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateNoteDto): Promise<Note> {
    return this.notesService.update(id, dto);
  }

  @Patch(':id/archive')
  toggleArchive(@Param('id') id: string): Promise<Note> {
    return this.notesService.toggleArchive(id);
  }

  @Delete('trash')
  @HttpCode(HttpStatus.NO_CONTENT)
  async emptyTrash(): Promise<void> {
    await this.notesService.emptyTrash();
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async softDelete(@Param('id') id: string): Promise<void> {
    await this.notesService.softDelete(id);
  }

  @Patch(':id/restore')
  restore(@Param('id') id: string): Promise<Note> {
    return this.notesService.restore(id);
  }

  @Delete(':id/permanent')
  @HttpCode(HttpStatus.NO_CONTENT)
  async hardDelete(@Param('id') id: string): Promise<void> {
    await this.notesService.hardDelete(id);
  }

  @Post(':id/categories/:catId')
  addCategory(
    @Param('id') noteId: string,
    @Param('catId') catId: string,
  ): Promise<Note> {
    return this.notesService.addCategory(noteId, catId);
  }

  @Delete(':id/categories/:catId')
  removeCategory(
    @Param('id') noteId: string,
    @Param('catId') catId: string,
  ): Promise<Note> {
    return this.notesService.removeCategory(noteId, catId);
  }
}
