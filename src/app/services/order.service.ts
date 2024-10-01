import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, Observable } from 'rxjs';
import { Order } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private firestore: AngularFirestore) { }

  getOrders():  Observable<Order[]> {
    return this.firestore.collection<Order>('Orders', ref => ref.orderBy('orderDate')).snapshotChanges()
    .pipe(
      map(orderArr => orderArr.map(
        order => {
          const data = order.payload.doc.data() as Order;
          const id = order.payload.doc.id;
          return {id, ...data};
        }
      ))
    );
  }
  getOrderByOrderNo(orderNo: string): Observable<Order> {
    return this.firestore.collection<Order>('Orders', ref => ref.where('orderNo', '==', orderNo)).valueChanges().pipe(
      map(orders => orders.length > 0 ? orders[0] : null)
    );
  }
}
