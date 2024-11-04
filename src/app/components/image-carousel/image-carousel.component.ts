import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-image-carousel',
  templateUrl: './image-carousel.component.html',
  styleUrl: './image-carousel.component.scss'
})
export class ImageCarouselComponent implements OnInit {
  @Input() images: string[] = [];
  @Input() width='100px';
  @Input() height ='100px';
  currentImageIndex: number = 0;

  ngOnInit() {
    console.log('Received images:', this.images); // Check if images are received
  }

  get imageCount(): number {
    return this.images.length || 0;
  }

  nextImage(): void {
    if(this.imageCount>0){
      if (this.currentImageIndex < this.imageCount - 1) {
        this.currentImageIndex++;
      } else {
        this.currentImageIndex = 0; // Loop back to the first image
      }
    }
  }

  previousImage(): void {
    if(this.imageCount>0){
      if (this.currentImageIndex > 0) {
        this.currentImageIndex--;
      } else {
        this.currentImageIndex = this.imageCount - 1; // Loop to the last image
      }
    }
  }
}
