import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Order, OrderProduct } from "src/app/models/order.model";
import {
  Transaction,
  TransactionComment,
} from "src/app/models/transaction.model";
import { FirestoreService } from "src/app/services/firestore.service";
import { switchMap } from "rxjs/operators";
import { formatDate } from "@angular/common";
import { NgForm } from "@angular/forms";
import { AuthService } from "src/app/services/auth.service";
import { ToastComponent } from "src/app/components/modal/toast/toast.component";
import { ToastService } from "src/app/components/modal/toast/toast.service";
import { NgxSpinnerService } from "ngx-spinner";
import { NotificationService } from "src/app/services/notification.service";
import { User } from "src/app/models/user.model";
import { WhereFilterOp } from "firebase/firestore";
import { InventoryTransaction } from "src/app/models/inventory-transaction.model";
import { Inventory } from "src/app/models/inventory.model";

@Component({
  selector: "app-order-confirmation",
  templateUrl: "./order-confirmation.component.html",
  styleUrls: ["./order-confirmation.component.scss"],
})
export class OrderConfirmationComponent implements OnInit {
  transactionId: string | null = null;
  orderedProducts: Order | null = null;
  transaction: Transaction | null = null;
  userName: string = "";
  newComment: string = "";
  userLoggedInName = "";
  hasAddedComment: boolean = false;
  private student: User | null = null;
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;

  constructor(
    private route: ActivatedRoute,
    private firestoreService: FirestoreService,
    private authService: AuthService,
    private toastService: ToastService,
    private spinnerService: NgxSpinnerService,
    private notificationService: NotificationService
  ) {
    firestoreService.collectionName = "Transactions";
  }

  ngOnInit(): void {
    this.spinnerService.show();
    this.route.paramMap.subscribe((params) => {
      this.transactionId = params.get("transactionId");
      if (this.transactionId) {
        this.fetchTransactionDetails(this.transactionId);
      }
    });
    this.userLoggedInName = this.authService.getUserFullName();
  }

  ngAfterViewInit() {
    this.toastService.registerToast(this.toastComponent);
  }

  fetchTransactionDetails(transactionId: string): void {
    this.spinnerService.show();
    this.firestoreService
      .getRecordById(transactionId)
      .pipe(
        switchMap((transactionData) => {
          if (transactionData) {
            this.transaction = transactionData;
            const orderNo = transactionData.orderNo;
            this.firestoreService.collectionName = "Orders";
            if (orderNo) {
              return this.firestoreService.getRecordByorderNo(orderNo);
            }
          }
          return [];
        })
      )
      .subscribe({
        next: (orderData) => {
          if (orderData && orderData.length > 0) {
            this.orderedProducts = orderData[0];
            if (this.orderedProducts) {
              this.firestoreService.collectionName = "Users";
              this.getUserFullName(this.orderedProducts.idNo);
            }
          }
          this.spinnerService.hide();
        },
        error: (err) => {
          this.spinnerService.hide();
        },
      });
  }

  getUserFullName(idNo: string): void {
    if (idNo) {
      this.firestoreService.getRecordByidNo(idNo).subscribe((userData) => {
        if (userData && userData.length > 0) {
          this.userName = `${userData[0].firstName} ${userData[0].lastName}`;
          this.student = userData[0];
        }
      });
    }
  }

  // parseUploadDateAsDate(dateString: string): string {
  //   const date = new Date(dateString);
  //   if (isNaN(date.getTime())) {
  //     return 'Invalid Date';
  //   }
  //   const format = 'MMMM d, y, h:mm a';
  //   const locale = 'en-US';
  //   const timezone = 'UTC';
  //   return formatDate(date, format, locale, timezone);
  // }

