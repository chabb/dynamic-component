import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Compiler,
  Component,
  EventEmitter,
  Injector,
  NgModule,
  NgModuleRef,
  OnDestroy,
  Output, Renderer2,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {SimpleProjectedComponent} from './simple.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'otf-a-component',
  template: 'I am A component that inserts dynamic B component below: <div #vc>' +
    '</div>'
})

export class OTFAComponent implements OnDestroy, AfterViewInit  {
  @ViewChild('vc', {read: ViewContainerRef, static: false}) _container: ViewContainerRef;
  @Output() parentEmitter = new EventEmitter<string>();

  private readonly subs = [];

  constructor(private _compiler: Compiler,
              private _injector: Injector,
              private _m: NgModuleRef<any>,
              private renderer: Renderer2) {
  }

  ngAfterViewInit() {
    const template =
      `<div id="on-the-fly-generated" style="border:1px solid black;">
        <app-projected-cmp (click)="emitter.emit('clicked')"> 
          <div>  Provided by input -> {{name}}. You clicked {{count}} </div>
        </app-projected-cmp>
        <div class="first-content">
          <ng-content></ng-content>
        </div>
       <div class="second-content">
           <ng-content></ng-content>
        </div>
        <on-the-fly (secondEmitter)="onSecondEmitter($event)"></on-the-fly> 
     </div>`;
    const template2 = '<div style="border:2px solid red" (click)="secondEmitter.emit(\'you click in the red\')"> Another component</div>';
    const tmpCmp = Component({
      template,
      changeDetection: ChangeDetectionStrategy.OnPush})(generateComponent());
    const anotherComponent = Component ({
      selector: 'on-the-fly',
      template: template2,
      changeDetection: ChangeDetectionStrategy.OnPush})(generateAnotherComponent());
    const tmpModule = NgModule({  declarations: [tmpCmp, SimpleProjectedComponent, anotherComponent]})(class { });
    this._compiler.compileModuleAndAllComponentsAsync(tmpModule)
      .then((factories) => {
        const f = factories.componentFactories[0];
        const projectedElA = this.renderer.createElement('p');
        this.renderer.appendChild(projectedElA, this.renderer.createText('projectable content A'));
        const projectedElB = this.renderer.createElement('p');
        this.renderer.appendChild(projectedElB, this.renderer.createText('projectable content B'));
        const projectedElC = this.renderer.createElement('p');
        this.renderer.appendChild(projectedElC, this.renderer.createText('projectable content C'));
        const cmpRef = f.create(this._injector, [[projectedElA, projectedElB], [projectedElC]], null, this._m);
        cmpRef.instance.name = 'generated component';
        cmpRef.instance.count = 0;
        this._container.insert(cmpRef.hostView);
        cmpRef.instance.emitter = new EventEmitter<any>();
        // this is added on the fly, but this could have been added in the factory function
        cmpRef.instance.onSecondEmitter = (event) => console.log(event);
        this.subs.push(cmpRef.instance.emitter.subscribe((a: string) => {
          cmpRef.instance.count++;
          this.parentEmitter.emit(`Component clicked ${cmpRef.instance.count}`);
        }));
      });
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }
}


function generateComponent() {
  class Generated {
    // @Output() emitter = new EventEmitter<any>();
  }
  return Generated;
}


function generateAnotherComponent() {
  class Generated {
    @Output() secondEmitter = new EventEmitter<any>();
  }
  return Generated;
}

