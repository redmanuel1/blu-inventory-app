import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SidebarComponent } from "./sidebar/sidebar.component";
import { NavbarComponent } from "./navbar/navbar.component";
import { FooterComponent } from "./footer/footer.component";
import { RouterModule } from "@angular/router";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ItemComponent } from "./cards/item/item.component";
import { TableComponent } from "./table/table.component";
import { DisplayProductComponent } from "./cards/display-product/display-product.component";
import { ShoppingcartItemComponent } from "./cards/shoppingcart-item/shoppingcart-item.component";
import { FormsModule } from "@angular/forms";
import { PromptDialogComponent } from "./modal/prompt-dialog/prompt-dialog.component";
import { ToastComponent } from "./modal/toast/toast.component";
import { NgxSpinnerComponent } from "ngx-spinner";
import { NotificationComponent } from "./modal/notification/notification.component";

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    NgbModule,
    FormsModule,
    NgxSpinnerComponent,
  ],
  declarations: [
    FooterComponent,
    NavbarComponent,
    SidebarComponent,
    ItemComponent,
    DisplayProductComponent,
    TableComponent,
    ShoppingcartItemComponent,
    PromptDialogComponent,
    ToastComponent,
    NotificationComponent,
  ],
  exports: [
    FooterComponent,
    NavbarComponent,
    SidebarComponent,
    ItemComponent,
    DisplayProductComponent,
    TableComponent,
    ShoppingcartItemComponent,
    PromptDialogComponent,
    ToastComponent,
    NotificationComponent,
  ],
})
export class ComponentsModule {}
