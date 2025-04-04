import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { AlertService } from '../../../services/alert.service';
import { PayeeService } from '../../../services/payee.service';
import { Payee } from '../../../models/payee.model';
import {AuthService} from '../../../services/auth.service';
import { ChangeDetectorRef } from '@angular/core';
import {ButtonComponent} from '../../shared/button/button.component';
import {InputTextComponent} from '../../shared/input-text/input-text.component';


@Component({
  selector: 'app-recipients',
  standalone: true,
  imports: [FormsModule, NgIf, NgForOf, ButtonComponent, InputTextComponent],
  templateUrl: './recipients.component.html',
  styleUrl: './recipients.component.css'
})
export class RecipientsComponent implements OnInit {
  private payeeService = inject(PayeeService);
  private router = inject(Router);
  private alertService = inject(AlertService);
  private authService = inject(AuthService);
  recipients: Payee[] = [];
  newRecipient: Payee = { id: 0, name: '', accountNumber: '' };
  isAdding: boolean = false;
  editingRecipient: Payee | null = null;

  showDeleteModal: boolean = false;
  selectedRecipientId: number | null = null;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadRecipients();
  }
  // loadRecipients(): void {
  //   this.payeeService.getPayeesByClientId().subscribe({
  //     next: (response) => {
  //       this.recipients = [...response]; // Proverava format odgovora
  //       console.log(this.recipients);
  //     },
  //     error: () => {
  //       this.alertService.showAlert('error', 'Failed to load recipients from list.');
  //       this.recipients = [];
  //     }
  //   });
  // }
  // loadRecipients(): void {
  //   this.payeeService.getPayeesByClientId().subscribe({
  //     next: (response) => {
  //       console.log('API Response:', response); // Proveri šta API vraća
  //       if (!Array.isArray(response)) {
  //         console.error('Unexpected response format:', response);
  //         this.alertService.showAlert('error', 'Invalid response format.');
  //         return;
  //       }
  //       this.recipients = [...response];
  //     },
  //     error: (err) => {
  //       console.error('Error loading recipients:', err);
  //       this.alertService.showAlert('error', 'Failed to load recipients from list.');
  //       this.recipients = [];
  //     }
  //   });
  // }

  loadRecipients(): void {
    const timestamp = new Date().getTime(); // unique vrednost
    this.payeeService.getPayeesByClientId(timestamp).subscribe({
      next: (response) => {
        this.recipients = [...response];
      },
      error: (err) => {
        console.error('Error loading:', err);
        this.alertService.showAlert('error', 'Failed to load recipients.');
      }
    });
  }

  // addRecipient(): void {
  //   this.payeeService.createPayee(this.newRecipient).subscribe({
  //     next: (newPayee) => {
  //       this.alertService.showAlert('success', 'Recipient added successfully!');
  //       this.recipients = [...this.recipients, newPayee];
  //       this.newRecipient = { id: 0, name: '', accountNumber: '' };
  //       this.isAdding = false;
  //       this.cdr.detectChanges(); // Ručno osvežavanje prikaza
  //     },
  //     error: () => {
  //       this.alertService.showAlert('error', 'Failed to add recipient.');
  //     }
  //   });
  // }


  toggleAddRecipient(): void {
    this.isAdding = !this.isAdding;
  }
  startEditing(recipient: Payee): void {
    this.editingRecipient = { ...recipient };
  }

  cancelEditing(): void {
    this.editingRecipient = null;
  }

  // saveEdit(): void {
  //   if (!this.editingRecipient) return;
  //
  //   this.payeeService.updatePayee(this.editingRecipient.id, this.editingRecipient).subscribe({
  //     next: () => {
  //       this.alertService.showAlert('success', 'Recipient updated successfully!');
  //       this.recipients = this.recipients.map(r =>
  //         r.id === this.editingRecipient!.id ? { ...this.editingRecipient! } : r
  //       ); // Lokalno ažuriranje liste
  //       this.editingRecipient = null;
  //       this.cdr.detectChanges();
  //     },
  //     error: () => {
  //       this.alertService.showAlert('error', 'Failed to update recipient.');
  //     }
  //   });
  // }
  // deleteRecipient(id: number): void {
  //   if (confirm('Are you sure you want to delete this recipient?')) {
  //     this.payeeService.deletePayee(id).subscribe({
  //       next: () => {
  //         this.alertService.showAlert('success', 'Recipient deleted successfully!');
  //         this.loadRecipients();
  //       },
  //       error: () => {
  //         this.alertService.showAlert('error', 'Failed to delete recipient.');
  //       }
  //     });
  //   }
  // }

  addRecipient(): void {
    this.payeeService.createPayee(this.newRecipient).subscribe({
      next: () => {
        this.alertService.showAlert('success', 'Recipient added successfully!');
        this.loadRecipients(); // Refresh the list
        this.newRecipient = { id: 0, name: '', accountNumber: '' };
        this.isAdding = false;
      },
      error: (err) => {
        console.error('Error adding recipient:', err);
        this.alertService.showAlert('error', 'Failed to add recipient.');
      }
    });
  }

  saveEdit(): void {
    if (!this.editingRecipient) return;

    this.payeeService.updatePayee(this.editingRecipient.id, this.editingRecipient)
      .subscribe({
        next: () => {
          this.alertService.showAlert('success', 'Recipient updated successfully!');
          this.loadRecipients(); // rifres
          this.editingRecipient = null;
        },
        error: (err) => {
          console.error('Error updating recipient:', err);
          this.alertService.showAlert('error', 'Failed to update recipient.');
        }
      });
  }

  // deleteRecipient(id: number): void {
  //   if (confirm('Are you sure?')) {
  //     this.payeeService.deletePayee(id).subscribe({
  //       next: () => {
  //         this.alertService.showAlert('success', 'Recipient deleted!');
  //         this.loadRecipients();
  //       },
  //       error: (err) => {
  //         console.error('Error deleting:', err);
  //         this.alertService.showAlert('error', 'Delete failed.');
  //       }
  //     });
  //   }
  // }

  openDeleteModal(id: number): void {
    this.selectedRecipientId = id;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.selectedRecipientId = null;
  }

  confirmDelete(): void {
    if (this.selectedRecipientId) {
      this.deleteRecipient(this.selectedRecipientId);
    }
    this.showDeleteModal = false;
  }
  deleteRecipient(id: number): void {
    this.payeeService.deletePayee(id).subscribe({
      next: () => {
        this.alertService.showAlert('success', 'Recipient deleted successfully!');
        this.loadRecipients();
      },
      error: () => {
        this.alertService.showAlert('error', 'Failed to delete recipient.');
      }
    });
  }

}
