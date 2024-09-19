import { Injectable, signal } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor(private firestore: AngularFirestore) { }

  // Method to get all products
  getProducts():  Observable<Product[]> {
    return this.firestore.collection<Product>('Products').valueChanges();
  }

  // Method to get a specific product by ID
  getProductById(productId: string): Observable<any> {
    return this.firestore.collection('Products').doc(productId).valueChanges();
  }

  getProductByCode(productCode: string): Observable<any> {
    return this.firestore.collection('Products', ref => ref.where('code', '==', productCode)).valueChanges().pipe(
      map(products => products.length > 0 ? products[0] : null)
    );
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
