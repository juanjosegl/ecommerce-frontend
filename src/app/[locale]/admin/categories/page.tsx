"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { CategoryFormDialog } from "@/components/admin/category-form-dialog";
import {
  getCategories,
  deleteCategory,
  type Category,
} from "@/lib/api/categories";

function flattenCategories(categories: Category[], depth = 0): (Category & { depth: number })[] {
  return categories.flatMap((cat) => [
    { ...cat, depth },
    ...(cat.children ? flattenCategories(cat.children, depth + 1) : []),
  ]);
}

export default function AdminCategoriesPage() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(
    null,
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadCategories = () => {
    getCategories().then(setCategories);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = () => {
    setEditingCategory(null);
    setDialogOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteCategory(deletingId);
      toast.success(t("deleteSuccess"));
      loadCategories();
    } catch {
      toast.error(t("deleteSuccess"));
    } finally {
      setDeletingId(null);
    }
  };

  const flatCategories = categories ? flattenCategories(categories) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("categoriesTitle")}</h1>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4" />
          {t("newCategory")}
        </Button>
      </div>

      {categories === null && <Skeleton className="h-64 w-full" />}

      {categories !== null && (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("categoryName")}</TableHead>
                <TableHead className="hidden md:table-cell">
                  {t("categoryDescription")}
                </TableHead>
                <TableHead>{t("productsCount")}</TableHead>
                <TableHead className="text-right">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flatCategories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell
                    style={{ paddingLeft: `${1 + cat.depth * 1.5}rem` }}
                  >
                    {cat.depth > 0 && "— "}
                    {cat.name}
                  </TableCell>
                  <TableCell className="hidden max-w-xs truncate md:table-cell">
                    {cat.description ?? "—"}
                  </TableCell>
                  <TableCell>{cat._count?.products ?? 0}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleEdit(cat)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setDeletingId(cat.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CategoryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editingCategory}
        categories={flatCategories}
        onSuccess={loadCategories}
      />

      <AlertDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteConfirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              {t("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}