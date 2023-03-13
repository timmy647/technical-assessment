import { Component, QueryList, ViewChildren } from '@angular/core';
import { Observable } from 'rxjs';
import { Contact, ContactService } from 'src/app/Services/contact.service';
import { NgbdSortableHeader, SortEvent } from './sortable-directive';

@Component({
  selector: 'app-contacts-table',
  templateUrl: './contacts-table.component.html',
  styleUrls: ['./contacts-table.component.css'],
})
export class ContactsTableComponent {
  contacts$: Observable<Contact[]>;
  total$: Observable<number>;

  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

  constructor(public service: ContactService) {
    this.contacts$ = this.service.contacts$;
    this.total$ = this.service.total$;
    this.headers = new QueryList<NgbdSortableHeader>();
  }

  onSort({ column, direction }: SortEvent) {
    // resetting other headers
    this.headers.forEach((header) => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    this.service.sortColumn = column;
    this.service.sortDirection = direction;
  }
}
