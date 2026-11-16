"use client";

import { useState } from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { useTranslations } from "next-intl";
import { Eye, EyeOff } from "lucide-react";
import { Field, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  type?: "text" | "email" | "password" | "tel";
  placeholder?: string;
  autoComplete?: string;
  description?: string;
  multiline?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}

/** Labelled input wired to react-hook-form; zod messages are keys under "validation". */
export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  type = "text",
  placeholder,
  autoComplete,
  description,
  multiline,
  inputMode,
}: FormFieldProps<T>) {
  const t = useTranslations("validation");
  const tAuth = useTranslations("auth");
  const [reveal, setReveal] = useState(false);
  const isPassword = type === "password";

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const errorId = `${field.name}-error`;
        const common = {
          ...field,
          value: field.value ?? "",
          id: field.name,
          placeholder,
          "aria-invalid": fieldState.invalid,
          "aria-describedby": fieldState.error ? errorId : undefined,
        };
        return (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
            {multiline ? (
              <Textarea {...common} rows={3} />
            ) : (
              <div className="relative">
                <Input
                  {...common}
                  type={isPassword && reveal ? "text" : type}
                  autoComplete={autoComplete}
                  inputMode={inputMode}
                  className={isPassword ? "pr-10" : undefined}
                />
                {isPassword && (
                  <button
                    type="button"
                    onClick={() => setReveal((r) => !r)}
                    aria-label={tAuth(reveal ? "hidePassword" : "showPassword")}
                    aria-pressed={reveal}
                    className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    {reveal ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                )}
              </div>
            )}
            {description && !fieldState.error && (
              <FieldDescription>{description}</FieldDescription>
            )}
            {fieldState.error?.message && (
              <FieldError id={errorId}>
                {t.has(fieldState.error.message)
                  ? t(fieldState.error.message)
                  : t("invalid")}
              </FieldError>
            )}
          </Field>
        );
      }}
    />
  );
}
