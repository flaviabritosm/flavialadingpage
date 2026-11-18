import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Award, Crown, X } from 'lucide-react';
import { WHATSAPP_CTA_URL } from './constants/cta.ts';
import {
  OPTIMIZED_HERO_POSTER_URL,
  OPTIMIZED_HERO_VIDEO_URL,
  OPTIMIZED_LOGO_WEBP_URL,
} from './utils/mediaAssets.ts';

const HERO_VIDEO_URL = '/assets/aistudio/Woman_with_pink_hair_blinking_61872965_073e362a.mp4';
const HEADER_LOGO_URL = '/assets/aistudio/Logo_Flavia_Brito_em_Preto_e_Rosa_5a215915.png';

const NAV_LINKS = [
  { label: 'Problema', href: '#stats' },
  { label: 'Solução', href: '#loop' },
  { label: 'Entregas', href: '#stats-2' },
  { label: 'Projetos', href: '#reelmark' },
  { label: 'Processo', href: '#processo' },
];

const MARQUEE_WORDS = [
  'Identidade',
  'Posicionamento',
  'Estratégia',
  'Conteúdo',
] as const;

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [marqueeActive, setMarqueeActive] = useState(true);
  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const marqueeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const heroEl = heroRef.current;
    const vidEl = videoRef.current;
    if (!heroEl || !vidEl) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((e) => e.isIntersecting);
        if (visible) {
          vidEl.play().catch(() => {});
        } else if (!vidEl.paused) {
          vidEl.pause();
        }
      },
      { rootMargin: '200px 0px' }
    );
    io.observe(heroEl);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const marqueeEl = marqueeRef.current;
    if (!marqueeEl) return;
    const io = new IntersectionObserver(
      (entries) => {
        setMarqueeActive(entries.some((e) => e.isIntersecting));
      },
      { rootMargin: '200px 0px' }
    );
    io.observe(marqueeEl);
    return () => io.disconnect();
  }, []);

  return (
    <>
      {/* Fixed Torn Paper Header — K-Pop Girly Editorial */}
      <header className="fixed top-0 left-0 right-0 z-40 select-none">
        <div className="pointer-events-none absolute left-0 right-0 top-full -mt-[2px] h-[30px] overflow-x-clip z-20">
          <svg
            aria-hidden="true"
            viewBox="0 0 1440 48"
            preserveAspectRatio="none"
            className="w-full min-w-[760px] h-[22px] sm:h-[26px] block drop-shadow-[0_4px_8px_rgba(0,0,0,0.12)]"
          >
            {/* White torn paper pulp rim */}
            <path
              d="M0,0 L1440,0 L1440,31.8 L1436,28.1 L1432,28.9 L1428,29.3 L1424,28.3 L1420,31.6 L1416,27.7 L1412,28.6 L1408,29.3 L1404,26.9 L1400,30.3 L1396,29.9 L1392,28.1 L1388,27.7 L1384,29 L1380,29.1 L1376,27.1 L1372,27.2 L1368,28 L1364,26.3 L1360,26.3 L1356,31.8 L1352,29.4 L1348,28 L1344,26.9 L1340,23 L1336,24.6 L1332,24.6 L1328,27 L1324,25.7 L1320,25 L1316,27.9 L1312,24.9 L1308,22.1 L1304,22.6 L1300,24.6 L1296,24.8 L1292,21.6 L1288,25.3 L1284,26.2 L1280,22.3 L1276,23.8 L1272,22.7 L1268,27.7 L1264,25.4 L1260,22.5 L1256,23.1 L1252,19.1 L1248,21.8 L1244,25.3 L1240,18.2 L1236,20.1 L1232,22.9 L1228,21 L1224,20.3 L1220,17.6 L1216,19.1 L1212,15.5 L1208,17.7 L1204,18.9 L1200,19.9 L1196,18.5 L1192,15.5 L1188,16.5 L1184,17.5 L1180,15.3 L1176,15.5 L1172,14.9 L1168,15.7 L1164,15.2 L1160,16.1 L1156,15 L1152,13.4 L1148,13.6 L1144,14.5 L1140,12.9 L1136,14 L1132,11.7 L1128,12.7 L1124,13.3 L1120,12.3 L1116,12.6 L1112,12.3 L1108,11.9 L1104,10.8 L1100,12.4 L1096,13.2 L1092,11.8 L1088,12.6 L1084,11.9 L1080,14.9 L1076,14.7 L1072,14.8 L1068,12.2 L1064,16.4 L1060,14.2 L1056,14.8 L1052,13.6 L1048,16.8 L1044,16.9 L1040,16.9 L1036,16.4 L1032,14.8 L1028,18 L1024,21.8 L1020,20.9 L1016,16.4 L1012,21.2 L1008,22.6 L1004,21.2 L1000,20.7 L996,19.2 L992,23.5 L988,20.2 L984,22.4 L980,20.8 L976,25.3 L972,23.9 L968,23 L964,23.3 L960,25 L956,26.7 L952,25 L948,26.3 L944,29.3 L940,23.7 L936,23.4 L932,26.2 L928,26.9 L924,25.6 L920,26.4 L916,29.7 L912,25.7 L908,29.1 L904,28.6 L900,26.8 L896,27.9 L892,31.8 L888,28.3 L884,27.2 L880,29.3 L876,24.4 L872,28.5 L868,29.6 L864,25.4 L860,23 L856,26 L852,27.1 L848,23.7 L844,25.5 L840,23 L836,23.4 L832,22.6 L828,23.2 L824,27.7 L820,21.9 L816,22.8 L812,20.3 L808,21.4 L804,20 L800,21.1 L796,18.6 L792,18.9 L788,22.3 L784,20.2 L780,21.7 L776,18.8 L772,18.9 L768,20.3 L764,16 L760,15.1 L756,19.5 L752,17.7 L748,18.4 L744,18.6 L740,14.8 L736,15.6 L732,17.3 L728,19 L724,17.8 L720,16.2 L716,15 L712,17.6 L708,17.8 L704,17.5 L700,16.3 L696,15.5 L692,18.5 L688,18 L684,17.3 L680,20.4 L676,15.8 L672,16.4 L668,16.6 L664,19 L660,17.8 L656,16.9 L652,19.4 L648,19.2 L644,19 L640,19.2 L636,21.5 L632,21.2 L628,21.5 L624,21.4 L620,22.8 L616,21.5 L612,25 L608,23.3 L604,23 L600,23.6 L596,23 L592,26.8 L588,26.6 L584,26 L580,27.1 L576,24.3 L572,23.5 L568,24.1 L564,27.7 L560,24.2 L556,24.4 L552,27.1 L548,23 L544,24.3 L540,26.6 L536,23.8 L532,26.5 L528,25.7 L524,23.6 L520,25.4 L516,25.1 L512,26 L508,22.5 L504,28.6 L500,26.2 L496,23.9 L492,25 L488,28.4 L484,23.1 L480,24.7 L476,26.5 L472,26.5 L468,27.6 L464,25.4 L460,26.9 L456,27.6 L452,30.9 L448,24.8 L444,33.3 L440,28.1 L436,29 L432,28.2 L428,25.7 L424,31.2 L420,28.7 L416,27.1 L412,28.1 L408,32.5 L404,32.9 L400,31.3 L396,30 L392,27.7 L388,30.9 L384,31.7 L380,29.4 L376,29.2 L372,29.1 L368,32.4 L364,30 L360,33.5 L356,32.1 L352,32.5 L348,32 L344,30.3 L340,30.2 L336,32.1 L332,31.9 L328,34.1 L324,36.9 L320,31.3 L316,33.5 L312,31.9 L308,31.9 L304,32.5 L300,31.9 L296,31.8 L292,34.5 L288,34.4 L284,32.1 L280,33.5 L276,34.2 L272,34.5 L268,35 L264,31.7 L260,32.2 L256,31.3 L252,33.8 L248,35.4 L244,31.6 L240,28.9 L236,30 L232,29.6 L228,32.6 L224,29.7 L220,31.6 L216,30.8 L212,32.1 L208,28.9 L204,30.7 L200,32.1 L196,29.9 L192,26.2 L188,29.6 L184,30.8 L180,26.4 L176,28.7 L172,29.4 L168,31.1 L164,28.5 L160,29.9 L156,30.4 L152,29.6 L148,33.9 L144,27.3 L140,27.8 L136,30.4 L132,28.3 L128,29.3 L124,28.2 L120,28.5 L116,30.2 L112,27.4 L108,30.2 L104,25.3 L100,27.7 L96,30.6 L92,31.1 L88,28.9 L84,30.7 L80,27.7 L76,27 L72,28.5 L68,29.9 L64,28.1 L60,32 L56,27.8 L52,27 L48,29.8 L44,29.5 L40,33.8 L36,28.8 L32,30.5 L28,29 L24,29.5 L20,27.3 L16,28.3 L12,29.4 L8,27.6 L4,28.6 L0,29.6 Z"
              fill="#FFFFFF"
            />
            {/* Soft warm-ivory paper crease shadow */}
            <path
              transform="translate(0 1.4)"
              d="M0,0 L1440,0 L1440,22.2 L1436,20.9 L1432,21.6 L1428,20.2 L1424,20.6 L1420,19.1 L1416,18.9 L1412,19 L1408,20.8 L1404,18.1 L1400,19 L1396,19 L1392,19.2 L1388,19.5 L1384,18.1 L1380,17.7 L1376,18 L1372,16.8 L1368,16.5 L1364,17.6 L1360,15.7 L1356,18.3 L1352,18.1 L1348,17.4 L1344,18.2 L1340,15.2 L1336,16.4 L1332,16.9 L1328,16.4 L1324,17.3 L1320,17.1 L1316,18 L1312,16.6 L1308,15.4 L1304,16.1 L1300,15.3 L1296,15.1 L1292,15.5 L1288,16 L1284,17.5 L1280,16.4 L1276,16.8 L1272,15.5 L1268,16.6 L1264,17.1 L1260,16.3 L1256,16.9 L1252,14.6 L1248,14.6 L1244,16.3 L1240,13.8 L1236,13.6 L1232,14.9 L1228,15.9 L1224,15.5 L1220,13.8 L1216,14.4 L1212,12 L1208,14.2 L1204,15.1 L1200,14.6 L1196,13.8 L1192,12 L1188,11.5 L1184,13.2 L1180,11.8 L1176,12 L1172,10.5 L1168,11.7 L1164,10.8 L1160,12.2 L1156,11.4 L1152,9.9 L1148,8.9 L1144,11 L1140,8.6 L1136,10.5 L1132,8.2 L1128,9.2 L1124,8.5 L1120,8.8 L1116,8 L1112,7.8 L1108,7.3 L1104,7.3 L1100,8.9 L1096,9.7 L1092,7.8 L1088,7.6 L1084,8.1 L1080,8.5 L1076,7.6 L1072,9.6 L1068,7.9 L1064,6.8 L1060,8.6 L1056,9.1 L1052,9.1 L1048,9.2 L1044,9.8 L1040,8.2 L1036,8.1 L1032,8.9 L1028,11.4 L1024,9.4 L1020,11.6 L1016,10.3 L1012,12.1 L1008,11.1 L1004,12.1 L1000,11.3 L996,11.6 L992,13.4 L988,12.5 L984,13 L980,12.2 L976,15.3 L972,13.8 L968,14.9 L964,13.8 L960,13.7 L956,15.7 L952,15 L948,15.2 L944,18.8 L940,15 L936,15.4 L932,17.9 L928,17.7 L924,17.3 L920,16.2 L916,19.2 L912,16.6 L908,19.1 L904,19.8 L900,18.8 L896,18.4 L892,18.6 L888,19.3 L884,18.9 L880,19.1 L876,16.9 L872,17.5 L868,19.7 L864,17.2 L860,16.7 L856,18.6 L852,17.9 L848,16.3 L844,16.8 L840,16.2 L836,17.1 L832,17.5 L828,15.3 L824,16.7 L820,16 L816,16 L812,14.5 L808,14.4 L804,16.1 L800,14.2 L796,14.3 L792,14.3 L788,13.4 L784,14.4 L780,15.6 L776,14.5 L772,13.3 L768,15.1 L764,12.5 L760,11.6 L756,14 L752,14.2 L748,14.6 L744,13.4 L740,11.3 L736,12.1 L732,11.1 L728,15.5 L724,14.3 L720,12.2 L716,11.5 L712,13.9 L708,14.3 L704,12.5 L700,11.7 L696,12 L692,15 L688,14.5 L684,13 L680,14.9 L676,12.3 L672,12.9 L668,12.9 L664,13.1 L660,14 L656,13 L652,15.3 L648,15.3 L644,14.2 L640,14.7 L636,15.5 L632,15 L628,16.6 L624,16.6 L620,14.9 L616,14.4 L612,16.5 L608,16.9 L604,14.9 L600,16.4 L596,15 L592,15.5 L588,16 L584,15.7 L580,16.7 L576,17.9 L572,15.4 L568,16.6 L564,16.9 L560,17 L556,15.7 L552,15.7 L548,14.5 L544,16.2 L540,16.1 L536,15.6 L532,15.6 L528,17.1 L524,14.3 L520,16 L516,14.4 L512,14.7 L508,14.6 L504,17.1 L500,15.1 L496,15.2 L492,15.5 L488,18 L484,15.1 L480,14.1 L476,16.2 L472,17.2 L468,18.1 L464,16.5 L460,16.5 L456,17.6 L452,17.3 L448,17.6 L444,20.1 L440,18.7 L436,19.7 L432,19.3 L428,19.8 L424,21.8 L420,21.7 L416,20.3 L412,19.9 L408,20.9 L404,23.5 L400,24.1 L396,22.1 L392,22 L388,22.5 L384,25.3 L380,24.3 L376,23.8 L372,24.8 L368,25.9 L364,25.3 L360,27.3 L356,27.8 L352,26.8 L348,26 L344,26.8 L340,26.7 L336,28.2 L332,27.2 L328,30 L324,29.5 L320,27.2 L316,30 L312,28.4 L308,28.4 L304,29 L300,27.6 L296,28.1 L292,30 L288,30 L284,27.5 L280,30 L276,29 L272,28.3 L268,29.9 L264,26.6 L260,26.5 L256,27.8 L252,28.4 L248,27 L244,25.6 L240,25.1 L236,26.1 L232,25.6 L228,26.2 L224,24.8 L220,25.1 L216,23.8 L212,24.7 L208,23.2 L204,24.4 L200,24.8 L196,24.6 L192,21.5 L188,21.3 L184,22.7 L180,20.5 L176,22.1 L172,22 L168,22.7 L164,19.3 L160,21.8 L156,22.2 L152,20.3 L148,21.6 L144,19.9 L140,20.8 L136,21.2 L132,19.6 L128,20.3 L124,20.3 L120,19.5 L116,21.4 L112,17.8 L108,19.1 L104,17.6 L100,19.1 L96,17.6 L92,17.9 L88,17.7 L84,19.8 L80,18.2 L76,18.8 L72,17.7 L68,18.5 L64,19.2 L60,21.2 L56,18.8 L52,18.6 L48,19.4 L44,19.5 L40,19.6 L36,18.9 L32,20.8 L28,20.3 L24,19.3 L20,17.7 L16,21.4 L12,21.8 L8,21.1 L4,19.2 L0,21.5 Z"
              fill="#EADFD4"
              opacity="0.9"
            />
            {/* Front Warm Ivory paper sheet */}
            <path
              d="M0,0 L1440,0 L1440,22.2 L1436,20.9 L1432,21.6 L1428,20.2 L1424,20.6 L1420,19.1 L1416,18.9 L1412,19 L1408,20.8 L1404,18.1 L1400,19 L1396,19 L1392,19.2 L1388,19.5 L1384,18.1 L1380,17.7 L1376,18 L1372,16.8 L1368,16.5 L1364,17.6 L1360,15.7 L1356,18.3 L1352,18.1 L1348,17.4 L1344,18.2 L1340,15.2 L1336,16.4 L1332,16.9 L1328,16.4 L1324,17.3 L1320,17.1 L1316,18 L1312,16.6 L1308,15.4 L1304,16.1 L1300,15.3 L1296,15.1 L1292,15.5 L1288,16 L1284,17.5 L1280,16.4 L1276,16.8 L1272,15.5 L1268,16.6 L1264,17.1 L1260,16.3 L1256,16.9 L1252,14.6 L1248,14.6 L1244,16.3 L1240,13.8 L1236,13.6 L1232,14.9 L1228,15.9 L1224,15.5 L1220,13.8 L1216,14.4 L1212,12 L1208,14.2 L1204,15.1 L1200,14.6 L1196,13.8 L1192,12 L1188,11.5 L1184,13.2 L1180,11.8 L1176,12 L1172,10.5 L1168,11.7 L1164,10.8 L1160,12.2 L1156,11.4 L1152,9.9 L1148,8.9 L1144,11 L1140,8.6 L1136,10.5 L1132,8.2 L1128,9.2 L1124,8.5 L1120,8.8 L1116,8 L1112,7.8 L1108,7.3 L1104,7.3 L1100,8.9 L1096,9.7 L1092,7.8 L1088,7.6 L1084,8.1 L1080,8.5 L1076,7.6 L1072,9.6 L1068,7.9 L1064,6.8 L1060,8.6 L1056,9.1 L1052,9.1 L1048,9.2 L1044,9.8 L1040,8.2 L1036,8.1 L1032,8.9 L1028,11.4 L1024,9.4 L1020,11.6 L1016,10.3 L1012,12.1 L1008,11.1 L1004,12.1 L1000,11.3 L996,11.6 L992,13.4 L988,12.5 L984,13 L980,12.2 L976,15.3 L972,13.8 L968,14.9 L964,13.8 L960,13.7 L956,15.7 L952,15 L948,15.2 L944,18.8 L940,15 L936,15.4 L932,17.9 L928,17.7 L924,17.3 L920,16.2 L916,19.2 L912,16.6 L908,19.1 L904,19.8 L900,18.8 L896,18.4 L892,18.6 L888,19.3 L884,18.9 L880,19.1 L876,16.9 L872,17.5 L868,19.7 L864,17.2 L860,16.7 L856,18.6 L852,17.9 L848,16.3 L844,16.8 L840,16.2 L836,17.1 L832,17.5 L828,15.3 L824,16.7 L820,16 L816,16 L812,14.5 L808,14.4 L804,16.1 L800,14.2 L796,14.3 L792,14.3 L788,13.4 L784,14.4 L780,15.6 L776,14.5 L772,13.3 L768,15.1 L764,12.5 L760,11.6 L756,14 L752,14.2 L748,14.6 L744,13.4 L740,11.3 L736,12.1 L732,11.1 L728,15.5 L724,14.3 L720,12.2 L716,11.5 L712,13.9 L708,14.3 L704,12.5 L700,11.7 L696,12 L692,15 L688,14.5 L684,13 L680,14.9 L676,12.3 L672,12.9 L668,12.9 L664,13.1 L660,14 L656,13 L652,15.3 L648,15.3 L644,14.2 L640,14.7 L636,15.5 L632,15 L628,16.6 L624,16.6 L620,14.9 L616,14.4 L612,16.5 L608,16.9 L604,14.9 L600,16.4 L596,15 L592,15.5 L588,16 L584,15.7 L580,16.7 L576,17.9 L572,15.4 L568,16.6 L564,16.9 L560,17 L556,15.7 L552,15.7 L548,14.5 L544,16.2 L540,16.1 L536,15.6 L532,15.6 L528,17.1 L524,14.3 L520,16 L516,14.4 L512,14.7 L508,14.6 L504,17.1 L500,15.1 L496,15.2 L492,15.5 L488,18 L484,15.1 L480,14.1 L476,16.2 L472,17.2 L468,18.1 L464,16.5 L460,16.5 L456,17.6 L452,17.3 L448,17.6 L444,20.1 L440,18.7 L436,19.7 L432,19.3 L428,19.8 L424,21.8 L420,21.7 L416,20.3 L412,19.9 L408,20.9 L404,23.5 L400,24.1 L396,22.1 L392,22 L388,22.5 L384,25.3 L380,24.3 L376,23.8 L372,24.8 L368,25.9 L364,25.3 L360,27.3 L356,27.8 L352,26.8 L348,26 L344,26.8 L340,26.7 L336,28.2 L332,27.2 L328,30 L324,29.5 L320,27.2 L316,30 L312,28.4 L308,28.4 L304,29 L300,27.6 L296,28.1 L292,30 L288,30 L284,27.5 L280,30 L276,29 L272,28.3 L268,29.9 L264,26.6 L260,26.5 L256,27.8 L252,28.4 L248,27 L244,25.6 L240,25.1 L236,26.1 L232,25.6 L228,26.2 L224,24.8 L220,25.1 L216,23.8 L212,24.7 L208,23.2 L204,24.4 L200,24.8 L196,24.6 L192,21.5 L188,21.3 L184,22.7 L180,20.5 L176,22.1 L172,22 L168,22.7 L164,19.3 L160,21.8 L156,22.2 L152,20.3 L148,21.6 L144,19.9 L140,20.8 L136,21.2 L132,19.6 L128,20.3 L124,20.3 L120,19.5 L116,21.4 L112,17.8 L108,19.1 L104,17.6 L100,19.1 L96,17.6 L92,17.9 L88,17.7 L84,19.8 L80,18.2 L76,18.8 L72,17.7 L68,18.5 L64,19.2 L60,21.2 L56,18.8 L52,18.6 L48,19.4 L44,19.5 L40,19.6 L36,18.9 L32,20.8 L28,20.3 L24,19.3 L20,17.7 L16,21.4 L12,21.8 L8,21.1 L4,19.2 L0,21.5 Z"
              fill="#FFF9F4"
            />
          </svg>
        </div>

        <div className="relative z-10 bg-[#FFF9F4] text-black">
          <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-4 px-5 sm:px-8 lg:px-10 py-1.5 lg:py-2">
            <a
              href="#hero"
              aria-label="Flavia Brito — Início"
              className="inline-flex items-center shrink-0 min-h-[40px]"
            >
              <picture>
                <source srcSet={OPTIMIZED_LOGO_WEBP_URL} type="image/webp" />
                <img
                  src={HEADER_LOGO_URL}
                  alt="Flavia Brito"
                  width={2132}
                  height={738}
                  decoding="async"
                  fetchPriority="high"
                  className="h-8 sm:h-9 w-auto object-contain block"
                />
              </picture>
            </a>

            <nav
              aria-label="Navegação principal"
              className="hidden md:flex items-center gap-6 lg:gap-8"
            >
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="font-ui text-[12.5px] font-semibold text-black/80 tracking-[0.05em] uppercase hover:text-[#FB0C72] transition-colors duration-[160ms] ease-editorial whitespace-nowrap py-1.5"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <a
              href={WHATSAPP_CTA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-2 bg-transparent border border-black rounded-[8px] px-4 py-2 font-ui text-[12px] font-bold tracking-[0.04em] uppercase text-black hover:bg-[#FB0C72] hover:-translate-y-0.5 transition-all duration-[260ms] ease-editorial whitespace-nowrap shrink-0"
            >
              <span>Estruturar Marca</span>
              <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2} />
            </a>

            <button
              type="button"
              aria-label="Abrir menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
              className="md:hidden min-w-[44px] min-h-[44px] flex flex-col justify-center items-end p-2 -mr-2 space-y-1.5 cursor-pointer"
            >
              <div className="w-6 h-0.5 bg-black" />
              <div className="w-6 h-0.5 bg-black" />
              <div className="w-4 h-0.5 bg-[#FB0C72]" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        aria-hidden={!menuOpen}
        className={`fixed inset-0 z-50 md:hidden bg-[#FFF9F4] text-black flex flex-col transition-all duration-[260ms] ease-editorial ${
          menuOpen
            ? 'opacity-100 visible'
            : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between px-5 sm:px-8 py-4 border-b border-black/15">
          <a
            href="#hero"
            aria-label="Flavia Brito — Início"
            onClick={() => setMenuOpen(false)}
            className="inline-flex items-center shrink-0 min-h-[44px]"
          >
            <picture>
              <source srcSet={OPTIMIZED_LOGO_WEBP_URL} type="image/webp" />
              <img
                src={HEADER_LOGO_URL}
                alt="Flavia Brito"
                width={2132}
                height={738}
                loading="lazy"
                decoding="async"
                className="h-9 sm:h-10 w-auto object-contain block"
              />
            </picture>
          </a>
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setMenuOpen(false)}
            className="min-w-[44px] min-h-[44px] grid place-items-center -mr-2 text-black cursor-pointer"
          >
            <X className="w-7 h-7" strokeWidth={1.75} />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
          {NAV_LINKS.map((link, i) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="font-display font-normal uppercase text-4xl sm:text-5xl text-black hover:text-[#FB0C72] tracking-[-0.02em] leading-[0.95] transition-all duration-[260ms] ease-editorial"
                style={{
                  transitionDelay: menuOpen ? `${i * 50 + 60}ms` : '0ms',
                  opacity: menuOpen ? 1 : 0,
                  transform: menuOpen ? 'translateY(0)' : 'translateY(14px)',
                }}
              >
                {link.label}
              </a>
          ))}

          <a
            href={WHATSAPP_CTA_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
            className="mt-4 inline-flex items-center gap-2 bg-[#FB0C72] hover:bg-[#D90761] border border-black rounded-[8px] shadow-[4px_4px_0_rgba(0,0,0,0.85)] px-6 py-3.5 font-ui text-[13px] font-bold tracking-[0.04em] uppercase text-black transition-all duration-[260ms] ease-editorial whitespace-nowrap"
            style={{
              transitionDelay: menuOpen
                ? `${NAV_LINKS.length * 50 + 60}ms`
                : '0ms',
              opacity: menuOpen ? 1 : 0,
              transform: menuOpen ? 'translateY(0)' : 'translateY(14px)',
            }}
          >
            <span>Estruturar Marca</span>
            <ArrowUpRight className="w-4 h-4" strokeWidth={2} />
          </a>
        </div>
      </div>

      {/* HERO SECTION — Reskinned to K-Pop Girly Editorial Design System */}
      <section
        ref={heroRef}
        id="hero"
        className="relative w-full min-h-[640px] md:min-h-[560px] md:h-[580px] lg:h-[640px] xl:h-[min(90vh,790px)] overflow-hidden bg-[#FBF7EF] text-black flex flex-col"
      >
        {/* Background Looping Video — enlarged & balanced center-right beside the copy */}
        <video
          ref={videoRef}
          poster={OPTIMIZED_HERO_POSTER_URL}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="
            absolute inset-0 w-full h-full object-cover object-[58%_center]
            md:inset-auto md:top-[22px] md:right-[-6%] lg:right-[-2%] xl:right-[2%]
            md:w-auto md:max-w-none md:h-[104%] lg:h-[105%] md:object-contain md:object-right-bottom
            md:[mask-image:linear-gradient(to_right,transparent_0%,black_10%)]
            md:[-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_10%)]
          "
        >
          <source src={OPTIMIZED_HERO_VIDEO_URL} type="video/mp4" />
          <source src={HERO_VIDEO_URL} type="video/mp4" />
        </video>

        {/* Hero Content — balanced width aligned with header grid */}
        <div className="relative z-10 flex-1 w-full max-w-[1260px] mx-auto flex flex-col justify-center px-5 sm:px-8 lg:px-10 pt-20 sm:pt-24 pb-10 sm:pb-12">
          <div className="w-full max-w-[340px] sm:max-w-[400px] md:max-w-[360px] lg:max-w-[440px] xl:max-w-[530px]">
            {/* Eyebrow Tag — Sticker Editorial Pill (DM Sans UI) */}
            <div className="inline-flex items-center gap-2.5 bg-[#FFF9F4] text-black border border-black rounded-[8px] px-3.5 py-2 shadow-[4px_4px_0_rgba(0,0,0,0.85)] mb-4 lg:mb-5 animate-fade-up">
              <Crown className="w-4 h-4 text-[#FB0C72] shrink-0" strokeWidth={2} />
              <span className="font-ui font-bold text-[11.5px] tracking-[0.05em] uppercase leading-tight">
                FLAVIA BRITO | HEAD DE CONTEÚDO
              </span>
            </div>

            {/* Main Heading — First sentence in Anton display font, second sentence in Caveat handwritten font */}
            <h1 className="max-w-[330px] sm:max-w-none animate-fade-up-delay-1">
              <span className="block font-display font-normal uppercase text-black leading-[0.98] tracking-[-0.02em] text-[clamp(2.25rem,8.8vw,3.1rem)] md:text-[clamp(2.55rem,3.6vw,3.85rem)]">
                Sua marca tem um diferencial?
              </span>
              <span className="mt-2 block max-w-[235px] sm:max-w-none font-handwritten font-bold normal-case text-[#D90761] leading-[0.96] tracking-[-0.015em] text-[clamp(1.85rem,7.2vw,2.65rem)] md:text-[clamp(2.2rem,3.1vw,3.25rem)] -rotate-1 origin-left">
                Seu conteúdo{' '}
                <span className="underline decoration-black decoration-[2.5px] underline-offset-[4px]">
                  PRECISA
                </span>{' '}
                deixar isso óbvio.
              </span>
            </h1>

            {/* Subtext — DM Sans (editorial paper backing on mobile only so dark jacket/icon never reduces contrast) */}
            <p className="mt-4 lg:mt-5 text-black/85 text-[14.5px] sm:text-[15.5px] xl:text-[17px] font-body font-medium leading-[1.52] sm:leading-[1.56] max-w-[330px] sm:max-w-[390px] xl:max-w-[485px] bg-[#FFF9F4]/92 md:bg-transparent border border-black md:border-0 rounded-[8px] md:rounded-none px-3.5 py-2.5 md:p-0 shadow-[3px_3px_0_rgba(0,0,0,0.85)] md:shadow-none animate-fade-up-delay-2">
              Eu construo posicionamento, estratégia e gestão de conteúdo para marcas
              criativas e alternativas que querem ser reconhecidas pelo que oferecem
              de melhor e de diferente.
            </p>

            {/* CTA Row — Primary Button (#FB0C72 / #000 text / #000 sticker shadow) */}
            <div className="mt-6 lg:mt-8 flex flex-wrap items-center gap-3.5 sm:gap-4 animate-fade-up-delay-3">
              <a
                href={WHATSAPP_CTA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2.5 bg-[#FB0C72] hover:bg-[#D90761] text-black font-ui font-bold px-5.5 py-3.5 rounded-[8px] border border-black shadow-[4px_4px_0_rgba(0,0,0,0.85)] text-[12.5px] tracking-[0.04em] uppercase hover:-translate-y-0.5 transition-all duration-[260ms] ease-editorial min-h-[44px]"
              >
                <span>Quero estruturar minha marca</span>
                <ArrowUpRight
                  className="w-4 h-4 transition-transform duration-[160ms] ease-editorial group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  strokeWidth={2}
                />
              </a>

              <div className="hidden xl:inline-flex items-center gap-2.5 bg-[#FFF9F4] text-black border border-black rounded-[8px] px-3.5 py-2.5 shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
                <Award className="w-4 h-4 text-[#FB0C72] shrink-0" strokeWidth={1.75} />
                <div className="font-ui text-[11px] font-semibold tracking-[0.04em] uppercase leading-tight">
                  <div>Posicionamento</div>
                  <div className="text-black/70">&amp; Conteúdo</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Animated Editorial Marquee Strip — Anton + Hot Pink / Aqua Mint sparkles */}
      <section
        ref={marqueeRef}
        id="brand-marquee"
        aria-label="Pilares da marca: Identidade, Posicionamento, Estratégia, Conteúdo"
        className="relative w-full overflow-hidden bg-black text-[#FFF9F4] border-y border-black py-4 sm:py-5 select-none"
      >
        <div
          className={`flex w-max animate-marquee hover:[animation-play-state:paused] ${
            marqueeActive ? '' : 'animate-marquee-paused'
          }`}
        >
          {[0, 1].map((dupIndex) => (
            <div
              key={dupIndex}
              aria-hidden={dupIndex === 1}
              className="flex shrink-0 items-center gap-6 sm:gap-9 lg:gap-12 pr-6 sm:pr-9 lg:pr-12"
            >
              {[0, 1, 2].map((repeatIndex) =>
                MARQUEE_WORDS.map((word, wIndex) => (
                  <div
                    key={`${dupIndex}-${repeatIndex}-${word}`}
                    className="flex shrink-0 items-center gap-6 sm:gap-9 lg:gap-12"
                  >
                    <span
                      className={`font-display font-normal text-xl sm:text-2xl lg:text-[26px] leading-none tracking-[0.01em] uppercase ${
                        wIndex % 2 === 1 ? 'text-[#F2BED6]' : 'text-[#FFF9F4]'
                      }`}
                    >
                      {word}
                    </span>
                    <svg
                      aria-hidden="true"
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      className={`shrink-0 ${
                        wIndex % 2 === 0 ? 'text-[#FB0C72]' : 'text-[#A5DCD1]'
                      }`}
                    >
                      <path
                        d="M8 0 L9.8 6.2 L16 8 L9.8 9.8 L8 16 L6.2 9.8 L0 8 L6.2 6.2 Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
