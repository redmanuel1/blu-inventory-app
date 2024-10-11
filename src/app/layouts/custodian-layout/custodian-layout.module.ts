import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentsModule } from 'src/app/components/components.module';
import { CustodianLayoutRoutes } from './custodian-layout.routing';
import { ClipboardModule } from 'ngx-clipboard';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { ProductsComponent } from 'src/app/pages/custodian/products/products.component';
import { InventoryComponent } from 'src/app/pages/custodian/inventory/inventory.component';



@NgModule({
  declarations: [
    ProductsComponent,
    InventoryComponent
  ],
  imports: [
    CommonModule,
    ComponentsModule,
    RouterModule.forChild(CustodianLayoutRoutes),
    FormsModule,
    HttpClientModule,
    NgbModule,
    ClipboardModule
  ]
})

export class CustodianLayoutModule { }
