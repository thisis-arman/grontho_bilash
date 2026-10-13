import { AcademicSystem, StudentInfo } from './types';

export interface ReportTerm {
  name: string;
  gpa: number;
  credits: number;
  // Present for course-wise terms; absent when the GPA was entered directly.
  rows?: { name: string; credits: number; grade: string; points: number }[];
}

export interface ReportData {
  student: StudentInfo;
  system: AcademicSystem;
  scaleLabel: string; // "4.00" | "5.00"
  cgpa: number;
  credits: number;
  terms: ReportTerm[];
}

// A4 portrait at 150 dpi; the height grows when the content needs it.
const WIDTH = 1240;
const MIN_HEIGHT = 1754;
const PAD = 80;
const ROW = 46;

const COLOR = {
  ink: '#1c1917',
  dark: '#0c0a09',
  muted: '#78716c',
  faint: '#a8a29e',
  line: '#e7e5e4',
  band: '#f5f5f4',
  paper: '#ffffff',
  amber: '#fbbf24',
  amberDeep: '#b45309',
  amberSoft: '#fffbeb',
};

// Same families the site uses, so Bengali names render properly.
const BODY = '"Hind Siliguri", system-ui, sans-serif';
const DISPLAY = '"Baloo Da 2", "Hind Siliguri", system-ui, sans-serif';

const font = (weight: number, size: number, family = BODY) => `${weight} ${size}px ${family}`;

const fitText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let cut = text;
  while (cut.length > 1 && ctx.measureText(`${cut}…`).width > maxWidth) {
    cut = cut.slice(0, -1);
  }
  return `${cut.trimEnd()}…`;
};

const roundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

