import type { OrderStatus } from "@/lib/api/orders";

/** The happy path an order walks through; CANCELLED sits outside it. */
export const ORDER_FLOW: OrderStatus[] = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

/** Mirrors backend orders/order-status.ts so the admin only offers valid moves. */
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export const orderStatusClass: Record<OrderStatus, string> = {
  PENDING: "bg-muted text-muted-foreground",
  CONFIRMED: "bg-accent text-accent-foreground",
  PROCESSING: "bg-accent text-accent-foreground",
  SHIPPED: "bg-primary/10 text-primary",
  DELIVERED: "bg-success/12 text-success",
  CANCELLED: "bg-destructive/10 text-destructive",
};
