import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

type Common = {
  id: string;
  label: string;
  help?: string;
  invalid?: boolean;
  icon?: React.ReactNode;
};

export function TextField({
  id, label, value, onChange, onBlur, placeholder, type = "text",
  icon, invalid, help,
}: Common & {
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
}) {
  return (
    <div className="space-y-1.5">
      <div className="relative group">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </span>
        )}
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          type={type}
          placeholder=" "
          className={[
            icon ? "pl-9" : "",
            "peer rounded-xl bg-background",
            "border transition-shadow focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary",
            "shadow-sm focus:shadow-md",
          ].join(" ")}
          aria-invalid={invalid || undefined}
        />
        <Label
          htmlFor={id}
          className={[
            "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 transition-all",
            icon ? "left-9" : "left-3",
            "bg-card px-1",
            "peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-muted-foreground",
            "peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-foreground",
            "text-xs",
            invalid ? "text-red-600" : "",
          ].join(" ")}
        >
          {label}
        </Label>
      </div>
      <AnimatePresence>
        {help && (
          <motion.p
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            className={`text-xs ${invalid ? "text-red-600" : "text-muted-foreground"}`}
          >
            {help}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export function PasswordField({
  id, label, value, onChange, onBlur, show, setShow, invalid, help,
}: Common & {
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  show: boolean;
  setShow: (v: boolean) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="relative group">
        <Input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder=" "
          className="peer rounded-xl bg-background border transition-shadow focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary shadow-sm focus:shadow-md pr-10"
          aria-invalid={invalid || undefined}
        />
        <Label
          htmlFor={id}
          className={[
            "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 transition-all",
            "bg-card px-1 text-xs",
            "peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-muted-foreground",
            "peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-foreground",
            invalid ? "text-red-600" : "",
          ].join(" ")}
        >
          {label}
        </Label>
        <button
          type="button"
          aria-label={show ? "Hide password" : "Show password"}
          onClick={() => setShow(!show)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground hover:text-foreground"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      <AnimatePresence>
        {help && (
          <motion.p
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            className={`text-xs ${invalid ? "text-red-600" : "text-muted-foreground"}`}
          >
            {help}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* Single-file input */
export function FileRowSingle({
  id, label, icon, onChange, accept,
}: Common & { onChange: (f: File | null) => void; accept?: string }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </span>
        )}
        <input
          id={id}
          type="file"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
          accept={accept}
          className={`block w-full rounded-xl border bg-background px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-primary-foreground hover:file:bg-primary/90 ${icon ? "pl-9" : ""}`}
        />
      </div>
    </div>
  );
}

/* Multi-file input */
export function FileRowMulti({
  id, label, icon, onChange, accept,
}: Common & { onChange: (f: FileList) => void; accept?: string }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </span>
        )}
        <input
          id={id}
          type="file"
          multiple
          onChange={(e) => e.target.files && onChange(e.target.files)}
          accept={accept}
          className={`block w-full rounded-xl border bg-background px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-primary-foreground hover:file:bg-primary/90 ${icon ? "pl-9" : ""}`}
        />
      </div>
    </div>
  );
}
