import { Injectable } from '@angular/core';
import * as ExifReader from 'exifreader';
import { Observable, Subscriber } from 'rxjs';

import { ImageModel } from '../models/image';

/**
 * Service to upload image.
 */
@Injectable({ providedIn: 'root' })
export class ImageService {
  /**
   * Load image with correct orientation.
   * @param file - Image file.
   */
  public loadImage(file: File): Observable<ImageModel> {
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);

    return new Observable<ImageModel>((subscriber) => {
      fileReader.onload = () => {
        const tags = ExifReader.load(fileReader.result as ArrayBuffer, { expanded: true }).exif;
        this.getCorrectImageModel(file, tags, subscriber);
      };
    });
  }

  private getCorrectImageModel(file: File, tags: ExifReader.Tags, subscriber: Subscriber<ImageModel>): void {
    const fileReader = new FileReader();
    fileReader.onloadend = () => {
      /*
        If Orientation tag wasn't received and the ExifReader had worked correctly
        it's not a JPG image and we don't have to rotate it
      */
      const imageModel = new ImageModel({
        url: fileReader.result as string,
        rotate: this.getRotateProps((tags && tags.Orientation)
          ? tags.Orientation.value
          : 1,
        ),
      });
      subscriber.next(imageModel);
      subscriber.complete();
    };
    fileReader.readAsDataURL(file);
  }

  private getRotateProps(value: number): string {
    switch (value) {
      case 1:
        return 'rotate(0deg)';
      case 3:
        return 'rotate(180deg)';
      case 6:
        return 'rotate(90deg)';
      case 8:
        return 'rotate(270deg)';
      default:
        return 'rotate(0deg)';
    }
  }
}
