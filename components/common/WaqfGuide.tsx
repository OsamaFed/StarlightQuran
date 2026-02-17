import React from 'react';
import styles from './WaqfGuide.module.css';

interface WaqfGuideProps {
  className?: string;
  showTitle?: boolean;
}

interface WaqfSign {
  svg: React.ReactNode;
  name: string;
  description: string;
}

const SymbolSVG = ({
  char,
  fontSize = 26,
  dy = "60%",
}: {
  char: string;
  sagdah?: number;
  fontSize?: number;
  dy?: string;
}) => (
  <svg
    viewBox="0 0 50 40"
    width="50"
    height="40"
    xmlns="http://www.w3.org/2000/svg"
    overflow="visible"
  >
    <text
      x="50%"
      y={dy}
      textAnchor="middle"
      dominantBaseline="auto"
      fontFamily="'Amiri Quran', serif"
      fontSize={fontSize}
      fill="currentColor"
    >
      {char}
    </text>
  </svg>
);

const waqfSigns: WaqfSign[] = [
  {
    svg: <SymbolSVG char="مـ" fontSize={24} dy="68%" />,
    name: "الوقف اللازم",
    description: "تفيد لزوم الوقف",
  },
  {
    svg: <SymbolSVG char="ۖ" fontSize={28} dy="66" />,
    name: "الوصل أولى",
    description: "تفيد أن الوصل أولى",
  },
  {
    svg: <SymbolSVG char="ۗ" fontSize={28} dy="68" />,
    name: "الوقف أولى",
    description: "تفيد أن الوقف أولى",
  },
  {
    svg: <SymbolSVG char="ۚ" fontSize={28} dy="68" />,
    name: "جائز الوقف",
    description: "تفيد جواز الوقف",
  },
];

const dabtSigns: WaqfSign[] = [
  {
    svg: <SymbolSVG char="∴ ∴" fontSize={26} dy="29" />,
    name: "تعانق الوقف",
    description: "جواز الوقف في أحد الموضعين وليس في كليهما",
  },
  {
    svg: <SymbolSVG char="لا" fontSize={24} dy="68%" />,
    name: "لا تقف",
    description: "تفيد النهي عن الوقف",
  },
  {
    svg: <SymbolSVG char="۩" fontSize={28} dy="40" />,
    name: "موضع السجدة",
    description: "للدلالة على موضع السجود",
  },
  {
    svg: <SymbolSVG char="◌ۘ" fontSize={35} dy="34" />,
    name: "الإقلاب",
    description: "إذا جاء النون الساكن أو التنوين قبل حرف الباء، يُقلب صوته إلى ميم مع الغنة",
  },
  {
    svg: <SymbolSVG char="ۤ" fontSize={28} dy="46" />,
    name: "المد الزائد",
    description: "مد يزيد على المد الطبيعي بسبب همزة أو سكون",
  },
  {
    svg: <SymbolSVG char="ٱ" fontSize={28} dy="72%" />,
    name: "همزة الوصل",
    description: "همزة تُنطق ابتداءً وتسقط وصلاً",
  },
];

const WaqfGuide: React.FC<WaqfGuideProps> = ({ className, showTitle = true }) => {
  return (
    <div className={`${styles.waqfGuide} ${className || ""}`}>
      {showTitle && <h3 className={styles.waqfTitle}>علامات الوقف والضبط</h3>}

      <div className={styles.sectionLabel}>علامات الوقف</div>
      <div className={styles.waqfGrid}>
        {waqfSigns.map((sign, index) => (
          <div key={`waqf-${index}`} className={styles.waqfItem}>
            <span className={styles.waqfSymbol}>{sign.svg}</span>
            <span className={styles.waqfName}>{sign.name}</span>
            <span className={styles.waqfDescription}>{sign.description}</span>
          </div>
        ))}
      </div>

      <div className={styles.sectionLabel}>علامات الضبط</div>
      <div className={styles.waqfGrid}>
        {dabtSigns.map((sign, index) => (
          <div key={`dabt-${index}`} className={styles.waqfItem}>
            <span className={styles.waqfSymbol}>{sign.svg}</span>
            <span className={styles.waqfName}>{sign.name}</span>
            <span className={styles.waqfDescription}>{sign.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WaqfGuide;
