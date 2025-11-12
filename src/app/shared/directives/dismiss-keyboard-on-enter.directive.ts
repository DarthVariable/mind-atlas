import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appDismissKeyboardOnEnter]',
  standalone: true
})
export class DismissKeyboardOnEnterDirective {

  @HostListener('keydown.enter', ['$event'])
  onEnterKey(event: Event): void {
    event.preventDefault();
    const target = event.target as HTMLElement;
    if (target && typeof target.blur === 'function') {
      target.blur();
    }
  }
}
