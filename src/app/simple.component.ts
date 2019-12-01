import { Component } from '@angular/core';

@Component({
  selector: 'app-projected-cmp',
  template: `<div>
    <ng-content></ng-content>
  </div>
  `
})
export class SimpleProjectedComponent { }
