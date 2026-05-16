import type { ExamType } from "./types";

export interface OfficialPyqLink {
  year: number;
  title: string;
  url: string;
  note?: string;
}

export interface ExamPyqCatalog {
  exam: ExamType;
  portalLabel: string;
  portalUrl: string;
  papers: OfficialPyqLink[];
}

/** Official / public archives for previous-year papers (open in browser). */
export const PYQ_CATALOG: Record<ExamType, ExamPyqCatalog> = {
  GATE: {
    exam: "GATE",
    portalLabel: "GATE Official — Previous Papers",
    portalUrl: "https://gate.iitk.ac.in/previous-year-question-papers.html",
    papers: [
      {
        year: 2024,
        title: "GATE 2024 — All papers",
        url: "https://gate2024.iisc.ac.in/question-papers.html",
      },
      {
        year: 2023,
        title: "GATE 2023 — All papers",
        url: "https://gate2023.iitk.ac.in/question-papers.html",
      },
      {
        year: 2022,
        title: "GATE 2022 — All papers",
        url: "https://gate2022.iitkgp.ac.in/question-papers.html",
      },
      {
        year: 2021,
        title: "GATE 2021 — All papers",
        url: "https://gate2021.iitr.ac.in/question-papers.html",
      },
      {
        year: 2020,
        title: "GATE 2020 — All papers",
        url: "https://gate2020.iitd.ac.in/question-papers.html",
      },
      {
        year: 2019,
        title: "GATE 2019 — All papers",
        url: "https://gate2019.iitm.ac.in/question-papers.html",
      },
      {
        year: 2018,
        title: "GATE 2018 — All papers",
        url: "https://gate2018.iitg.ac.in/question-papers.html",
      },
    ],
  },
  ESE: {
    exam: "ESE",
    portalLabel: "UPSC ESE — Previous Papers",
    portalUrl: "https://upsc.gov.in/examinations/previous-question-papers",
    papers: [
      {
        year: 2024,
        title: "ESE 2024 — Civil Engineering",
        url: "https://upsc.gov.in/examinations/previous-question-papers",
        note: "Select Engineering Services Examination → CE",
      },
      {
        year: 2023,
        title: "ESE 2023 — Civil Engineering",
        url: "https://upsc.gov.in/examinations/previous-question-papers",
      },
      {
        year: 2022,
        title: "ESE 2022 — Civil Engineering",
        url: "https://upsc.gov.in/examinations/previous-question-papers",
      },
      {
        year: 2021,
        title: "ESE 2021 — Civil Engineering",
        url: "https://upsc.gov.in/examinations/previous-question-papers",
      },
    ],
  },
};
