import React from 'react';
import { ProcessStepId } from './processData.ts';
import { ProcessStepActivationState } from './processMotion.ts';

interface StepIllustrationProps {
  stepId: ProcessStepId;
  activation: ProcessStepActivationState;
}

function ConversationIllustration() {
  return (
    <svg
      viewBox="0 0 184 74"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {/* Tiny editorial exchange spark */}
      <path
        className="proc-c1-spark"
        d="M 91 7 L 92.6 11 L 96.6 12.6 L 92.6 14.2 L 91 18.2 L 89.4 14.2 L 85.4 12.6 L 89.4 11 Z"
        fill="#FB0C72"
      />

      {/* Left Dialogue Bubble — Pastel Pink + Hot Pink hand-drawn outline */}
      <g className="proc-c1-b1">
        <path
          d="M 24 14 Q 54 12 82 14 Q 90 15 90 26 Q 90 39 81 41 L 46 41 L 32 48 L 35 41 Q 22 41 21 29 Q 20 16 24 14 Z"
          fill="#F2BED6"
          stroke="#FB0C72"
          strokeWidth="1.85"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          className="proc-c1-line1"
          pathLength={1}
          d="M 33 24 Q 50 23 71 24"
          stroke="#FB0C72"
          strokeWidth="2.1"
          strokeLinecap="round"
        />
        <path
          className="proc-c1-line2"
          pathLength={1}
          d="M 33 32 Q 45 31.4 58 32"
          stroke="#000000"
          strokeWidth="1.85"
          strokeLinecap="round"
        />
      </g>

      {/* Right Dialogue Bubble — Aqua + Black hand-drawn outline */}
      <g className="proc-c1-b2">
        <path
          d="M 95 28 Q 125 26 155 28 Q 163 29 163 41 Q 163 54 152 56 L 146 56 L 151 64 L 136 56 Q 105 57 95 54 Q 88 49 89 40 Q 89 30 95 28 Z"
          fill="#A5DCD1"
          stroke="#000000"
          strokeWidth="1.85"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle className="proc-c1-dot1" cx="114" cy="42" r="2.3" fill="#000000" />
        <circle className="proc-c1-dot2" cx="126" cy="42" r="2.3" fill="#000000" />
        <circle className="proc-c1-dot3" cx="138" cy="42" r="2.3" fill="#000000" />
      </g>
    </svg>
  );
}

