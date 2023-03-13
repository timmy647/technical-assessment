import { Component } from '@angular/core';
import { ContactService } from './Services/contact.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'contacts-viewer';

  constructor(private service: ContactService) {}
}