// Paints the whole report and returns the y where the content ended. It is
// run once on a scratch context to measure, then again on the real canvas.
const paint = (ctx: CanvasRenderingContext2D, data: ReportData, height: number) => {
  const inner = WIDTH - PAD * 2;
  const termWord = data.system === 'year' ? 'Year' : 'Semester';

  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = COLOR.paper;
  ctx.fillRect(0, 0, WIDTH, height);

  // ── Header band ──
  ctx.fillStyle = COLOR.dark;
  ctx.fillRect(0, 0, WIDTH, 230);
  ctx.fillStyle = COLOR.amber;
  ctx.fillRect(0, 230, WIDTH, 8);

  ctx.textAlign = 'left';
  ctx.fillStyle = COLOR.amber;
  ctx.font = font(700, 24, DISPLAY);
  ctx.fillText('GRONTHO BILASH', PAD, 92);
  ctx.fillStyle = '#fafaf9';
  ctx.font = font(800, 62, DISPLAY);
  ctx.fillText('Academic Report Card', PAD, 164);

  ctx.textAlign = 'right';
  ctx.fillStyle = COLOR.faint;
  ctx.font = font(500, 22);
  ctx.fillText('Self-calculated summary', WIDTH - PAD, 92);
  ctx.fillText(`Grading scale ${data.scaleLabel}`, WIDTH - PAD, 124);

  // ── Student ──
  let y = 330;
  ctx.textAlign = 'left';
  ctx.fillStyle = COLOR.muted;
  ctx.font = font(600, 20);
  ctx.fillText('STUDENT', PAD, y);
  y += 58;
  const hasName = data.student.name.trim() !== '';
  ctx.fillStyle = hasName ? COLOR.ink : COLOR.faint;
  ctx.font = font(800, 52, DISPLAY);
  ctx.fillText(fitText(ctx, hasName ? data.student.name.trim() : 'Your name', inner), PAD, y);

  const details = [
    ['Student ID', data.student.studentId],
    ['Institution', data.student.institution],
    ['Program', data.student.program],
    ['Session', data.student.session],
  ].filter(([, value]) => value.trim() !== '');

  y += 44;
  const colWidth = inner / 2;
  details.forEach(([label, value], i) => {
    const x = PAD + (i % 2) * colWidth;
    const rowY = y + Math.floor(i / 2) * 68;
    ctx.fillStyle = COLOR.muted;
    ctx.font = font(500, 19);
    ctx.fillText(label.toUpperCase(), x, rowY);
    ctx.fillStyle = COLOR.ink;
    ctx.font = font(600, 26);
    ctx.fillText(fitText(ctx, value.trim(), colWidth - 30), x, rowY + 32);
  });
  y += Math.ceil(details.length / 2) * 68 + 16;

  // ── Summary ──
  const boxH = 170;
  const gap = 20;
  const mainW = inner * 0.46;
  const sideW = (inner - mainW - gap * 2) / 2;

  ctx.fillStyle = COLOR.amberSoft;
  roundRect(ctx, PAD, y, mainW, boxH, 20);
  ctx.fill();
  ctx.strokeStyle = COLOR.amber;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = COLOR.amberDeep;
  ctx.font = font(700, 20);
  ctx.fillText('CUMULATIVE GPA (CGPA)', PAD + 30, y + 48);
  ctx.fillStyle = COLOR.ink;
  ctx.font = font(800, 84, DISPLAY);
  const cgpaText = data.credits > 0 ? data.cgpa.toFixed(2) : '—';
  ctx.fillText(cgpaText, PAD + 30, y + 132);
  const cgpaWidth = ctx.measureText(cgpaText).width;
  ctx.fillStyle = COLOR.muted;
  ctx.font = font(600, 30, DISPLAY);
  ctx.fillText(`/ ${data.scaleLabel}`, PAD + 30 + cgpaWidth + 14, y + 132);

  const sideBoxes = [
    ['TOTAL CREDITS', String(data.credits)],
    [`${termWord.toUpperCase()}S COUNTED`, String(data.terms.length)],
  ];
  sideBoxes.forEach(([label, value], i) => {
    const x = PAD + mainW + gap + i * (sideW + gap);
    ctx.fillStyle = COLOR.band;
    roundRect(ctx, x, y, sideW, boxH, 20);
    ctx.fill();
    ctx.fillStyle = COLOR.muted;
    ctx.font = font(700, 18);
    ctx.fillText(label, x + 26, y + 48);
    ctx.fillStyle = COLOR.ink;
    ctx.font = font(800, 60, DISPLAY);
    ctx.fillText(value, x + 26, y + 126);
  });
  y += boxH + 64;

  // ── Terms ──
  const col = {
    no: PAD + 20,
    name: PAD + 80,
    credits: PAD + inner - 330,
    grade: PAD + inner - 180,
    points: PAD + inner - 20,
  };

  for (const term of data.terms) {
    ctx.textAlign = 'left';
    ctx.fillStyle = COLOR.ink;
    ctx.font = font(700, 32, DISPLAY);
    ctx.fillText(fitText(ctx, term.name || termWord, inner - 360), PAD, y);
    ctx.textAlign = 'right';
    ctx.fillStyle = COLOR.amberDeep;
    ctx.font = font(700, 26, DISPLAY);
    ctx.fillText(`GPA ${term.gpa.toFixed(2)}  ·  ${term.credits} credits`, WIDTH - PAD, y);
    y += 22;

    if (!term.rows) {
      ctx.fillStyle = COLOR.line;
      ctx.fillRect(PAD, y, inner, 2);
      y += 40;
      ctx.textAlign = 'left';
      ctx.fillStyle = COLOR.muted;
      ctx.font = font(500, 22);
      ctx.fillText(`${termWord} GPA entered directly (no course breakdown).`, PAD, y);
      y += 60;
      continue;
    }

    ctx.fillStyle = COLOR.band;
    roundRect(ctx, PAD, y, inner, ROW, 10);
    ctx.fill();
    ctx.fillStyle = COLOR.muted;
    ctx.font = font(700, 18);
    ctx.textAlign = 'left';
    ctx.fillText('#', col.no, y + 30);
    ctx.fillText('COURSE', col.name, y + 30);
    ctx.textAlign = 'right';
    ctx.fillText('CREDITS', col.credits, y + 30);
    ctx.fillText('GRADE', col.grade, y + 30);
    ctx.fillText('POINTS', col.points, y + 30);
    y += ROW;

    term.rows.forEach((row, i) => {
      ctx.textAlign = 'left';
      ctx.fillStyle = COLOR.faint;
      ctx.font = font(500, 22);
      ctx.fillText(String(i + 1), col.no, y + 31);
      ctx.fillStyle = COLOR.ink;
      ctx.font = font(500, 23);
      ctx.fillText(fitText(ctx, row.name || `Course ${i + 1}`, col.credits - col.name - 130), col.name, y + 31);
      ctx.textAlign = 'right';
      ctx.fillText(String(row.credits), col.credits, y + 31);
      ctx.font = font(700, 23);
      ctx.fillText(row.grade, col.grade, y + 31);
      ctx.font = font(500, 23);
      ctx.fillText(row.points.toFixed(2), col.points, y + 31);
      ctx.fillStyle = COLOR.line;
      ctx.fillRect(PAD, y + ROW - 1, inner, 1);
      y += ROW;
    });
    y += 56;
  }

  // ── Footer (pinned to the bottom of the page) ──
  const contentEnd = y;
  const footerY = Math.max(contentEnd, height - 130);
  ctx.fillStyle = COLOR.line;
  ctx.fillRect(PAD, footerY, inner, 2);
  ctx.textAlign = 'left';
  ctx.fillStyle = COLOR.muted;
  ctx.font = font(500, 20);
  ctx.fillText(
    'Unofficial, self-calculated summary. This is not an official transcript or certificate.',
    PAD,
    footerY + 44
  );
  ctx.fillStyle = COLOR.faint;
  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  ctx.fillText(`Generated on ${date}`, PAD, footerY + 76);
  ctx.textAlign = 'right';
  ctx.fillStyle = COLOR.amberDeep;
  ctx.font = font(700, 20);
  ctx.fillText('gronthobilash.com/tools', WIDTH - PAD, footerY + 76);

  return contentEnd + 130;
};

const ensureFonts = async () => {
  if (!('fonts' in document)) return;
  try {
    await Promise.all([
      document.fonts.load(font(500, 23)),
      document.fonts.load(font(700, 23)),
      document.fonts.load(font(800, 52, DISPLAY)),
    ]);
  } catch {
    // Falls back to system fonts.
  }
};

export const drawReportCard = async (canvas: HTMLCanvasElement, data: ReportData) => {
  await ensureFonts();

  const scratch = document.createElement('canvas').getContext('2d');
  if (!scratch) return;
  const height = Math.max(MIN_HEIGHT, Math.ceil(paint(scratch, data, MIN_HEIGHT)));

  canvas.width = WIDTH;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  paint(ctx, data, height);
};

export const downloadReportCard = (canvas: HTMLCanvasElement, studentName: string) =>
  new Promise<void>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Could not create the image'));
      const slug = studentName.trim().replace(/[\\/:*?"<>|\s]+/g, '-').slice(0, 60) || 'student';
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report-card-${slug}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      resolve();
    }, 'image/png');
  });