  addComment(form: NgForm) {
    this.spinnerService.show();
    // Check if the form is valid
    if (form.valid) {
      const comment: TransactionComment = {
        comment: this.newComment,
        commentDate: new Date().toISOString(),
        user: this.userLoggedInName,
      };

      // Initialize comments array if not present
      if (!this.transaction.comments) {
        this.transaction.comments = [];
      }

      // Add the new comment to the transaction
      this.transaction.comments.push(comment);

      // Prepare the transaction update (using its ID)
      const updatedTransaction = {
        id: this.transactionId, // Make sure you have the ID of the transaction
        comments: this.transaction.comments, // Only update the comments field
      };
      this.firestoreService.collectionName = "Transactions";
      // Call the updateRecords function to update Firestore
      this.firestoreService
        .updateRecords([updatedTransaction])
        .then(() => {
          this.spinnerService.hide();
          console.log("Transaction updated successfully.");
          this.hasAddedComment = true;
        })
        .catch((error) => {
          this.spinnerService.hide();
          console.error("Error updating transaction:", error);
        });

      // Reset the textarea and the form
      this.newComment = "";
      form.resetForm(); // Reset the form
    } else {
      console.warn("Comment form is invalid or empty.");
    }
  }

  // Method for declining the transaction
  declinePayment(): void {
    if (!this.hasAddedComment) {
      this.toastService.showToast(
        "Please add a comment on why the student's payment was declined and inform them the next steps ",
        "error"
      );
    } else {
      this.spinnerService.show();
      if (this.transaction && this.transactionId) {
        // Update the transaction status
        const updatedTransaction = {
          id: this.transactionId,
          status: "Invalid Payment",
          confirmedDate: null,
        };

        // Create a new status update
        const statusUpdate = {
          status: "Invalid Payment",
          dateUpdated: new Date().toISOString(),
          user: this.userLoggedInName,
        };

        // Check if the statusUpdates array exists, if not, initialize it
        if (!this.transaction.statusUpdates) {
          this.transaction.statusUpdates = [];
        }

        // Add the new status update
        this.transaction.statusUpdates.push(statusUpdate);

        // Set the updatedTransaction to include the status updates
        updatedTransaction["statusUpdates"] = this.transaction.statusUpdates;

        // Update the Firestore collection name
        this.firestoreService.collectionName = "Transactions";

        // Call the updateRecords method to update the transaction
        this.firestoreService
          .updateRecords([updatedTransaction])
          .then(async () => {
            this.toastService.showToast(
              "Payment has been marked as invalid. Please add a comment for clarification.",
              "error"
            );
            this.transaction.status = "Invalid Payment";
            await this.addNotification("accountantrejectpayment");
            this.spinnerService.hide();
          })
          .catch((error) => {
            console.error("Error updating transaction status:", error);
            this.spinnerService.hide();
          });
      }
    }
  }

  // Method for confirming the transaction
  async confirmPayment(): Promise<void> {
    this.spinnerService.show();
    if (this.transaction && this.transactionId) {
      let isProductsOutOfStock: boolean = await this.processInventory();
      if (isProductsOutOfStock) {
        this.spinnerService.hide();
        return;
      }
      // Update the transaction status
      const updatedTransaction = {
        id: this.transactionId,
        status: "Ready for Pick up",
        confirmedDate: new Date().toISOString(),
      };

      // Create a new status update
      const statusUpdate = {
        status: "Ready for Pick up",
        dateUpdated: new Date().toISOString(),
        user: this.userLoggedInName,
      };

      // Check if the statusUpdates array exists, if not, initialize it
      if (!this.transaction.statusUpdates) {
        this.transaction.statusUpdates = [];
      }

      // Add the new status update
      this.transaction.statusUpdates.push(statusUpdate);

      // Set the updatedTransaction to include the status updates
      updatedTransaction["statusUpdates"] = this.transaction.statusUpdates;

      // Update the Firestore collection name
      this.firestoreService.collectionName = "Transactions";

      // Call the updateRecords method to update the transaction
      this.firestoreService
        .updateRecords([updatedTransaction])
        .then(async () => {
          this.toastService.showToast(
            "Payment confirmed. Item is now ready for pick up",
            "success"
          );
          this.transaction.status = "Ready for Pick up";
          await this.addNotification("accountantacceptpaymentstudent");
          await this.addNotification("accountantacceptpaymentcustodian");
          this.spinnerService.hide();
        })
        .catch((error) => {
          this.toastService.showToast(
            `Error updating transaction status: ${error}`,
            "error"
          );
          console.error("Error updating transaction status:", error);
          this.spinnerService.hide();
        });
    }
  }

