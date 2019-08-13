import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BooksService } from 'src/app/auth/books.service';
import { Subscription } from 'rxjs';
import { Book } from 'src/app/models/Book.model';
import * as $ from 'jquery';


@Component({
  selector: 'app-admin-books',
  templateUrl: './admin-books.component.html',
  styleUrls: ['./admin-books.component.css']
})
export class AdminBooksComponent implements OnInit, OnDestroy {
  // (2)
  bookForm: FormGroup;
  books: Book[];
  booksSubscription: Subscription;
  
  editBook: boolean = false;

  photoUploading: boolean = false;
  photoUploaded: boolean = false;
  photosAdded: any[] = [];




  constructor(
      // (1) import a private formBuilder and books service
    private formBuilder: FormBuilder,
    private booksService: BooksService
  ) { }

  ngOnInit() {
    this.initForm();


    this.booksSubscription = this.booksService.booksSubject.subscribe(
      (books: Book[]) =>{
        this.books = books;
        console.log(books);
      }
    );
    this.booksService.getBooks();
    this.booksService.emitBooks();
  }


  initForm() {
    this.bookForm = this.formBuilder.group({
      id: '',
      title: ['', Validators.required],
      category: ['', Validators.required],
      description: '',
      price: ['', Validators.required]

    });
  }

onSaveBook(){
  const id = this.bookForm.get('id').value;
  const title = this.bookForm.get('title').value;
  const category = this.bookForm.get('category').value;
  const description = this.bookForm.get('description').value;
  const price = this.bookForm.get('price').value;
  const photos = this.photosAdded ? this.photosAdded : [];

  const newBook = new Book(title, category, description, price, photos);
  console.log(newBook);

  if (this.editBook == true) {
    this.booksService.updateBook(newBook, id);
  }else {
    this.booksService.createBook(newBook);
  }
  $('booksFormModal').modal('hide');
    this.onResetForm();
  }

  onDeleteBook(book: Book) {
    if (book.photos) {
      book.photos.forEach(photo =>{
        this.booksService.removeBookPhoto(photo);
      });
    }
    this.booksService.removeBook(book);
  }

  onEditBook(book: Book, id: number) {
    this.editBook = true;
    $('#booksFormModal').modal('show');
    this.bookForm.get('id').setValue(id);
    this.bookForm.get('title').setValue(book.title);
    this.bookForm.get('category').setValue(book.category);
    this.bookForm.get('description').setValue(book.description);
    this.bookForm.get('price').setValue(book.price);
    this.photosAdded = book.photos;
  }

  onResetForm(){
    this.editBook = false;
    this.bookForm.reset();
    this.photosAdded = [];
    this.photoUploading = false;
    this.photoUploaded = false;
  }
  deleteFile(event){
    this.photoUploading = true;
    this.photosAdded = this.photosAdded ? this.photosAdded : [];
    this.booksService.uploadFile(event.target.file[0]).then(
      (url: string) =>{
        this.photosAdded.push(url);
        this.photoUploading = false;
        this.photoUploaded = true;

      }
    );
  }

 onRemoveAddedPhoto(id: number){
   this.booksService.removeBookPhoto(this.photosAdded[id]);
   this.photosAdded.splice(id, 1);
 }

 ngOnDestroy(){
   this.booksSubscription.unsubscribe();
 }

}
