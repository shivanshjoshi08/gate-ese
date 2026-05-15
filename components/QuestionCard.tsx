"use client";

import { useState } from "react";
import type { Question } from "@/lib/types";
import { checkAnswer } from "@/lib/questions";
import { EXAM_COLORS } from "@/lib/exam";
import {
  recordAttempt,
  toggleBookmark,
  isBookmarked,
} from "@/lib/storage";

const LABELS = ["A", "B", "C", "D"];

interface QuestionCardProps {
  question: Question;
  onAnswered: (correct: boolean) => void;
  onNext: () => void;
  focusMode?: boolean;
}

export default function QuestionCard({
  question,
  onAnswered,
  onNext,
  focusMode = false,
}: QuestionCardProps) {
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [natInput, setNatInput] = useState("");
  const [msqSelected, setMsqSelected] = useState<number[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [shake, setShake] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const correctIndex =
    question.type === "mcq" ? (question.correct as number) : -1;

  const handleMcqClick = (index: number) => {
    if (answered) return;
    const correct = index === correctIndex;
    setSelected(index);
    setIsCorrect(correct);
    setAnswered(true);
    if (!correct) setShake(true);
    recordAttempt({
      questionId: question.id,
      userAnswer: index,
      correct,
      timestamp: Date.now(),
      subject: question.subject,
      topic: question.topic,
      exam: question.exam,
    });
    onAnswered(correct);
  };

  const handleNatCheck = () => {
    if (answered || !natInput.trim()) return;
    const correct = checkAnswer(question, natInput.trim());
    setIsCorrect(correct);
    setAnswered(true);
    if (!correct) setShake(true);
    recordAttempt({
      questionId: question.id,
      userAnswer: natInput.trim(),
      correct,
      timestamp: Date.now(),
      subject: question.subject,
      topic: question.topic,
      exam: question.exam,
    });
    onAnswered(correct);
  };

  const handleMsqToggle = (index: number) => {
    if (answered) return;
    setMsqSelected((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleMsqSubmit = () => {
    if (answered || msqSelected.length === 0) return;
    const correct = checkAnswer(question, msqSelected);
    setIsCorrect(correct);
    setAnswered(true);
    if (!correct) setShake(true);
    recordAttempt({
      questionId: question.id,
      userAnswer: msqSelected,
      correct,
      timestamp: Date.now(),
      subject: question.subject,
      topic: question.topic,
      exam: question.exam,
    });
    onAnswered(correct);
  };

  const handleBookmark = () => {
    const added = toggleBookmark(question.id);
    setBookmarked(added);
  };

  const getOptionClass = (index: number) => {
    const base =
      "w-full rounded-xl border-2 px-4 py-3 text-left text-base font-medium transition-all duration-150 ";
    if (!answered) {
      return (
        base +
        "border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50 cursor-pointer"
      );
    }
    if (question.type === "mcq") {
      if (index === correctIndex) {
        return base + "border-correct bg-correct text-white cursor-default animate-pulse-correct";
      }
      if (index === selected && index !== correctIndex) {
        return base + "border-wrong bg-wrong text-white cursor-default animate-shake";
      }
    }
    return base + "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60";
  };

  return (
    <div
      className={`mx-auto w-full max-w-2xl px-4 py-6 ${shake && !isCorrect ? "animate-shake" : ""}`}
      onAnimationEnd={() => setShake(false)}
    >
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-gray-500">
        <span
          className="rounded px-2 py-0.5 font-semibold text-white"
          style={{ backgroundColor: EXAM_COLORS[question.exam].accent }}
        >
          {question.exam}
        </span>
        {question.paper && (
          <span className="rounded bg-violet-400 px-2 py-0.5 font-medium text-white">
            {question.paper}
          </span>
        )}
        <span className="rounded bg-gray-100 px-2 py-0.5">{question.subject}</span>
        <span className="rounded bg-gray-100 px-2 py-0.5">{question.topic}</span>
        <span className="rounded bg-gray-100 px-2 py-0.5">{question.year}</span>
        <span className="rounded bg-gray-100 px-2 py-0.5">{question.marks} mark</span>
        <span className="rounded bg-gray-100 px-2 py-0.5">{question.difficulty}</span>
        <button
          type="button"
          onClick={handleBookmark}
          className="ml-auto text-lg"
          aria-label="Bookmark"
        >
          {bookmarked || isBookmarked(question.id) ? "⭐" : "☆"}
        </button>
      </div>

      <p className="mb-6 text-lg leading-relaxed text-gray-900 whitespace-pre-wrap">
        {question.question}
      </p>

      {question.type === "mcq" && (
        <div className="space-y-3">
          {question.options.map((opt, i) => (
            <button
              key={i}
              type="button"
              disabled={answered}
              onClick={() => handleMcqClick(i)}
              className={getOptionClass(i)}
            >
              <span className="mr-2 font-bold">{LABELS[i]}.</span>
              {opt}
              {answered && i === correctIndex && (
                <span className="float-right">✓</span>
              )}
              {answered && i === selected && i !== correctIndex && (
                <span className="float-right">✗</span>
              )}
            </button>
          ))}
        </div>
      )}

      {question.type === "nat" && (
        <div className="space-y-3">
          <input
            type="text"
            inputMode="decimal"
            value={natInput}
            onChange={(e) => setNatInput(e.target.value)}
            disabled={answered}
            placeholder="Enter your answer"
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
          />
          {!answered && (
            <button
              type="button"
              onClick={handleNatCheck}
              disabled={!natInput.trim()}
              className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Check
            </button>
          )}
          {answered && (
            <p className={`text-sm font-medium ${isCorrect ? "text-correct" : "text-wrong"}`}>
              Correct answer: {String(question.correct)}
              {isCorrect ? " ✓" : " ✗"}
            </p>
          )}
        </div>
      )}

      {question.type === "msq" && (
        <div className="space-y-3">
          {question.options.map((opt, i) => {
            const selectedMsq = msqSelected.includes(i);
            const correctArr = (question.correct as number[]) ?? [];
            const isCorrectOpt = correctArr.includes(i);
            let cls =
              "w-full rounded-xl border-2 px-4 py-3 text-left transition-all ";
            if (!answered) {
              cls += selectedMsq
                ? "border-blue-500 bg-blue-50 cursor-pointer"
                : "border-gray-200 hover:border-blue-400 cursor-pointer";
            } else if (isCorrectOpt) {
              cls += "border-correct bg-correct text-white";
            } else if (selectedMsq && !isCorrectOpt) {
              cls += "border-wrong bg-wrong text-white";
            } else {
              cls += "border-gray-200 bg-gray-100 opacity-60";
            }
            return (
              <button
                key={i}
                type="button"
                disabled={answered}
                onClick={() => handleMsqToggle(i)}
                className={cls}
              >
                <span className="mr-2 font-bold">{LABELS[i]}.</span>
                {opt}
              </button>
            );
          })}
          {!answered && (
            <button
              type="button"
              onClick={handleMsqSubmit}
              disabled={msqSelected.length === 0}
              className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Submit
            </button>
          )}
        </div>
      )}

      {answered && (
        <div className="mt-6 animate-slide-up rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h3 className="mb-2 font-semibold text-gray-800">Solution</h3>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
            {question.solution}
          </p>
        </div>
      )}

      {answered && (
        <button
          type="button"
          onClick={onNext}
          className="mt-6 w-full rounded-xl bg-gray-900 py-3 font-semibold text-white hover:bg-gray-800"
        >
          Next Question →
        </button>
      )}
    </div>
  );
}
