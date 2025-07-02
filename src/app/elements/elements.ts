import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ElementsStore } from '../store/elements.store';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  MatDialog,
  MatDialogModule,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { PeriodicElement } from '../models/periodic-element.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-elements',
  imports: [
    MatTableModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './elements.html',
  styleUrl: './elements.scss',
  standalone: true,
})
export class Elements implements OnInit {
  store = inject(ElementsStore);
  readonly dialog = inject(MatDialog);

  displayedColumns = ['position', 'name', 'weight', 'symbol', 'edit'];
  readonly filteredData = computed(() => this.store.currentElements());
  value = signal('');

  changedValue(event: Event) {
    const input = (event.target as HTMLInputElement).value;
    this.store.filter(input);
  }

  ngOnInit() {
    this.store.loadData();
  }

  openDialog(element: PeriodicElement) {
    this.dialog.open(Dialog, {
      data: { element: element },
    });
  }
}

@Component({
  selector: 'dialog',
  templateUrl: './dialog.html',
  styleUrl: './dialog.scss',
  imports: [
    MatDialogModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
})
export class Dialog {
  private fb = inject(FormBuilder);
  store = inject(ElementsStore);
  dialogData = inject(MAT_DIALOG_DATA);
  position = this.dialogData.element.position;
  name = this.dialogData.element.name;
  weight = this.dialogData.element.weight;
  symbol = this.dialogData.element.symbol;

  readonly form = this.fb.group({
    position: [{ value: this.position, disabled: true }, Validators.required],
    name: [this.name, Validators.required],
    weight: [
      this.weight,
      [Validators.required, Validators.min(0), Validators.max(200)],
    ],
    symbol: [this.symbol, [Validators.required, Validators.maxLength(2)]],
  });

  save() {
    if (this.form.valid) {
      const formData = this.form.getRawValue() as PeriodicElement;
      this.store.edit(formData);
    } else {
      console.log('Form is invalid');
      this.form.markAllAsTouched();
    }
  }
}
