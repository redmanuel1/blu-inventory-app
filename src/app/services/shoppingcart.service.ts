import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference } from '@angular/fire/compat/firestore';
import { CartItem } from '../models/shoppingcart.model'; 
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShoppingCartService {

  constructor(private firestore: AngularFirestore) { }

  // Method to add a product to the shopping cart
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

  // Method to retrieve the cart items
  getCartItems(): Observable<CartItem[]> {
    return this.firestore.collection<CartItem>('ShoppingCart').valueChanges();
  }

  // Method to remove an item from the cart by its document ID
  removeFromCart(cartItemId: string): Promise<void> {
    return this.firestore.collection('ShoppingCart').doc(cartItemId).delete()
      .then(() => console.log('Item removed from cart'))
      .catch((error) => console.error('Error removing item from cart:', error));
  }

  // Method to update quantity or other fields of an item in the cart
  updateCartItem(cartItemId: string, updatedFields: Partial<CartItem>): Promise<void> {
    return this.firestore.collection('ShoppingCart').doc(cartItemId).update(updatedFields)
      .then(() => console.log('Cart item updated'))
      .catch((error) => console.error('Error updating cart item:', error));
  }
}
