import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IArea } from '../area'

const HorzOffset: number = 5; // TODO : derieve from image and handle size
const VertOffset: number = -29;

@Component({
  selector: 'app-ire-main-area-delete',
  styles : [`
.delete-area {
  position: absolute;
  cursor: pointer;
  padding: 5px;
}

.select-areas-delete-area {
  background:  url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wcBDzEPeJ7iMQAAAlhJREFUOMuFU89PE1EQ/t6PZemW7i4JlErKxXDgJk3kIgnyB5hYjJrGxIP/jYneGyQx8WjUGJWLclATQki4G1IR1hZhC7Sw7L5ddvvjeSirbSH6TV4y8zLzzbyZecAlKBRuxyo9PygU8vgv7j24+0e/PjM98vrNq43FpeLGjdmZ0fj+fpcPAPBuY2pyamxxqXgrldIfDpvmzelrOdRqR2CcVfMLCyvCD16WNkvLAA7iGBIrT54+nsjn76xpmpb1Ax9EAp9WPiKMIszNzeH4pI4oiuA4p5Uvn7/OLhafVXoqSCaHrjDGs3pKRzI5BCE8zM/PQwQ+PM8FIKEoHJSSiUw6nQHQS1Aul4Vlbbcc55iNjI5CH0pBVVUIIXDM67BtGwfVKmr1enN3/5e40IPVtdXDbDZ7lMlkxprNJtzkKXzfh3PqwPM8uK4L27axvbNTq9rVowsEYRiSXC5H9uw9VCoVGKYBa8dCQkvAsiwoigJPCGiaRrp71zMFKSW0hAZd1zE+Po5GowHDMOA4DrjCEZ6dQfaNnvbvAiEd8na7DSklANmV7yL+EshOMCEEBATyXDjnIP9g6KpAgnOlk40A5FwY5x2bEEgpMaAMXL6JnicGoyik8SMp7XBzpoBSCsYYVFVFG5IeHhwO9ldAKuVdpfS91DIMHY1mhDAMYZgGoiiEaZpgjMIcHobjOM2trR9KPAkWM0VRw33/7sNbdVDV0yPpBB/gLUZpeOI4QRAE7v7e/u76+vry86UXj4QnfgJo9fyFPiQmJ6+aIESljIBSGm5+K50ACPodfwNunPVuPPnisAAAAABJRU5ErkJggg==');
  cursor: pointer;
  height: 16px;
  width: 16px;
}
`],
  template: `
<div class="delete-area" [ngStyle]="style">
  <div class="select-areas-delete-area"></div>
</div>
`
})
export class IreMainAreaDeleteComponent {
  @Input() area: IArea;

  constructor() { }

  private get style(): any {
    return  {  'position': 'absolute',
               'cursor': 'pointer',
               'left': `${ this.area.x + this.area.width + HorzOffset }px`,
               'top': `${ this.area.y + VertOffset }px`,
               'z-index': 1 };
  }
}
