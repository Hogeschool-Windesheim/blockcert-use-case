import {MatDialogRef} from '@angular/material/dialog';
import {Component, ViewEncapsulation} from '@angular/core';

@Component({
    selector: 'dfw-blocking-dialog',
    template: `
        <h3 class="dialog-title">{{ options.title }}</h3>
        <div *ngIf="options.body" class="dialog-body">
            <p [innerHTML]="options.body"></p>
        </div>
        <div *ngIf="options.buttonText" class="dialog-button-container">
            <button mat-button (click)="dialogRef.close()">
                {{ options.buttonText }}
            </button>
        </div>
    `,
    styleUrls: ['./dialog.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class BlockingDialogComponent {
    options: {title: string, body: string, buttonText: string} = {title: 'No title', body: null, buttonText: 'Ok'};

    constructor(public dialogRef: MatDialogRef<BlockingDialogComponent>) {
        dialogRef.disableClose = true;
    }
}
