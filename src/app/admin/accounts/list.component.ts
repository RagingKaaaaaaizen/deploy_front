import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';

import { AccountService } from '@app/_services';
import { Account } from '@app/_models';

@Component({ templateUrl: 'list.component.html' })
export class ListComponent implements OnInit {
    accounts: any[];

    constructor(private accountService: AccountService, private router: Router) {}


    ngOnInit() {
    this.accountService.getAll()
      .pipe(first())
      .subscribe(accounts => {
        console.log('Mapped Accounts:', accounts); // Debug: should show isActive correctly
        this.accounts = accounts;
      });
  }


    viewAccount(id: string) {
        this.router.navigate(['/admin/accounts/view', id]);
    }

    deleteAccount(id: string) {
        const account = this.accounts.find(x => x.id === id);
        account.isDeleting = true;
        this.accountService.delete(id)
            .pipe(first())
            .subscribe(() => {
                this.accounts = this.accounts.filter(x => x.id !== id) 
            });
    }
}