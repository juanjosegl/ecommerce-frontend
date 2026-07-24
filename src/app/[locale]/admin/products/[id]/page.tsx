"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { z } from "zod";
import { Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { AddVariantDialog } from "@/components/admin/add-variant-dialog";
import { ImageManager } from "@/components/admin/image-manager";
import {
  getProductById,
  updateProduct,
  updateVariant,
  type Product,
} from "@/lib/api/products";
import { getCategories, type Category } from "@/lib/api/categories";
import { formatCurrency } from "@/lib/format";

function flattenCategories(
  categories: Category[],
  depth = 0,
): (Category & { depth: number })[] {
  return categories.flatMap((c) => [
    { ...c, depth },
    ...(c.children ? flattenCategories(c.children, depth + 1) : []),
  ]);
}

const basicInfoSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  categoryId: z.string().min(1),
  isActive: z.boolean(),
});

type BasicInfoFormData = z.infer<typeof basicInfoSchema>;

export default function EditProductPage() {
  const t = useTranslations("admin");
  const tAuth = useTranslations("auth");
  const tCommon = useTranslations("common");
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);

  const { control, handleSubmit, reset } = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      name: "",
      description: "",
      categoryId: "",
      isActive: true,
    },
  });

  const loadProduct = () => {
    getProductById(productId).then((data) => {
      setProduct(data);
      reset({
        name: data.name,
        description: data.description ?? "",
        categoryId: data.categoryId,
        isActive: data.isActive,
      });
    });
  };

  useEffect(() => {
    loadProduct();
    getCategories().then(setCategories);
  }, [productId]);

  const onSubmitBasicInfo = async (data: BasicInfoFormData) => {
    try {
      await updateProduct(productId, data);
      toast.success(t("productUpdated"));
      loadProduct();
    } catch {
      toast.error(tAuth("genericError"));
    }
  };

  const handleVariantPriceChange = async (
    variantId: string,
    price: number,
  ) => {
    try {
      await updateVariant(variantId, { price });
      toast.success(t("variantSaved"));
      loadProduct();
    } catch {
      toast.error(tAuth("genericError"));
    }
  };

  const handleVariantActiveToggle = async (
    variantId: string,
    isActive: boolean,
  ) => {
    try {
      await updateVariant(variantId, { isActive });
      loadProduct();
    } catch {
      toast.error(tAuth("genericError"));
    }
  };

  if (!product) {
    return <Skeleton className="h-96 w-full" />;
  }

  const flatCategories = flattenCategories(categories);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("editProduct")}</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("productName")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmitBasicInfo)}
            className="space-y-4"
          >
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>
                    {t("productName")}
                  </FieldLabel>
                  <Input {...field} id={field.name} />
                </Field>
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>
                    {t("productDescription")}
                  </FieldLabel>
                  <Textarea {...field} id={field.name} rows={3} />
                </Field>
              )}
            />

            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t("category")}</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {flatCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {"— ".repeat(cat.depth)}
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />

            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-2">
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <FieldLabel>
                    {field.value ? t("active") : t("inactive")}
                  </FieldLabel>
                </div>
              )}
            />

            <Button type="submit">{tCommon("save")}</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">{t("variants")}</CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setVariantDialogOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            {t("addVariant")}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("sku")}</TableHead>
                  <TableHead>{t("variants")}</TableHead>
                  <TableHead>{t("price")}</TableHead>
                  <TableHead>{t("stock")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {product.variants.map((variant) => (
                  <TableRow key={variant.id}>
                    <TableCell className="font-mono text-xs">
                      {variant.sku}
                    </TableCell>
                    <TableCell>
                      {Object.values(variant.attributes).join(" / ")}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        defaultValue={variant.price}
                        className="w-24"
                        onBlur={(e) =>
                          handleVariantPriceChange(
                            variant.id,
                            parseFloat(e.target.value),
                          )
                        }
                      />
                    </TableCell>
                    <TableCell>{variant.stock}</TableCell>
                    <TableCell>
                      <Switch
                        checked={variant.isActive}
                        onCheckedChange={(checked) =>
                          handleVariantActiveToggle(variant.id, checked)
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("images")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageManager
            productId={product.id}
            images={product.images}
            onChange={loadProduct}
          />
        </CardContent>
      </Card>

      <AddVariantDialog
        open={variantDialogOpen}
        onOpenChange={setVariantDialogOpen}
        productId={product.id}
        onSuccess={loadProduct}
      />
    </div>
  );
}