import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { PaginationDto } from '../../dto';
import { NoteDto } from '../../dto/note-dto';
import { ApiErrorMapper } from '../../mappers/api-error.mapper';
import { NoteMapper } from '../../mappers/note.mapper';
import { Note } from '../../models/note';
import { Pagination } from '../../models/pagination';
import { AppConfigService } from '../app-config.service';

/** Notes service. */
@Injectable({
  providedIn: 'root',
})
export class NotesService {

  private readonly notesUrl = new URL('business/notes/', this.appConfig.apiUrl).toString();

  /**
   * @constructor
   * @param http
   * @param appConfig
   */
  public constructor(
    private http: HttpClient,
    private appConfig: AppConfigService,
    private apiErrorMapper: ApiErrorMapper,
    private noteMapper: NoteMapper,
  ) {}

  /**
   * Save note.
   * @param note Note.
   * @returns Nothing.
   */
  public saveNote(note: Note): Observable<void> {
    return this.http.post<void>(this.notesUrl, this.noteMapper.toDto(note)).pipe(
      catchError((httpError: HttpErrorResponse) => {
        const apiError = this.apiErrorMapper.fromDtoWithValidationSupport(httpError, this.noteMapper);
        return throwError(apiError);
      }),
    );
  }

  /**
   * Get notes for attorney.
   * @param matterId ID of the matter from which we want to get notes.
   * @returns Pagination object.
   */
  public getNotes(matterId?: number, limit?: number): Observable<Pagination<Note>> {

    let params = new HttpParams().set('ordering', '-created');

    if (matterId) {
      params = params.set('matter', matterId.toString());
    }

    if (limit) {
      params = params.set('limit', limit.toString());
    }

    return this.http.get<PaginationDto<NoteDto>>(this.notesUrl, {params}).pipe(
      map(pagination => ({
        items: pagination.results.map(noteDto => this.noteMapper.fromDto(noteDto)),
        itemsCount: pagination.count,
      } as Pagination<Note>)),
    );
  }

  /**
   * Get note by id.
   * @returns Note.
   */
  public getNoteById(id: number): Observable<Note> {
    return this.http.get<NoteDto>(`${this.notesUrl}${id}/`).pipe(
      map(noteDto => this.noteMapper.fromDto(noteDto)),
    );
  }

  /**
   * Remove note by id.
   */
  public deleteNote(id: number): Observable<void> {
    return this.http.delete<void>(`${this.notesUrl}${id}/`);
  }

  /**
   * Change note.
   * @param note Note.
   */
  public editNote(note: Partial<Note>): Observable<Note> {
    if (note.id == null) {
      throw new Error('Note can\'t be patched without an id!');
    }

    return this.http.patch<NoteDto>(`${this.notesUrl}${note.id}/`, this.noteMapper.toDto(note as Note)).pipe(
      map(noteDto => this.noteMapper.fromDto(noteDto)),
    );
  }
}