  // InventoryTransaction
  async processInventory(): Promise<boolean> {
    let isOutOfStock = false;
    // Formulate the condition needed to get the inventory
    const conditions: { field: string; operator: WhereFilterOp; value: any }[] =
      [];
    const productFailedArr: OrderProduct[] = [];
    const productFailedStringArr: string[] = [];
    // Assemble the data
    for (const product of this.orderedProducts.products) {
      conditions.push({
        field: "productCode",
        operator: "==",
        value: product.productCode,
      });
    }
    // Get the data from the inventory table
    this.firestoreService.collectionName = "Inventory";
    const resultArr = await this.firestoreService.getRecordByFields(conditions);
    const inventoryArr: Inventory[] = resultArr.map(({ id, data }) => ({
      ...data,
      id,
    }));
    const inventoryTransactionArr: InventoryTransaction[] = [];
    for (const product of this.orderedProducts.products) {
      const inventory: Inventory = inventoryArr.find(
        (inventory: Inventory) => inventory.productCode == product.productCode
      );

      // If there are no more inventory for the product
      if (inventory.quantity - product.quantity < 0) {
        productFailedArr.push(product);
        productFailedStringArr.push(`${product.productName}\n`);
        isOutOfStock = true;
        continue;
      }
      inventory.quantity -= product.quantity;
      inventory.dateUpdated = new Date().toISOString();

      const inventoryTransaction: InventoryTransaction = {
        productCode: product.productCode,
        amount: product.price * product.quantity,
        inOrOut: "OUT",
        quantity: -product.quantity,
        receivedFromOrGivenTo: this.student.idNo,
        transactionDate: new Date().toISOString(),
        transactionId: this.transactionId,
      };
      inventoryTransactionArr.push(inventoryTransaction);
    }
    if (isOutOfStock) {
      this.toastService.showToast(
        `The following products are out of stock\n ${productFailedStringArr}`,
        "error"
      );
    } else {
      // add inventory transaction
      this.firestoreService.collectionName = "InventoryTransaction";
      await this.firestoreService.addRecords(inventoryTransactionArr);
      // update inventory
      this.firestoreService.collectionName = "Inventory";
      await this.firestoreService.updateRecords(inventoryArr);
    }

    return isOutOfStock;
  }

  // Notification
  async addNotification(
    type:
      | "accountantrejectpayment"
      | "accountantacceptpaymentstudent"
      | "accountantacceptpaymentcustodian"
  ): Promise<void> {
    switch (type) {
      case "accountantrejectpayment":
        // Notify the student that the payment has been rejected
        await this.notificationService.addNotification(
          [this.student],
          type,
          this.transactionId
        );
        break;
      case "accountantacceptpaymentstudent":
        // Notify the student that the payment has been accepted
        await this.notificationService.addNotification(
          [this.student],
          type,
          this.transactionId
        );
        break;
      // Notify the custodians that the payment has been accepted
      case "accountantacceptpaymentcustodian":
        this.firestoreService.collectionName = "Users";
        this.firestoreService
          .getRecordsByField("role", "custodian")
          .subscribe(async (result: User[]) => {
            if (result) {
              await this.notificationService.addNotification(
                result,
                "accountantacceptpaymentcustodian",
                this.transactionId
              );
            }
          });

        break;
      default:
        break;
    }
  }
}
