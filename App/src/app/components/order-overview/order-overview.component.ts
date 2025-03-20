import { Component, OnInit, OnDestroy } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { Order, PageResponse } from '../../models/order.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-order-overview',
  templateUrl: './order-overview.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./order-overview.component.css']
})
export class OrderOverviewComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  filterStatus: string = 'All';
  cancelQuantity: { [orderId: number]: number } = {};
  loading: boolean = false;
  errorMessage: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private orderService: OrderService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAdmin()) {
      this.errorMessage = "Access denied. Only supervisors can access this portal.";
      return;
    }
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.errorMessage = '';

    this.orderService.getOrders(this.filterStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (page) => {
          this.orders = page.content;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching orders', err);
          this.errorMessage = 'Failed to load orders. Please try again later.';
          this.loading = false;
        }
      });
  }

  onFilterChange(): void {
    this.loadOrders();
  }

  approveOrder(order: Order): void {
    this.orderService.approveOrder(order.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.handleSuccess(`Order ${order.id} approved`),
        error: (err) => this.handleError('approving order', err)
      });
  }

  cancelOrder(order: Order): void {
    const quantity = this.cancelQuantity[order.id] || 0;

    if (quantity < 1 || quantity > order.remainingPortions) {
      this.errorMessage = `Quantity must be between 1 and ${order.remainingPortions}`;
      return;
    }

    this.orderService.cancelOrder(order.id, quantity)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.handleSuccess(`Order ${order.id} cancelled for quantity: ${quantity}`),
        error: (err) => this.handleError('cancelling order', err)
      });
  }

  private handleSuccess(message: string): void {
    alert(message);
    this.loadOrders();
  }

  private handleError(action: string, error: any): void {
    console.error(`Error ${action}`, error);
    this.errorMessage = `Error ${action}. Please try again.`;
  }

  isOrderExpired(order: Order): boolean {
    if (!order.isTimeLimited) return false;
    const orderDate = new Date(order.orderDate).getTime();
    return Date.now() > orderDate;
  }

  declineOrder(order: Order) {

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
