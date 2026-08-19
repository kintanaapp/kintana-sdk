"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import {
  PHONE_COUNTRIES,
  PHONE_FALLBACK_DIAL,
  defaultDialFromCountryHint,
  formatPhoneE164,
  isoForDialCode,
  parsePhoneE164,
} from "../phone-countries";

function FlagImg({ iso }: { iso: string }) {
  return (
    <img
      src={`https://flagcdn.com/w40/${iso}.png`}
      alt=""
      width={28}
      height={20}
      style={{ display: "block", width: 28, height: 20, objectFit: "cover", flexShrink: 0 }}
    />
  );
}

export type PhoneInputProps = {
  /** Full E.164 value, e.g. +447911123456 */
  value?: string;
  onChange?: (value: string) => void;
  /** Hidden input name for native form submission */
  name?: string;
  id?: string;
  /** Country name, ISO code, or dial code hint for the default picker */
  defaultCountry?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};

export function PhoneInput({
  value,
  onChange,
  name,
  id,
  defaultCountry,
  required,
  disabled,
  placeholder = "412 345 678",
  className,
}: PhoneInputProps) {
  const hintDial = React.useMemo(() => defaultDialFromCountryHint(defaultCountry), [defaultCountry]);
  const parsed = React.useMemo(() => parsePhoneE164(value), [value]);
  const [dialCode, setDialCode] = React.useState(parsed.dialCode || hintDial);
  const [national, setNational] = React.useState(parsed.national);
  const [open, setOpen] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [menuRect, setMenuRect] = React.useState<{ left: number; top: number } | null>(null);

  React.useEffect(() => {
    const next = parsePhoneE164(value);
    setDialCode(next.dialCode || hintDial);
    setNational(next.national);
  }, [value, hintDial]);

  React.useEffect(() => {
    if (!defaultCountry) return;
    if (!value?.trim()) setDialCode(hintDial);
  }, [defaultCountry, hintDial, value]);

  const emit = React.useCallback(
    (nextDial: string, nextNational: string) => {
      onChange?.(formatPhoneE164(nextDial, nextNational));
    },
    [onChange]
  );

  React.useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setMenuRect({ left: rect.left, top: rect.bottom + 4 });
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const hiddenValue = formatPhoneE164(dialCode, national);
  const borderColor = focused ? "var(--kintana-phone-focus, #2563eb)" : "var(--kintana-phone-border, #d4d4d4)";

  return (
    <div className={className ? `kintana-phone-field ${className}` : "kintana-phone-field"}>
      {name ? <input type="hidden" name={name} value={hiddenValue} required={required && !hiddenValue} /> : null}
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          width: "100%",
          minWidth: 0,
          boxSizing: "border-box",
          border: `1px solid ${borderColor}`,
          borderRadius: "0.25rem",
          background: disabled ? "#f5f5f5" : "#fff",
          boxShadow: focused ? "0 0 0 1px var(--kintana-phone-focus, #2563eb)" : undefined,
        }}
        onFocusCapture={() => setFocused(true)}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
        }}
      >
        <button
          ref={triggerRef}
          type="button"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          aria-label="Country code"
          title="Country code"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 0.5rem",
            border: 0,
            background: "transparent",
            cursor: disabled ? "not-allowed" : "pointer",
            flexShrink: 0,
          }}
        >
          <FlagImg iso={isoForDialCode(dialCode)} />
        </button>
        <span
          aria-hidden
          style={{
            display: "flex",
            alignItems: "center",
            paddingRight: "0.25rem",
            fontSize: "0.875rem",
            color: "#525252",
            flexShrink: 0,
          }}
        >
          {dialCode}
        </span>
        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          value={national}
          onChange={(e) => {
            const next = e.target.value.replace(/[^\d\s()-]/g, "");
            setNational(next);
            emit(dialCode, next);
          }}
          style={{
            flex: 1,
            minWidth: 0,
            border: 0,
            background: "transparent",
            padding: "0.375rem 0.75rem 0.375rem 0",
            font: "inherit",
            fontSize: "0.875rem",
            color: "#171717",
            outline: "none",
          }}
        />
      </div>
      {open && menuRect && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={menuRef}
              role="listbox"
              aria-label="Country code"
              style={{
                position: "fixed",
                zIndex: 9999,
                left: menuRect.left,
                top: menuRect.top,
                width: 144,
                maxHeight: 192,
                overflow: "auto",
                borderRadius: 4,
                border: "1px solid #e5e5e5",
                background: "#fff",
                boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                padding: "0.25rem 0",
              }}
            >
              {PHONE_COUNTRIES.map(({ code, iso }) => (
                <button
                  key={code}
                  type="button"
                  role="option"
                  aria-selected={code === dialCode}
                  onClick={() => {
                    setDialCode(code);
                    setOpen(false);
                    emit(code, national);
                  }}
                  style={{
                    display: "flex",
                    width: "100%",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.375rem 0.75rem",
                    border: 0,
                    background: code === dialCode ? "#f5f5f5" : "transparent",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    textAlign: "left",
                  }}
                >
                  <FlagImg iso={iso} />
                  <span style={{ color: "#525252" }}>{code}</span>
                </button>
              ))}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
