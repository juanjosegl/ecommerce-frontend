"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CreateUserDialog } from "@/components/admin/create-user-dialog";
import {
  getUsers,
  updateUserRole,
  deactivateUser,
  type AdminUser,
} from "@/lib/api/users";
import { formatDate } from "@/lib/format";
import { useAuthStore } from "@/stores/auth-store";

export default function AdminUsersPage() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const tAuth = useTranslations("auth");
  const locale = useLocale();
  const currentUser = useAuthStore((state) => state.user);

  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);

  const loadUsers = () => {
    getUsers().then(setUsers);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (
    userId: string,
    role: "ADMIN" | "CUSTOMER",
  ) => {
    try {
      await updateUserRole(userId, role);
      toast.success(t("userUpdated"));
      loadUsers();
    } catch {
      toast.error(tAuth("genericError"));
    }
  };

  const handleDeactivate = async () => {
    if (!deactivatingId) return;
    try {
      await deactivateUser(deactivatingId);
      toast.success(t("userDeactivated"));
      loadUsers();
    } catch {
      toast.error(tAuth("genericError"));
    } finally {
      setDeactivatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("usersTitle")}</h1>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          {t("newUser")}
        </Button>
      </div>

      {users === null && <Skeleton className="h-64 w-full" />}

      {users !== null && (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{tAuth("email")}</TableHead>
                <TableHead className="hidden md:table-cell">
                  {t("provider")}
                </TableHead>
                <TableHead className="hidden sm:table-cell">
                  {t("date")}
                </TableHead>
                <TableHead>{t("role")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead className="text-right">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <p className="font-medium">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {user.provider}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {formatDate(user.createdAt, locale)}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(value) =>
                        handleRoleChange(user.id, value as "ADMIN" | "CUSTOMER")
                      }
                      disabled={user.id === currentUser?.id}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CUSTOMER">
                          {t("roleCustomer")}
                        </SelectItem>
                        <SelectItem value="ADMIN">{t("roleAdmin")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.isActive ? "secondary" : "destructive"}
                    >
                      {user.isActive ? t("active") : t("inactive")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={!user.isActive || user.id === currentUser?.id}
                      onClick={() => setDeactivatingId(user.id)}
                    >
                      {t("deactivate")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CreateUserDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={loadUsers}
      />

      <AlertDialog
        open={!!deactivatingId}
        onOpenChange={(open) => !open && setDeactivatingId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deactivateConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deactivateConfirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeactivate}>
              {tCommon("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
