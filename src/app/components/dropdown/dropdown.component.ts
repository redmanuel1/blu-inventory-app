import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.scss'
})
export class DropdownComponent {
  @Input() inputWidth = ""
  @Input() placeholder = "Search for ..."
  @Input() tableRef = ""
  @Input() fieldRef = "" // is required if tableRef is defined
  @Input() dataArr = [];
  @Output() selectionChange = new EventEmitter<string | null>();

  searchTerm: string = '';
  selectedData: string | null = null;
  showDropdown: boolean = false;

  data: string[] = ["item 1", "item 2", "item 3"];
  filteredData: string[] = [...this.data]; 

  constructor(private recordService: FirestoreService) {
    recordService.collectionName = this.tableRef
  }

  ngOnInit() {
    this.recordService.collectionName = this.tableRef;
    console.log(this.fieldRef);
    if (this.tableRef && this.fieldRef) {
      this.recordService.getRecords().subscribe(dataArray => {
        this.data = dataArray.map(x => x[this.fieldRef]);
        this.filteredData = [...this.data];
        console.log(this.filteredData);
      });
    } else {
      this.data = this.dataArr;
      this.filteredData = [...this.data];
    }
  }


  filterData(): void {
    this.filteredData = this.data.filter(item =>
      item.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.showDropdown = this.filteredData.length > 0; // Show dropdown if there are results
  }

  selectData(record: string): void {
    this.selectedData = record;
    this.searchTerm = record; // Update searchTerm with selected data
    this.showDropdown = false; // Hide dropdown after selection
    this.selectionChange.emit(this.selectedData);
  }

   // Listen for clicks outside the component
   @HostListener('document:click', ['$event'])
   onClick(event: MouseEvent): void {
     const target = event.target as HTMLElement;
     const clickedInside = target.closest('.form-group');
 
     if (!clickedInside) {
       this.showDropdown = false; // Hide dropdown if clicked outside
     }
   }
}
