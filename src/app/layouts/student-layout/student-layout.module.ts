import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StudentLayoutRoutes } from './student-layout.routing';
import { RouterModule } from '@angular/router';
import { StudentLayoutComponent } from './student-layout.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ClipboardModule } from 'ngx-clipboard';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(StudentLayoutRoutes),
    FormsModule,
    HttpClientModule,
    NgbModule,
    ClipboardModule
  ]
})
export class StudentLayoutModule { }
