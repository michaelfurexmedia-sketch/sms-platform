"use client";
import { downloadCSV } from "@/frontend/scheduling";
import Link from "./navigation";
import { Modal as FoundationModal } from "@/components/ui";
import {
  useId,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type ButtonHTMLAttributes,
} from "react";
import {
  MessageSquare,
  X,
  Check,
  ArrowUpRight,
  Plus,
  Search,
  Mail,
  Phone,
  Users,
  LayoutDashboard,
  Inbox,
  Send,
  CreditCard,
  Settings,
  ShieldCheck,
  Building2,
  LogOut,
  Menu,
  FileText,
  ChevronRight,
  Download,
  Calendar,
  CircleHelp,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { brand, money, date } from "@/lib/config";
import type { Receipt } from "@/lib/model";
export {
  MessageSquare,
  X,
  Check,
  ArrowUpRight,
  Plus,
  Search,
  Mail,
  Phone,
  Users,
  LayoutDashboard,
  Inbox,
  Send,
  CreditCard,
  Settings,
  ShieldCheck,
  Building2,
  LogOut,
  Menu,
  FileText,
  ChevronRight,
  Download,
  Calendar,
  CircleHelp,
  CheckCircle2,
  AlertCircle,
};
export function Logo() {
  return (
    <Link className="logo" href="/" aria-label={`${brand.name} home`}>
      {brand.logo ? (
        <img src={brand.logo} width={32} height={32} alt="" />
      ) : (
        <span className="brand-mark">
          <MessageSquare size={22} />
          <span />
        </span>
      )}
      {brand.wordmark}
    </Link>
  );
}
export function Button({
  children,
  variant = "primary",
  className = "",
  busy = false,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  busy?: boolean;
}) {
  return (
    <button
      className={`btn ${variant} ${className}`}
      type={type}
      {...props}
      disabled={busy || props.disabled}
      aria-busy={busy || undefined}
    >
      {children}
    </button>
  );
}
export function ActionLink({
  href,
  children,
  secondary = false,
}: {
  href: string;
  children: ReactNode;
  secondary?: boolean;
}) {
  return (
    <Link href={href} className={`btn ${secondary ? "secondary" : "primary"}`}>
      {children}
    </Link>
  );
}
export function Badge({ children }: { children: ReactNode }) {
  const value = String(children);
  const tone = [
    "Approved",
    "Subscribed",
    "Paid",
    "Delivered",
    "Active",
    "Completed",
    "Verified",
  ].includes(value)
    ? "good"
    : [
          "Failed",
          "Opted out",
          "Invalid number",
          "Changes needed",
          "Canceled",
        ].includes(value)
      ? "bad"
      : [
            "In review",
            "Draft",
            "Scheduled",
            "Lead",
            "Invited",
            "Paused",
          ].includes(value)
        ? "warm"
        : "neutral";
  return <span className={`badge ${tone}`}>{children}</span>;
}
export function Field({
  label,
  children,
  hint,
  error,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  error?: string;
}) {
  const id = useId();
  const control = isValidElement(children)
    ? (children as ReactElement<{
        id?: string;
        "aria-describedby"?: string;
        "aria-invalid"?: boolean;
      }>)
    : null;
  const described =
    [
      control?.props["aria-describedby"],
      hint ? id + "-hint" : null,
      error ? id + "-error" : null,
    ]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <label className="field">
      <span>{label}</span>
      {control
        ? cloneElement(control, {
            "aria-describedby": described,
            "aria-invalid": error ? true : control.props["aria-invalid"],
          })
        : children}
      {hint && <small id={id + "-hint"}>{hint}</small>}
      {error && (
        <small id={id + "-error"} className="error-text">
          {error}
        </small>
      )}
    </label>
  );
}
export function Empty({
  icon,
  title,
  children,
  action,
}: {
  icon?: ReactNode;
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      {icon && <div className="empty-icon">{icon}</div>}
      <h3>{title}</h3>
      <p>{children}</p>
      {action}
    </div>
  );
}
export function Heading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="heading">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
export function Notice({
  children,
  tone = "info",
}: {
  children: ReactNode;
  tone?: "info" | "error" | "success";
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`notice ${tone}`}
    >
      {tone === "error" ? <AlertCircle size={18} /> : <CircleHelp size={18} />}
      <div>{children}</div>
    </div>
  );
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <FoundationModal open title={title} onClose={onClose}>
      {children}
    </FoundationModal>
  );
}
export function ReceiptView({
  receipt,
  onClose,
}: {
  receipt: Receipt;
  onClose: () => void;
}) {
  return (
    <Modal title="Payment receipt" onClose={onClose}>
      <div className="receipt">
        <Logo />
        <p>
          Simulated payment <Badge>Paid</Badge>
        </p>
        <small>
          Receipt {receipt.id.slice(0, 8)}
          <br />
          {date(receipt.at)}
        </small>
        {receipt.lines.map((l, i) => (
          <div className="receipt-row" key={i}>
            <span>
              {l.label}
              <small>
                {l.quantity} × {money(l.unitCents)}
              </small>
            </span>
            <b>{money(l.unitCents * l.quantity)}</b>
          </div>
        ))}
        <div className="receipt-row total">
          <b>Total paid</b>
          <b>{money(receipt.totalCents)}</b>
        </div>
        <p>Pay as you go. No renewal scheduled.</p>
        <p className="muted">
          This is a prototype receipt. No money was charged.
        </p>
        <Button variant="secondary" onClick={() => window.print()}>
          <Download size={16} /> Print receipt
        </Button>
      </div>
      <Button
        variant="secondary"
        onClick={() =>
          downloadCSV("invoice-demo.csv", [
            ["Description", "Quantity", "Unit cents"],
            ...receipt.lines.map((l) => [l.label, l.quantity, l.unitCents]),
            ["Total cents", 1, receipt.totalCents],
          ])
        }
      >
        Download invoice
      </Button>
    </Modal>
  );
}
