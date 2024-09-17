import { Component, Input, SimpleChanges } from '@angular/core';
import { TableColumn, ColumnType } from 'src/app/models/util/table.model';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent {
  @Input() title: string = 'Table Title'
  @Input() dataColumns: TableColumn[]
  @Input() data: any[]

  // displayedData: any[]

  // ngOnChanges(changes: SimpleChanges): void {
  //   if (changes['data']) {
  //     this.displayedData = changes['data'].currentValue;
  //   }
  // }
  ngOnInit() {
    console.log(this.data);
  }
}
