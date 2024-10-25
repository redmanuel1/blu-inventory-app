import { Routes } from "@angular/router";
import { DashboardComponent } from "src/app/pages/dashboard/dashboard.component";
import { ProductsComponent } from "src/app/pages/custodian/products/products.component";
import { UserProfileComponent } from "src/app/pages/user-profile/user-profile.component";
import { TransactionsComponent } from "src/app/pages/student/transactions/transactions.component";
import { OrderPickupComponent } from "src/app/pages/custodian/order-pickup/order-pickup.component";
import { InventoryComponent } from 'src/app/pages/custodian/inventory/inventory.component';

export const CustodianLayoutRoutes: Routes = [
  { path: "orders", component: TransactionsComponent },
  // { path: 'transactions',   component: UserProfileComponent },
  { path: "products", component: ProductsComponent },
  {
    path: "orders/:transactionId/order-pickup",
    component: OrderPickupComponent,
  },
  { path: "user-profile", component: UserProfileComponent },
  { path: 'inventory',   component: InventoryComponent },{ path: "**", redirectTo: "orders", pathMatch: "full" },
];