function InvestigationIllustration() {
  return (
    <svg
      viewBox="0 0 184 74"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {/* Editorial briefing sheet */}
      <g className="proc-c2-sheet">
        <path
          d="M 44 10 L 128 10 L 138 20 L 138 64 Q 138 66 135 66 L 44 66 Q 41 66 41 63 L 41 13 Q 41 10 44 10 Z"
          fill="#FFF9F4"
          stroke="#000000"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Folded corner */}
        <path
          d="M 128 10 L 128 20 L 138 20 Z"
          fill="#F2BED6"
          stroke="#000000"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        {/* Aqua section band */}
        <path
          d="M 52 20 L 84 20"
          stroke="#A5DCD1"
          strokeWidth="4.4"
          strokeLinecap="round"
        />
        {/* Briefing ink lines */}
        <path
          d="M 52 31 L 116 31 M 52 39 L 91 39 M 52 47 L 82 47 M 52 55 L 104 55"
          stroke="#000000"
          strokeOpacity="0.32"
          strokeWidth="1.65"
          strokeLinecap="round"
        />
        {/* Key strategic insight mark revealed under the lens */}
        <path
          className="proc-c2-highlight"
          pathLength={1}
          d="M 94 43.5 C 94 37.5, 117 37.5, 117 43.5 C 117 49.5, 94 49.5, 94 43.5 Z"
          stroke="#FB0C72"
          strokeWidth="2.05"
          strokeLinecap="round"
        />
      </g>

      {/* Hand-drawn 2D Magnifying Glass */}
      <g className="proc-c2-lens">
        <line
          x1="116.5"
          y1="50.5"
          x2="131"
          y2="64"
          stroke="#000000"
          strokeWidth="5.4"
          strokeLinecap="round"
        />
        <line
          x1="116.5"
          y1="50.5"
          x2="131"
          y2="64"
          stroke="#FB0C72"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <circle
          cx="106"
          cy="40"
          r="14.5"
          fill="#A5DCD1"
          fillOpacity="0.32"
          stroke="#000000"
          strokeWidth="2.05"
        />
        <path
          d="M 98 33.5 Q 103 29.5 110 31.2"
          stroke="#FFF9F4"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

function DirectionGridIllustration() {
  return (
    <svg
      viewBox="0 0 184 74"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {/* Hairline alignment guides + final confirmation bracket */}
      <path
        className="proc-c3-guides"
        pathLength={1}
        d="M 43 13 L 43 62 M 141 13 L 141 62"
        stroke="#000000"
        strokeOpacity="0.18"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        className="proc-c3-corner"
        pathLength={1}
        d="M 134 9 L 144 9 L 144 19"
        stroke="#FB0C72"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Block 01: Top-left Pastel Pink wide editorial block */}
      <g className="proc-c3-b1">
        <rect
          x="48"
          y="13"
          width="52"
          height="22"
          rx="4"
          fill="#F2BED6"
          stroke="#000000"
          strokeWidth="1.75"
        />
        <path
          d="M 55 21 L 88 21 M 55 27 L 76 27"
          stroke="#000000"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </g>

      {/* Block 02: Top-right Aqua pillar square */}
      <g className="proc-c3-b2">
        <rect
          x="105"
          y="13"
          width="31"
          height="22"
          rx="4"
          fill="#A5DCD1"
          stroke="#000000"
          strokeWidth="1.75"
        />
        <circle
          cx="120.5"
          cy="24"
          r="4.2"
          fill="#FFF9F4"
          stroke="#000000"
          strokeWidth="1.5"
        />
      </g>

      {/* Block 03: Bottom-left Hot Pink accent cutout */}
      <g className="proc-c3-b3">
        <rect
          x="48"
          y="40"
          width="32"
          height="22"
          rx="4"
          fill="#FB0C72"
          stroke="#000000"
          strokeWidth="1.75"
        />
        <path
          d="M 55 48 L 72 48 M 55 54 L 66 54"
          stroke="#FFF9F4"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </g>

      {/* Block 04: Bottom-right Off-White mini grid block */}
      <g className="proc-c3-b4">
        <rect
          x="85"
          y="40"
          width="51"
          height="22"
          rx="4"
          fill="#FFF9F4"
          stroke="#000000"
          strokeWidth="1.75"
        />
        <line x1="102" y1="45" x2="102" y2="57" stroke="#000000" strokeOpacity="0.3" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="119" y1="45" x2="119" y2="57" stroke="#000000" strokeOpacity="0.3" strokeWidth="1.3" strokeLinecap="round" />
        <rect x="90" y="46" width="7" height="10" rx="1.5" fill="#F2BED6" />
        <rect x="107" y="46" width="7" height="10" rx="1.5" fill="#A5DCD1" />
        <rect x="124" y="46" width="7" height="10" rx="1.5" fill="#FB0C72" />
      </g>
    </svg>
  );
}

