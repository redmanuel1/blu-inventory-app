import { Injectable, signal } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor(private firestore: AngularFirestore) { }

  // Method to get all products
  getProducts(): Observable<any[]> {
    return this.firestore.collection('Products').valueChanges();
  }

  // Method to get a specific product by ID
  getProductById(productId: string): Observable<any> {
    return this.firestore.collection('Products').doc(productId).valueChanges();
  }

  // Method to add a product
  addProduct(product: any): Promise<void> {
    const id = this.firestore.createId();
    return this.firestore.collection('Products').doc(id).set(product);
  }

  // Method to update a product
  updateProduct(productId: string, product: any): Promise<void> {
    return this.firestore.collection('Products').doc(productId).update(product);
  }

  // Method to delete a product
  deleteProduct(productId: string): Promise<void> {
    return this.firestore.collection('Products').doc(productId).delete();
  }
}
