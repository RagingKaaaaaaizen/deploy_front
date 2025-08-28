import { Component, OnInit } from '@angular/core';

@Component({ templateUrl: 'overview.component.html' })
export class OverviewComponent implements OnInit {
  loading = false;

  ngOnInit() {
    // Set loading state
    this.loading = true;
    
    // Simulate loading time
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }
}