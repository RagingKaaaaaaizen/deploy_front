import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  templateUrl: './skeleton.component.html',
  styleUrls: ['./skeleton.component.css']
})
export class SkeletonComponent {
  @Input() type: 'text' | 'title' | 'avatar' | 'button' | 'card' | 'table' | 'form' = 'text';
  @Input() lines: number = 1;
  @Input() width: string = '100%';
  @Input() height: string = '1rem';
  @Input() className: string = '';

  get linesArray(): number[] {
    return Array.from({ length: this.lines }, (_, i) => i);
  }
}
