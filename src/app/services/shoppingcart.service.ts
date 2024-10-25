import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference } from '@angular/fire/compat/firestore';
import { CartItem } from '../models/shoppingcart.model'; 
import { catchError, combineLatest, map, Observable, of } from 'rxjs';
import { Inventory } from '../models/inventory.model';

@Injectable({
  providedIn: 'root'
})
export class ShoppingCartService {
  private selectedItems: CartItem[] = []; 

  constructor(private firestore: AngularFirestore) { }

  /** 
   * Adds a product to the shopping cart.
   * @param cartItem - The item to add to the cart.
   * @returns A promise with the document reference of the added item.
   */
  addToCart(cartItem: CartItem): Promise<DocumentReference> {
    return this.firestore.collection('ShoppingCart').add(cartItem)
      .then((docRef: DocumentReference) => {
        console.log('Product added to cart successfully with ID:', docRef.id);
        return docRef;
      })
      .catch((error) => {
        console.error('Error adding product to cart:', error);
        throw error;
      });
  }

  /** 
   * Retrieves the cart items for a specific user ID.
   * @param idNo - The user ID to fetch cart items for.
   * @returns An observable array of CartItems.
   */
  getCartItems(idNo: string): Observable<CartItem[]> {
    return this.firestore.collection<CartItem>('ShoppingCart', ref => 
      ref.where('idNo', '==', idNo)).valueChanges();
  }

  /** 
   * Removes an item from the cart by its cart ID.
   * @param cartID - The cart ID of the item to remove.
   * @returns A promise indicating the completion of the removal.
   */
  removeFromCart(cartID: number): Promise<void> {
    return this.firestore.collection('ShoppingCart', ref => 
        ref.where('cartID', '==', cartID).limit(1)
    ).get().toPromise()
    .then(snapshot => {
        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            return this.firestore.collection('ShoppingCart').doc(doc.id).delete();
        } else {
            console.error('No cart item found with the given cartID.');
            return Promise.reject('No cart item found');
        }
    })
    .then(() => console.log('Item removed from cart'))
    .catch(error => {
        console.error('Error removing item from cart:', error);
        throw error;
    });
  }

  /** 
   * Updates a cart item with new fields.
   * @param cartItemId - The ID of the cart item to update.
   * @param updatedFields - An object containing the fields to update.
   * @returns A promise indicating the completion of the update.
   */
  updateCartItem(cartItemId: string, updatedFields: Partial<CartItem>): Promise<void> {
    return this.firestore.collection('ShoppingCart').doc(cartItemId).update(updatedFields)
      .then(() => console.log('Cart item updated'))
      .catch((error) => console.error('Error updating cart item:', error));
  }

  /** 
   * Retrieves the inventory quantity by product code and variant code.
   * @param productCode - The product code to search for.
   * @param variantCode - The variant code to search for.
   * @returns An observable of the quantity or null.
   */
  getInventoryQuantityByProductCodeAndVariantCode(productCode: string, variantCode: string): Observable<number | null> {
    return this.firestore.collection('Inventory', ref => 
      ref.where('productCode', '==', productCode)).valueChanges()
      .pipe(
        map((products: any[]) => {
          if (products.length > 0) {
            const product = products[0] as Inventory; 
            // Further logic for variant code can be added here
          }
          return null; 
        })
      );
  }

  /** 
   * Retrieves the inventory quantity by product code, variant code, and size.
   * @param productCode - The product code to search for.
   * @param variantCode - The variant code to search for.
   * @param size - The size to search for.
   * @returns An observable of the quantity or null.
   */
  getInventoryQuantityByProductCodeAndVariantCodeAndSize(
    productCode: string,
    variantCode: string,
    size: string
  ): Observable<number | null> {
    return this.firestore.collection('Inventory', ref => 
      ref.where('productCode', '==', productCode)
         .where('code', '==', variantCode)
         .where('size', '==', size)
    ).valueChanges()
    .pipe(
      map((products: Inventory[]) => {
        if (products.length > 0) {
          const product = products[0]; // Get the first matching product
          return product.quantity; // Return the quantity directly from the product
        }
        return null; // Return null if no products found
      })
    );
  }

  /** 
   * Retrieves the lowest quantity for a product set.
   * @param productCode - The product code to search for.
   * @param selectedSize - Optional size to filter the results.
   * @returns An observable of the lowest quantity or null.
   */
  getLowestQuantityForSet(productCode: string, selectedSize: string = ''): Observable<number | null> {
    return this.firestore.collection<Inventory>('Inventory', ref => 
      ref.where('productCode', '==', productCode)).valueChanges()
      .pipe(
        map(inventories => {
            console.log('Fetched inventories for product code:', productCode, inventories);
            if (!inventories || inventories.length === 0) {
                console.log('No inventories found for product code:', productCode);
                return null;
            }

            let lowestQuantity: number | null = null;
            inventories.forEach(inventory => {
                console.log('Processing inventory:', inventory);
                // Additional logic to find the lowest quantity can be added here
            });

            console.log('Final lowest quantity for product code', productCode, ':', lowestQuantity);
            return lowestQuantity; // Return the lowest quantity found
        }),
        catchError(error => {
            console.error('Error fetching lowest quantity:', error);
            return of(null); // Return null on error
        })
    );
  }

  /** 
   * Sets the selected items in the service.
   * @param items - The array of CartItems to select.
   */
  setSelectedItems(items: CartItem[]): void {
    this.selectedItems = items;
  }

  /** 
   * Retrieves the currently selected items.
   * @returns An array of selected CartItems.
   */
  getSelectedItems(): CartItem[] {
    return this.selectedItems;
  }

  /** 
   * Clears the selected items after checkout.
   */
  clearSelectedItems(): void {
    this.selectedItems = [];
  }

  /** 
   * Retrieves the lowest quantity from multiple inventory IDs.
   * @param inventoryIDs - An array of inventory IDs to check.
   * @returns An observable of the lowest quantity or null.
   */
  getLowestQuantityForInventoryIDs(inventoryIDs: string[]): Observable<number | null> {
    return this.getInventoryItemByID(inventoryIDs).pipe(
      map(inventories => {
        if (!inventories || inventories.length === 0) {
          return null; // Return null if no inventories found
        }
  
        let lowestQuantity: number | null = null;
  
        inventories.forEach(inventory => {
          // Assuming `inventory` has a `quantity` field
          if (inventory.quantity !== undefined) {
            lowestQuantity = (lowestQuantity === null) ? inventory.quantity : Math.min(lowestQuantity, inventory.quantity);
          }
        });
  
        return lowestQuantity; // Return the lowest quantity found
      }),
      catchError(error => {
        console.error('Error fetching lowest quantity:', error);
        return of(null); // Return null on error
      })
    );
  }


/** 
 * Retrieves inventory items by their document IDs.
 * @param inventoryIDs - An array of inventory document IDs to fetch.
 * @returns An observable array of Inventory items.
 */
getInventoryItemByID(inventoryIDs: string[]): Observable<Inventory[]> {
  const inventoryDocs = inventoryIDs.map(id => 
    this.firestore.collection<Inventory>('Inventory').doc(id).valueChanges());
  
  return combineLatest(inventoryDocs); // Combine the observables into a single observable
}
}
