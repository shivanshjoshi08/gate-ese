"use client";

import React, { useMemo } from "react";
import EquationBlock from "./EquationBlock";

interface LatexTextProps {
  text: string;
  className?: string;
}

export default function LatexText({ text, className = "" }: LatexTextProps) {
  const parts = useMemo(() => {
    if (!text) return null;
    
    // Regex matches $$...$$ or $...$ 
    // Capture groups:
    // 1: block math inside $$ $$
    // 2: inline math inside $ $
    const regex = /\$\$([\s\S]+?)\$\$|\$([\s\S]+?)\$/g;
    const result: React.ReactNode[] = [];
    let lastIndex = 0;
    
    let match;
    let key = 0;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        result.push(
          <span key={key++}>
            {text.substring(lastIndex, match.index)}
          </span>
        );
      }
      
      if (match[1] !== undefined) {
        // Block math
        result.push(<EquationBlock key={key++} latex={match[1]} displayMode={true} />);
      } else if (match[2] !== undefined) {
        // Inline math
        result.push(<EquationBlock key={key++} latex={match[2]} displayMode={false} />);
      }
      
      lastIndex = regex.lastIndex;
    }
    
    if (lastIndex < text.length) {
      result.push(
        <span key={key++}>
          {text.substring(lastIndex)}
        </span>
      );
    }
    
    return result;
  }, [text]);

  return <span className={`latex-text whitespace-pre-wrap ${className}`}>{parts}</span>;
}
