import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AuthLayoutRoutes } from "./auth-layout.routing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { LoginComponent } from "../../pages/login/login.component";
import { RegisterComponent } from "../../pages/register/register.component";
import { ComponentsModule } from "src/app/components/components.module";
import { NgxSpinnerModule } from "ngx-spinner";
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AuthLayoutRoutes),
    FormsModule,
    ComponentsModule,
    NgxSpinnerModule.forRoot(),
    // NgbModule
  ],
  declarations: [LoginComponent, RegisterComponent],
})
export class AuthLayoutModule {}
