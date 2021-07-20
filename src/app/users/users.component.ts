import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {ModalDismissReasons, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, NgForm } from '@angular/forms';

export class User {
  constructor(
    public id: number,
    public name: string,
    public email: string,
    public phone: string,
    public password: string,
  ) {
  }
}

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  userList:User[]=[];
  closeResult!:string;
  editForm!: FormGroup;
  private deleteId!:number;

  constructor( private httpClient: HttpClient,
     private modalService: NgbModal,
     private fb: FormBuilder
     ) { }

  ngOnInit(): void {
    this.getAllUsers();
    this.editForm = this.fb.group({
      id:[''],
      name:[''],
      email:[''],
      phone:[''],
      password:['']
    })
  }
  getAllUsers(){
    this.httpClient.get<any>('http://localhost:8081/api/user/list-full').subscribe(
      response => {
        console.log(response);
        this.userList = response;
      }
    );
  }


open(content: any) {
  this.modalService.open(content).result.then((result) => {
    this.closeResult = `Closed with: ${result}`;
    console.log("result",this.closeResult);
  }, (reason) => {
    this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    console.log("dismissed",this.closeResult);
  });
}

private getDismissReason(reason: any): string {
  if (reason === ModalDismissReasons.ESC) {
    return 'by pressing ESC';
  } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
    return 'by clicking on a backdrop';
  } else {
    return `with: ${reason}`;
  }
}

onSubmit(newF:NgForm){
  const url ='http://localhost:8081/api/user';
  this.httpClient.post(url, newF.value).subscribe(result=>{
    this.ngOnInit();//reload the table
  });
  this.modalService.dismissAll();//dismiss the modal
}

openDetails(targetModal: any, user: User) {
  this.modalService.open(targetModal, {
   centered: true,
   size: 'lg'
 });
  document.getElementById('dname')?.setAttribute('value',user.name);
  document.getElementById('demail')?.setAttribute('value',user.email);
  document.getElementById('dphone')?.setAttribute('value',user.phone);
}

openEdit(targetModal:any, user: User){
  this.modalService.open(targetModal, {
    centered: true,
    size: 'lg'
  });
  this.editForm.patchValue({
    id:user.id,
    name: user.name,
    email:user.email,
    phone: user.phone,
    password: user.password,
  })
}
onSave(){
  const editURL = 'http://localhost:8081/api/user/' + this.editForm.value.id ;
  console.log(this.editForm.value);
  this.httpClient.put(editURL, this.editForm.value)
  .subscribe((results)=>{
    this.ngOnInit();
    this.modalService.dismissAll();
  })
 
}

openDelete(targetModal:any, user: User){
    this.deleteId = user.id;
  this.modalService.open(targetModal, {
    backdrop: 'static',
    size: 'lg'
  })
}
onDelete(){
  const deleteURL = 'http://localhost:8081/api/user/' +this.deleteId ;
  this.httpClient.delete(deleteURL)
    .subscribe(()=>{
      this.modalService.dismissAll();
      this.ngOnInit();
    })
}
}
