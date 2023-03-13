import { Injectable, PipeTransform } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  debounceTime,
  delay,
  Observable,
  of,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import {
  SortColumn,
  SortDirection,
} from '../Components/contacts-table/sortable-directive';
import { DecimalPipe } from '@angular/common';

export interface Geo {
  lat: string;
  lng: string;
}

export interface Address {
  street?: string;
  suite?: string;
  city?: string;
  zipcode?: string;
  geo?: Geo;
}

export interface Company {
  name?: string;
  catchPhrase?: string;
  bs?: string;
}

export interface Contact {
  id?: number;
  name?: string;
  username?: string;
  email?: string;
  address?: Address;
  phone?: string;
  website?: string;
  company?: Company;
}

interface State {
  page: number;
  pageSize: number;
  searchTerm: string;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
}

interface SearchResult {
  contacts: Contact[];
  total: number;
}

const compare = (v1: string | number, v2: string | number) =>
  v1 < v2 ? -1 : v1 > v2 ? 1 : 0;

function sort(
  contacts: Contact[],
  column: SortColumn,
  direction: string
): Contact[] {
  if (direction === '' || column === '') {
    return contacts;
  } else {
    return [...contacts].sort((a, b) => {
      console.log('sorting');
      console.log(typeof a);
      if (
        (typeof a[column] == 'string' && typeof b[column] == 'string') ||
        (typeof a[column] == 'number' && typeof b[column] == 'number')
      ) {
        const res = compare(a[column] as string, b[column] as string);
        return direction === 'asc' ? res : -res;
      } else {
        return 0;
      }
    });
  }
}

function matches(contact: Contact, term: string, pipe: PipeTransform) {
  return (
    contact.name?.toLowerCase().includes(term.toLowerCase()) ||
    contact.username?.toLowerCase().includes(term.toLowerCase()) ||
    contact.email?.toLowerCase().includes(term.toLowerCase()) ||
    contact.address?.city?.toLowerCase().includes(term.toLowerCase()) ||
    contact.phone?.toLowerCase().includes(term.toLowerCase()) ||
    contact.website?.toLowerCase().includes(term.toLowerCase()) ||
    contact.company?.name?.toLowerCase().includes(term.toLowerCase())
  );
  // pipe.transform(country.area).includes(term) ||
  // pipe.transform(country.population).includes(term)
}

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private contactsUrl: string = 'https://jsonplaceholder.typicode.com/users';
  private data: Contact[] = [];
  private _contacts$ = new BehaviorSubject<Contact[]>([]);
  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _total$ = new BehaviorSubject<number>(0);
  // private ready: boolean = false;

  private _state: State = {
    page: 1,
    pageSize: 4,
    searchTerm: '',
    sortColumn: '',
    sortDirection: '',
  };

  constructor(private http: HttpClient, private pipe: DecimalPipe) {
    const req = this.http.get<Contact[]>(this.contactsUrl);
    req.subscribe((data: Contact[]) => {
      this.data = [...data];
      this._search$
        .pipe(
          tap(() => this._loading$.next(true)),
          debounceTime(200),
          switchMap(() => this._search()),
          delay(200),
          tap(() => this._loading$.next(false))
        )
        .subscribe((result) => {
          this._contacts$.next(result.contacts);
          this._total$.next(result.total);
        });
      this._search$.next();
    });
  }

  get contacts$() {
    return this._contacts$.asObservable();
  }
  get total$() {
    return this._total$.asObservable();
  }
  get loading$() {
    return this._loading$.asObservable();
  }
  get page() {
    return this._state.page;
  }
  get pageSize() {
    return this._state.pageSize;
  }
  get searchTerm() {
    return this._state.searchTerm;
  }

  set page(page: number) {
    this._set({ page });
  }
  set pageSize(pageSize: number) {
    this._set({ pageSize });
  }
  set searchTerm(searchTerm: string) {
    this._set({ searchTerm });
  }
  set sortColumn(sortColumn: SortColumn) {
    this._set({ sortColumn });
  }
  set sortDirection(sortDirection: SortDirection) {
    this._set({ sortDirection });
  }

  private _set(patch: Partial<State>) {
    Object.assign(this._state, patch);
    this._search$.next();
  }

  private _search(): Observable<SearchResult> {
    const { sortColumn, sortDirection, pageSize, page, searchTerm } =
      this._state;

    // 1. sort
    let contacts = sort(this.data, sortColumn, sortDirection);

    // 2. filter
    contacts = contacts.filter((contact) =>
      matches(contact, searchTerm, this.pipe)
    );
    const total = contacts.length;

    // 3. paginate
    contacts = contacts.slice(
      (page - 1) * pageSize,
      (page - 1) * pageSize + pageSize
    );
    return of({ contacts: contacts, total: total });
  }
}
