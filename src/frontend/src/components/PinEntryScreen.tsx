import { useCallback, useEffect, useRef, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { clearPin, verifyPin } from "../utils/pinAuth";

const PIN_POSITIONS = [0, 1, 2, 3] as const;
type PinPos = (typeof PIN_POSITIONS)[number];

interface PinEntryScreenProps {
  onSuccess: () => void;
}

export default function PinEntryScreen({ onSuccess }: PinEntryScreenProps) {
  const { clear, login, loginStatus, identity } = useInternetIdentity();
  const [digits, setDigits] = useState<string[]>(["", "", "", ""]);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [needsIILogin, setNeedsIILogin] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (needsIILogin && loginStatus === "success" && identity) {
      setNeedsIILogin(false);
      onSuccess();
    }
  }, [needsIILogin, loginStatus, identity, onSuccess]);

  const focusFirst = useCallback(() => {
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
  }, []);

  useEffect(() => {
    focusFirst();
  }, [focusFirst]);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }, []);

  const handleChange = useCallback(
    async (index: PinPos, value: string) => {
      if (!/^\d?$/.test(value)) return;
      const newDigits = [...digits];
      newDigits[index] = value;
      setDigits(newDigits);
      setError(false);
      if (value && index < 3) {
        inputRefs.current[index + 1]?.focus();
      }
      if (value && index === 3) {
        const pin = newDigits.join("");
        if (pin.length === 4) {
          setVerifying(true);
          const correct = await verifyPin(pin);
          setVerifying(false);
          if (correct) {
            if (identity) {
              onSuccess();
            } else {
              setNeedsIILogin(true);
              login();
            }
          } else {
            setError(true);
            triggerShake();
            setDigits(["", "", "", ""]);
            focusFirst();
          }
        }
      }
    },
    [digits, identity, onSuccess, login, triggerShake, focusFirst],
  );

  const handleKeyDown = useCallback(
    (index: PinPos, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace") {
        if (digits[index] === "" && index > 0) {
          const newDigits = [...digits];
          newDigits[index - 1] = "";
          setDigits(newDigits);
          inputRefs.current[index - 1]?.focus();
        } else {
          const newDigits = [...digits];
          newDigits[index] = "";
          setDigits(newDigits);
        }
      }
    },
    [digits],
  );

  const handleReset = () => {
    clearPin();
    clear();
  };

  const gold = "oklch(0.75 0.12 80)";
  const goldDim = "oklch(0.75 0.12 80 / 0.6)";
  const goldBorder = "oklch(0.75 0.12 80 / 0.3)";
  const navyLight = "oklch(0.55 0.05 265)";

  const shakeStyle: React.CSSProperties = shake
    ? { animation: "pin-shake 0.4s ease-in-out" }
    : {};

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "oklch(0.18 0.06 265)" }}
      data-ocid="pin_entry.page"
    >
      <style>{`
        @keyframes pin-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
      <div
        className="w-full max-w-sm rounded-2xl px-8 py-10 flex flex-col items-center gap-6"
        style={{
          background: "oklch(0.22 0.07 265)",
          border: `1px solid ${goldBorder}`,
          boxShadow: "0 24px 64px oklch(0 0 0 / 0.5)",
        }}
      >
        <img
          src="/assets/generated/parish-logo.dim_300x300.png"
          alt="Logo Parafii"
          className="w-24 h-24 object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <div className="text-center">
          <p
            className="text-xs uppercase tracking-widest"
            style={{ color: navyLight, letterSpacing: "0.15em" }}
          >
            Parafia św. Jana Chrzciciela
          </p>
          <p className="text-xs" style={{ color: navyLight }}>
            w Zbroszy Dużej
          </p>
        </div>
        <h1
          className="text-2xl font-light tracking-tight text-center"
          style={{ fontFamily: "'Fraunces', Georgia, serif", color: gold }}
        >
          Wprowadź PIN
        </h1>
        <div className="flex gap-3" style={shakeStyle}>
          {PIN_POSITIONS.map((pos) => (
            <input
              key={`pin-${pos}`}
              ref={(el) => {
                inputRefs.current[pos] = el;
              }}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digits[pos]}
              onChange={(e) => handleChange(pos, e.target.value)}
              onKeyDown={(e) => handleKeyDown(pos, e)}
              disabled={verifying}
              className="w-14 h-14 text-center text-xl font-semibold rounded-lg outline-none transition-all"
              style={{
                background: "oklch(0.16 0.05 265)",
                border: error
                  ? "2px solid oklch(0.6 0.2 20)"
                  : digits[pos]
                    ? `2px solid ${gold}`
                    : `2px solid ${goldBorder}`,
                color: gold,
                fontFamily: "'Fraunces', Georgia, serif",
                caretColor: gold,
              }}
            />
          ))}
        </div>
        <div className="h-5 text-center">
          {error && (
            <p
              className="text-sm"
              style={{ color: "oklch(0.7 0.2 20)" }}
              data-ocid="pin_entry.error_state"
            >
              Nieprawidłowy PIN
            </p>
          )}
          {verifying && (
            <p className="text-xs" style={{ color: goldDim }}>
              Sprawdzanie...
            </p>
          )}
          {needsIILogin && loginStatus === "logging-in" && (
            <p className="text-xs" style={{ color: goldDim }}>
              Odnawianie sesji...
            </p>
          )}
        </div>
        <p
          className="text-center text-xs italic leading-relaxed"
          style={{ color: goldDim }}
        >
          „On musi wzrastać, ja zaś się umniejszać.”
          <span
            className="block not-italic"
            style={{ color: "oklch(0.55 0.05 265)" }}
          >
            (J 3,30)
          </span>
        </p>
      </div>
      <button
        type="button"
        onClick={handleReset}
        className="mt-6 text-xs transition-opacity hover:opacity-100 opacity-50"
        style={{ color: navyLight }}
        data-ocid="pin_entry.button"
      >
        Zresetuj PIN
      </button>
    </div>
  );
}
