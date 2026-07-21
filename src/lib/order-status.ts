export const orderStatusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline",
  CONFIRMED: "secondary",
  PROCESSING: "secondary",
  SHIPPED: "default",
  DELIVERED: "default",
  CANCELLED: "destructive",
};

export const orderStatusColor: Record<string, string> = {
  PENDING: "text-muted-foreground",
  CONFIRMED: "text-blue-600 dark:text-blue-400",
  PROCESSING: "text-amber-600 dark:text-amber-400",
  SHIPPED: "text-primary",
  DELIVERED: "text-primary",
  CANCELLED: "text-destructive",
};