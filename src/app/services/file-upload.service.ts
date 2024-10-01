import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  constructor(private storage: AngularFireStorage, private firestore: AngularFirestore) {}

  uploadFile(file: File): Observable<string> {
    const filePath = `uploads/documents/${Date.now()}_${file.name}`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);

    return new Observable<string>((observer) => {
      task.snapshotChanges()
        .pipe(finalize(() => fileRef.getDownloadURL().subscribe(url => {
          observer.next(url);
          observer.complete();
        })))
        .subscribe();
    });
  }

  saveImageMetadata(metadata: any): Promise<any> {
    return this.firestore.collection('images').add(metadata);
  }
}
