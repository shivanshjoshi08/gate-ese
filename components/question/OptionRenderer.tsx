"use client";



import type { QuestionOption } from "@/lib/question-types";

import RichContentRenderer from "./RichContentRenderer";



const LABELS = ["A", "B", "C", "D", "E", "F"];



interface OptionRendererProps {

  option: QuestionOption;

  index: number;

  selected?: boolean;

  correct?: boolean;

  wrong?: boolean;

  disabled?: boolean;

  onClick?: () => void;

  showResult?: boolean;

}



export default function OptionRenderer({

  option,

  index,

  selected = false,

  correct = false,

  wrong = false,

  disabled = false,

  onClick,

  showResult = false,

}: OptionRendererProps) {

  const label = option.label || LABELS[index] || String(index + 1);



  let cls =

    "option-renderer w-full rounded-2xl border-2 px-4 py-3.5 text-left text-study-ink transition-all duration-150 ";

  if (!disabled && !showResult) {
    if (selected) {
      cls +=
        "border-sky-500/80 bg-sky-500/12 cursor-pointer shadow-[0_0_0_1px_rgba(56,189,248,0.2)]";
    } else {
      cls +=
        "border-study-border bg-study-raised/60 hover:border-sky-400/45 hover:bg-sky-500/[0.07] hover:shadow-[0_0_0_1px_rgba(56,189,248,0.15)] cursor-pointer";
    }
  } else if (correct) {

    cls +=

      "border-emerald-400 bg-emerald-600/95 cursor-default text-white [&_.qb-content]:text-white [&_.qb-content_*]:text-white [&_.qb-content_code]:bg-white/20 [&_.qb-content_code]:text-white [&_.qb-content_pre]:bg-study-raised [&_.qb-content_pre]:text-study-ink";

  } else if (wrong) {

    cls +=

      "border-rose-400 bg-rose-600/95 cursor-default text-white [&_.qb-content]:text-white [&_.qb-content_*]:text-white [&_.qb-content_code]:bg-white/20 [&_.qb-content_code]:text-white [&_.qb-content_pre]:bg-study-raised [&_.qb-content_pre]:text-study-ink";

  } else if (selected) {

    cls +=

      "border-sky-500/80 bg-sky-500/15 cursor-default shadow-[0_0_0_1px_rgba(56,189,248,0.2)]";

  } else {

    cls +=

      "border-study-border/60 bg-study-surface/35 text-study-muted opacity-65";

  }



  return (

    <button

      type="button"

      disabled={disabled}

      onClick={onClick}

      className={cls}

    >

      <span className="mr-2 font-bold">{label}.</span>

      <RichContentRenderer content={option.body} />

      {showResult && correct && (

        <span className="float-right ml-2">✓</span>

      )}

      {showResult && wrong && (

        <span className="float-right ml-2">✗</span>

      )}

    </button>

  );

}

