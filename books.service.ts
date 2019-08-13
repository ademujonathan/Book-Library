import { Injectable } from '@angular/core';
import { Book } from '../models/Book.model';
import { Subject } from 'rxjs';
import * as firebase from 'firebase/app';





@Injectable({
  providedIn: 'root'
})
export class BooksService {
  books: Book[] = [];
  booksSubject = new Subject<Book[]>();

  constructor() { }
  emitBooks() {
    this.booksSubject.next(this.books);
  }
  getBooks() {
    firebase.database().ref('/books').on('value', (data) =>{
      this.books = data.val() ? data.val() : [];
      this.emitBooks();
    }); 
  }
  getSingleBook(id: number) {
    return new Promise(
      (resolve, reject) => {
        firebase.database().ref('/books/' + id).once("value").then(
          (data) =>{
            resolve(data.val());
          },
          (error) => {
            reject(error);

          }
        );
      }
    );
  }

saveBooks(){
  firebase.database().ref('/books').set(this.books);
}


createBook(newBook: Book) {
  this.books.push(newBook);
  this.saveBooks();
  this.emitBooks();
}


removeBook(book: Book) {
  const index = this.books.findIndex(
    (bookEl) => {
      if (bookEl === book){
        return true;
      }
    }
  );
  this.books.splice(index, 1);
  this.saveBooks();
  this.emitBooks();
  }
updateBook(book: Book, id: number) {
  firebase.database().ref('/books' + id).update(book);
}

uploadFile(file: File) {
  return new Promise(
    (resolve, reject) => {
      const uniqueId = Date.now().toString();
      const upload = firebase.storage().ref().child('image/books' + uniqueId + file.name).put(file);
      upload.on(firebase.storage.TaskEvent.STATE_CHANGED,
        () => {
          console.log('loading...');
        },
        (error) =>{
          console.error('Error ! : ' + error);
          reject();
        },
        () => {
          resolve(upload.snapshot.ref.getDownloadURL());
  
        });

    });
}

removeBookPhoto(photoLink: string){
  const storageRef = firebase.storage().refFromURL(photoLink);
  storageRef.delete().then(
    () => {
      console.log('File deleted');
    }
  ). catch(
    (error) => {
      console.error('File not found : ' + error);
    });

}
}
