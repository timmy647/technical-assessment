import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ContactsTableComponent } from './Components/contacts-table/contacts-table.component';
import { NgbdSortableHeader } from './Components/contacts-table/sortable-directive';
import { ContactService } from './Services/contact.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DecimalPipe } from '@angular/common';
import { HeaderComponent } from './Components/header/header.component';

@NgModule({
  declarations: [AppComponent, ContactsTableComponent, HeaderComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    NgbdSortableHeader,
    NgbModule,
  ],
  providers: [ContactService, DecimalPipe],
  bootstrap: [AppComponent],
})
export class AppModule {}