function ExecutionPieceIllustration() {
  return (
    <svg
      viewBox="0 0 184 74"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {/* Editorial paper frame */}
      <g className="proc-c4-sheet">
        <rect
          x="50"
          y="10"
          width="78"
          height="54"
          rx="5"
          fill="#FFF9F4"
          stroke="#000000"
          strokeWidth="1.8"
        />
        {/* Header visual strip */}
        <rect
          className="proc-c4-header"
          x="56"
          y="16"
          width="66"
          height="11"
          rx="2.5"
          fill="#F2BED6"
          stroke="#000000"
          strokeWidth="1.35"
        />
        {/* Composition image/color shape */}
        <rect
          className="proc-c4-block"
          x="56"
          y="32"
          width="28"
          height="25"
          rx="3"
          fill="#A5DCD1"
          stroke="#000000"
          strokeWidth="1.35"
        />
        {/* Hand-drawn layout lines */}
        <path
          className="proc-c4-lines"
          pathLength={1}
          d="M 90 35 L 118 35 M 90 42 L 113 42 M 90 49 L 106 49"
          stroke="#000000"
          strokeWidth="1.85"
          strokeLinecap="round"
        />
        {/* Small editorial pink accent tab */}
        <rect
          className="proc-c4-tab"
          x="105"
          y="13"
          width="17"
          height="5"
          rx="2"
          fill="#FB0C72"
          stroke="#000000"
          strokeWidth="1.2"
        />
      </g>

      {/* Hand-drawn completion check mark */}
      <g className="proc-c4-checkwrap">
        <circle
          cx="128"
          cy="54"
          r="11"
          fill="#FFF9F4"
          stroke="#FB0C72"
          strokeWidth="1.9"
        />
        <path
          className="proc-c4-check"
          pathLength={1}
          d="M 122.2 54.2 L 126.4 58.2 L 134.2 49.8"
          stroke="#FB0C72"
          strokeWidth="2.35"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

function TrackingRouteIllustration() {
  return (
    <svg
      viewBox="0 0 184 74"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {/* Editorial subtle chart card backdrop (no numbers, no fake metrics) */}
      <g className="proc-c5-frame">
        <rect
          x="26"
          y="11"
          width="132"
          height="52"
          rx="6"
          fill="#FFF9F4"
          stroke="#000000"
          strokeWidth="1.65"
        />
        <path
          d="M 35 25 L 149 25 M 35 38 L 149 38 M 35 51 L 149 51"
          stroke="#000000"
          strokeOpacity="0.12"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </g>

      {/* Initial trajectory with natural oscillation */}
      <path
        className="proc-c5-path1"
        pathLength={1}
        d="M 38 47 C 54 47, 61 34, 77 38 C 91 42, 97 48, 110 41"
        stroke="#000000"
        strokeWidth="2.1"
        strokeLinecap="round"
      />

      {/* Adjusted strategic trajectory in hot pink + hand-drawn directional chevron */}
      <path
        className="proc-c5-path2"
        pathLength={1}
        d="M 110 41 C 122 34, 130 25, 146 22"
        stroke="#FB0C72"
        strokeWidth="2.3"
        strokeLinecap="round"
      />
      <path
        className="proc-c5-arrow"
        pathLength={1}
        d="M 140 19.6 L 147 22 L 142.4 28"
        stroke="#FB0C72"
        strokeWidth="2.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Three observation nodes along the path */}
      <circle
        className="proc-c5-node1"
        cx="61"
        cy="37"
        r="3.8"
        fill="#F2BED6"
        stroke="#000000"
        strokeWidth="1.6"
      />
      <circle
        className="proc-c5-node2"
        cx="90"
        cy="42"
        r="3.8"
        fill="#A5DCD1"
        stroke="#000000"
        strokeWidth="1.6"
      />
      <circle
        className="proc-c5-node3"
        cx="110"
        cy="41"
        r="4.2"
        fill="#FB0C72"
        stroke="#000000"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export function ProcessStepIllustration({
  stepId,
  activation,
}: StepIllustrationProps) {
  const stateClass =
    activation.state === 'reduced'
      ? 'proc-illo--reduced'
      : activation.state === 'active' || activation.state === 'done'
        ? 'proc-illo--active'
        : 'proc-illo--waiting';

  const cssVars = {
    '--proc-delay': `${activation.delayMs}ms`,
  } as React.CSSProperties;

  return (
    <div
      className={`proc-illo-inner ${stateClass}`}
      data-proc-state={activation.state}
      data-proc-delay={activation.delayMs}
      style={cssVars}
    >
      {stepId === 'conversa' ? <ConversationIllustration /> : null}
      {stepId === 'investigacao' ? <InvestigationIllustration /> : null}
      {stepId === 'direcao' ? <DirectionGridIllustration /> : null}
      {stepId === 'execucao' ? <ExecutionPieceIllustration /> : null}
      {stepId === 'acompanhamento' ? <TrackingRouteIllustration /> : null}
    </div>
  );
}
