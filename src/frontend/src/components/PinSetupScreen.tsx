import { useCallback, useEffect, useRef, useState } from "react";
import { savePin } from "../utils/pinAuth";

const PIN_POSITIONS = [0, 1, 2, 3] as const;
type PinPos = (typeof PIN_POSITIONS)[number];

interface PinSetupScreenProps {
  onComplete: () => void;
}

export default function PinSetupScreen({ onComplete }: PinSetupScreenProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [firstPin, setFirstPin] = useState("");
  const [digits, setDigits] = useState<string[]>(["", "", "", ""]);
  const [mismatch, setMismatch] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const focusFirst = useCallback(() => {
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
  }, []);

  // Focus on initial mount only
  useEffect(() => {
    focusFirst();
  }, [focusFirst]);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }, []);

  const reset = useCallback(() => {
    setStep(1);
    setFirstPin("");
    setDigits(["", "", "", ""]);
    setMismatch(false);
    // focus is handled separately via the mount effect or explicit call
  }, []);

  const handleChange = useCallback(
    async (index: PinPos, value: string) => {
      if (!/^\d?$/.test(value)) return;
      const newDigits = [...digits];
      newDigits[index] = value;
      setDigits(newDigits);
      setMismatch(false);
      if (value && index < 3) {
        inputRefs.current[index + 1]?.focus();
      }
      if (value && index === 3) {
        const pin = newDigits.join("");
        if (pin.length === 4) {
          if (step === 1) {
            setFirstPin(pin);
            setStep(2);
            setDigits(["", "", "", ""]);
            // Focus first input of step 2
            setTimeout(() => inputRefs.current[0]?.focus(), 50);
          } else {
            if (pin === firstPin) {
              await savePin(pin);
              onComplete();
            } else {
              setMismatch(true);
              triggerShake();
              setTimeout(() => {
                reset();
                setTimeout(() => inputRefs.current[0]?.focus(), 60);
              }, 800);
            }
          }
        }
      }
    },
    [digits, step, firstPin, onComplete, triggerShake, reset],
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
      data-ocid="pin_setup.page"
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
        <div className="flex gap-2">
          {([1, 2] as const).map((s) => (
            <div
              key={s}
              className="w-2 h-2 rounded-full transition-all"
              style={{ background: step >= s ? gold : goldBorder }}
            />
          ))}
        </div>
        <div className="text-center">
          <h1
            className="text-xl font-light tracking-tight"
            style={{ fontFamily: "'Fraunces', Georgia, serif", color: gold }}
          >
            {step === 1 ? "Ustaw PIN" : "Potwierdź PIN"}
          </h1>
          <p className="text-xs mt-1" style={{ color: navyLight }}>
            {step === 1
              ? "Wpisz 4-cyfrowy PIN dostępu"
              : "Wpisz ten sam PIN jeszcze raz"}
          </p>
        </div>
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
              className="w-14 h-14 text-center text-xl font-semibold rounded-lg outline-none transition-all"
              style={{
                background: "oklch(0.16 0.05 265)",
                border: mismatch
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
          {mismatch && (
            <p
              className="text-sm"
              style={{ color: "oklch(0.7 0.2 20)" }}
              data-ocid="pin_setup.error_state"
            >
              PINy się nie zgadzają, spróbuj ponownie
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
    </div>
  );
}
