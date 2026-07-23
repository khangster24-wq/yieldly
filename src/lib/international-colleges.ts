import type { College } from "@/lib/types";

/**
 * Curated set of REAL international universities — the schools IB-diploma
 * students most commonly target outside the U.S. (UK, Greater China, South
 * Korea, Australia, Italy, Spain, France). There is no single "College
 * Scorecard" for the rest of the world, so this dataset is assembled from
 * multiple sources per country rather than one federal database:
 *
 *   • United Kingdom — tuition from university-published international fee
 *     schedules; admission rates from official university admissions-statistics
 *     pages where published (Oxford, Cambridge, Imperial, LSE, UCL, KCL, Warwick,
 *     St Andrews); earnings from the UK government's LEO / Discover Uni dataset
 *     (median graduate earnings ~5 years post-grad — genuinely comparable to
 *     Scorecard's methodology, just a different window; see `earningsNote`).
 *   • Australia — tuition from university international fee schedules;
 *     admission rates from university-reported figures; earnings context from
 *     QILT (the Australian government's Graduate Outcomes Survey), though not
 *     mapped to a clean per-institution figure comparable to LEO, so left null.
 *   • Greater China, South Korea, Italy, Spain, France — tuition from
 *     university-published international/non-EU fee schedules; admission rates
 *     where a school publishes an actual international-applicant rate (several
 *     Chinese and Korean schools do); NO government earnings database exists in
 *     a comparable format, so `medianEarnings10yr` is honestly left null rather
 *     than estimated — those schools show an "Unrated" ROI, same as any U.S.
 *     school missing earnings data.
 *
 * Every `costOfAttendance` is tuition (converted to USD at approximate current
 * rates) plus a researched, city-appropriate annual living-cost estimate — the
 * living-cost figures are estimates, not official statistics, which is why this
 * dataset carries `dataSource` labels distinct from the US Scorecard pull.
 * Because most of these systems have no widespread need-based aid for
 * international students, `netPrice` equals `costOfAttendance` unless a school
 * publishes an explicit means-tested schedule (noted in the blurb) — there is
 * no fabricated "aid discount." `satAverage` and `medianDebt` are null
 * throughout (not applicable / not tracked in these systems).
 *
 * IDs start at 900001 to guarantee no collision with real Scorecard IDs.
 */

const UK_SOURCE = "Uni-published fees + official admissions stats + UK gov't LEO earnings data";
const CHINA_SOURCE = "Uni-published international fees + uni-reported international admit rates";
const KR_SOURCE = "Uni-published international fees + reported international admit rates";
const AU_SOURCE = "Uni-published international fees + uni-reported admit rates + QILT context";
const EU_SOURCE = "Uni-published international/non-EU fees + reported admit rates";

const LEO_NOTE = "UK gov't (LEO), median ~5 yrs post-grad";

export const INTERNATIONAL_COLLEGES: College[] = [
  // ---------------------------------------------------------------- United Kingdom
  { id: 900001, name: "University of Oxford", city: "Oxford", state: "United Kingdom", country: "United Kingdom", control: "public", size: 26000, sizeTier: "large", admissionRate: 0.17, costOfAttendance: 61200, netPrice: 61200, tuition: 44200, roomBoard: 17000, medianEarnings10yr: 65600, medianDebt: null, satAverage: null, earningsNote: LEO_NOTE, dataSource: UK_SOURCE, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/1_oxford_aerial_panorama_2016_%28cropped%29.jpg/960px-1_oxford_aerial_panorama_2016_%28cropped%29.jpg" },
  { id: 900002, name: "University of Cambridge", city: "Cambridge", state: "United Kingdom", country: "United Kingdom", control: "public", size: 24000, sizeTier: "large", admissionRate: 0.164, costOfAttendance: 67200, netPrice: 67200, tuition: 50200, roomBoard: 17000, medianEarnings10yr: 57100, medianDebt: null, satAverage: null, earningsNote: LEO_NOTE, dataSource: UK_SOURCE, imageUrl: "/images/colleges/cambridge.jpg" },
  { id: 900003, name: "Imperial College London", city: "London", state: "United Kingdom", country: "United Kingdom", control: "public", size: 20000, sizeTier: "large", admissionRate: 0.10, costOfAttendance: 72200, netPrice: 72200, tuition: 52200, roomBoard: 20000, medianEarnings10yr: 71300, medianDebt: null, satAverage: null, earningsNote: LEO_NOTE, dataSource: UK_SOURCE, imageUrl: "/images/colleges/imperial.jpg" },
  { id: 900004, name: "London School of Economics", city: "London", state: "United Kingdom", country: "United Kingdom", control: "public", size: 12000, sizeTier: "medium", admissionRate: 0.16, costOfAttendance: 60100, netPrice: 60100, tuition: 40100, roomBoard: 20000, medianEarnings10yr: 73600, medianDebt: null, satAverage: null, earningsNote: LEO_NOTE, dataSource: UK_SOURCE, imageUrl: "/images/colleges/lse.jpg" },
  { id: 900005, name: "University College London", city: "London", state: "United Kingdom", country: "United Kingdom", control: "public", size: 48000, sizeTier: "large", admissionRate: 0.167, costOfAttendance: 60100, netPrice: 60100, tuition: 40100, roomBoard: 20000, medianEarnings10yr: null, medianDebt: null, satAverage: null, dataSource: UK_SOURCE, imageUrl: "/images/colleges/ucl.jpg" },
  { id: 900006, name: "King's College London", city: "London", state: "United Kingdom", country: "United Kingdom", control: "public", size: 33000, sizeTier: "large", admissionRate: 0.13, costOfAttendance: 61500, netPrice: 61500, tuition: 41500, roomBoard: 20000, medianEarnings10yr: null, medianDebt: null, satAverage: null, dataSource: UK_SOURCE, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/King%27s_College_London_Strand_Campus_Quadrangle_01.pdf/page1-960px-King%27s_College_London_Strand_Campus_Quadrangle_01.pdf.jpg" },
  { id: 900007, name: "University of Edinburgh", city: "Edinburgh", state: "United Kingdom", country: "United Kingdom", control: "public", size: 35000, sizeTier: "large", admissionRate: 0.40, costOfAttendance: 52400, netPrice: 52400, tuition: 35400, roomBoard: 17000, medianEarnings10yr: null, medianDebt: null, satAverage: null, dataSource: UK_SOURCE, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Edinburgh_Futures_Institute_exterior_tower.jpg/960px-Edinburgh_Futures_Institute_exterior_tower.jpg" },
  // Manchester doesn't publish one official overall rate; ~56-59% is the
  // consistently-cited estimate across admissions sources, used as the
  // midpoint here — note it varies a lot by course (e.g. Law ~7.7%, Medicine
  // far lower), so this is a broad-university figure, not per-program.
  { id: 900008, name: "University of Manchester", city: "Manchester", state: "United Kingdom", country: "United Kingdom", control: "public", size: 44000, sizeTier: "large", admissionRate: 0.575, costOfAttendance: 48100, netPrice: 48100, tuition: 32100, roomBoard: 16000, medianEarnings10yr: null, medianDebt: null, satAverage: null, dataSource: UK_SOURCE, imageUrl: "/images/colleges/manchester.jpg" },
  { id: 900009, name: "University of Warwick", city: "Coventry", state: "United Kingdom", country: "United Kingdom", control: "public", size: 28000, sizeTier: "large", admissionRate: 0.14, costOfAttendance: 53400, netPrice: 53400, tuition: 37400, roomBoard: 16000, medianEarnings10yr: null, medianDebt: null, satAverage: null, dataSource: UK_SOURCE, imageUrl: "/images/colleges/warwick.jpg" },
  { id: 900010, name: "University of St Andrews", city: "St Andrews", state: "United Kingdom", country: "United Kingdom", control: "public", size: 10000, sizeTier: "medium", admissionRate: 0.08, costOfAttendance: 59500, netPrice: 59500, tuition: 44500, roomBoard: 15000, medianEarnings10yr: null, medianDebt: null, satAverage: null, dataSource: UK_SOURCE, imageUrl: "/images/colleges/st-andrews.jpg" },

  // ------------------------------------------------------------- Greater China
  { id: 900011, name: "Tsinghua University", city: "Beijing", state: "China", country: "China", control: "public", size: 36000, sizeTier: "large", admissionRate: 0.05, costOfAttendance: 12500, netPrice: 12500, tuition: 4500, roomBoard: 8000, medianEarnings10yr: null, medianDebt: null, satAverage: null, dataSource: CHINA_SOURCE, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Lawn_in_front_of_main_building_of_Tsinghua_University_2.JPG/960px-Lawn_in_front_of_main_building_of_Tsinghua_University_2.JPG" },
  { id: 900012, name: "Peking University", city: "Beijing", state: "China", country: "China", control: "public", size: 45000, sizeTier: "large", admissionRate: 0.153, costOfAttendance: 12000, netPrice: 12000, tuition: 4000, roomBoard: 8000, medianEarnings10yr: null, medianDebt: null, satAverage: null, dataSource: CHINA_SOURCE, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/fe/PekingUniversitycampus1.jpg" },
  // Fudan doesn't publish an official rate either; estimates for the
  // international-applicant pool range ~18-32%, so the midpoint is used —
  // domestic Gaokao-track admission is far more selective than this figure.
  { id: 900013, name: "Fudan University", city: "Shanghai", state: "China", country: "China", control: "public", size: 32000, sizeTier: "large", admissionRate: 0.25, costOfAttendance: 11300, netPrice: 11300, tuition: 3300, roomBoard: 8000, medianEarnings10yr: null, medianDebt: null, satAverage: null, dataSource: CHINA_SOURCE, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/201704_Gate_of_Fudan_University_Jiangwan_Campus.jpg/960px-201704_Gate_of_Fudan_University_Jiangwan_Campus.jpg" },
  { id: 900014, name: "Shanghai Jiao Tong University", city: "Shanghai", state: "China", country: "China", control: "public", size: 40000, sizeTier: "large", admissionRate: 0.32, costOfAttendance: 12400, netPrice: 12400, tuition: 4400, roomBoard: 8000, medianEarnings10yr: null, medianDebt: null, satAverage: null, dataSource: CHINA_SOURCE, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/%E6%9C%BA%E5%8A%A8%E6%A5%BC%E4%B8%8A%E7%9A%84%E4%BA%A4%E5%A4%A7%E4%B8%9C%E5%8C%BA%E5%85%A8%E6%99%AF_-_Panorama_of_Eastern_Part_of_SJTU_from_Mechanical_Engineering_Building_-_2010.06_-_panoramio.jpg/960px-%E6%9C%BA%E5%8A%A8%E6%A5%BC%E4%B8%8A%E7%9A%84%E4%BA%A4%E5%A4%A7%E4%B8%9C%E5%8C%BA%E5%85%A8%E6%99%AF_-_Panorama_of_Eastern_Part_of_SJTU_from_Mechanical_Engineering_Building_-_2010.06_-_panoramio.jpg" },
  { id: 900015, name: "University of Hong Kong", city: "Hong Kong", state: "Hong Kong", country: "Hong Kong", control: "public", size: 30000, sizeTier: "large", admissionRate: 0.17, costOfAttendance: 37600, netPrice: 37600, tuition: 25600, roomBoard: 12000, medianEarnings10yr: null, medianDebt: null, satAverage: null, dataSource: CHINA_SOURCE, imageUrl: "/images/colleges/hku.webp" },
  { id: 900016, name: "Hong Kong University of Science and Technology", city: "Hong Kong", state: "Hong Kong", country: "Hong Kong", control: "public", size: 16000, sizeTier: "large", admissionRate: 0.35, costOfAttendance: 29920, netPrice: 29920, tuition: 17920, roomBoard: 12000, medianEarnings10yr: null, medianDebt: null, satAverage: null, dataSource: CHINA_SOURCE, imageUrl: "/images/colleges/hkust.jpg" },
  { id: 900017, name: "Chinese University of Hong Kong", city: "Hong Kong", state: "Hong Kong", country: "Hong Kong", control: "public", size: 27000, sizeTier: "large", admissionRate: 0.23, costOfAttendance: 32800, netPrice: 32800, tuition: 20800, roomBoard: 12000, medianEarnings10yr: null, medianDebt: null, satAverage: null, dataSource: CHINA_SOURCE, imageUrl: "/images/colleges/cuhk.jpg" },

  // ------------------------------------------------------------------ South Korea
  // Yonsei's tuition reflects Underwood International College (UIC), its
  // primary English-taught international-admissions track — not the (lower)
  // Korean-taught domestic tuition. Korea University's tuition is the midpoint
  // of a published domestic annual-tuition band (₩5.0M–7.0M/yr) converted at
  // ~₩1,490/USD — the same methodology that matches Seoul National University's
  // figure almost exactly, so treated as sourced rather than a blind estimate;
  // it likely understates the true international-student rate somewhat, since
  // Korea University (unlike Yonsei) has no documented separate international
  // fee track to source instead. Its admission rate varies enormously by
  // track — ~5-8% for the hyper-competitive domestic CSAT/regular admissions
  // (top-1% scorers, esp. for medicine/business) vs. ~39-41% for
  // international/less-selective applicant pools. The international figure is
  // used here since it matches this dataset's audience (IB-diploma students
  // applying as international applicants), same as the other KR schools.
  { id: 900018, name: "Seoul National University", city: "Seoul", state: "South Korea", country: "South Korea", control: "public", size: 28000, sizeTier: "large", admissionRate: 0.17, costOfAttendance: 12400, netPrice: 12400, tuition: 3400, roomBoard: 9000, medianEarnings10yr: null, medianDebt: null, satAverage: null, dataSource: KR_SOURCE, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8f/Seoul_National_University_Main_Gate_at_Night.jpg" },
  { id: 900019, name: "Yonsei University", city: "Seoul", state: "South Korea", country: "South Korea", control: "private-nonprofit", size: 38000, sizeTier: "large", admissionRate: 0.18, costOfAttendance: 19800, netPrice: 19800, tuition: 10800, roomBoard: 9000, medianEarnings10yr: null, medianDebt: null, satAverage: null, dataSource: KR_SOURCE, imageUrl: "/images/colleges/yonsei.jpg" },
  { id: 900020, name: "Korea University", city: "Seoul", state: "South Korea", country: "South Korea", control: "private-nonprofit", size: 36000, sizeTier: "large", admissionRate: 0.40, costOfAttendance: 13100, netPrice: 13100, tuition: 4100, roomBoard: 9000, medianEarnings10yr: null, medianDebt: null, satAverage: null, dataSource: KR_SOURCE, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Aegineung_Park_in_Science_Campus_of_Korea_University_-_panoramio.jpg/960px-Aegineung_Park_in_Science_Campus_of_Korea_University_-_panoramio.jpg" },
  { id: 900021, name: "KAIST", city: "Daejeon", state: "South Korea", country: "South Korea", control: "public", size: 11000, sizeTier: "medium", admissionRate: 0.132, costOfAttendance: 13100, netPrice: 13100, tuition: 4100, roomBoard: 9000, medianEarnings10yr: null, medianDebt: null, satAverage: null, dataSource: KR_SOURCE, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/IBS%E2%80%93KAIST_Campus_Building.jpg/960px-IBS%E2%80%93KAIST_Campus_Building.jpg" },

  // -------------------------------------------------------------------- Australia
  { id: 900022, name: "University of Melbourne", city: "Melbourne", state: "Australia", country: "Australia", control: "public", size: 52000, sizeTier: "large", admissionRate: 0.77, costOfAttendance: 46200, netPrice: 46200, tuition: 29400, roomBoard: 16800, medianEarnings10yr: null, medianDebt: null, satAverage: null, dataSource: AU_SOURCE, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Aerial_panorama_of_Melbourne%27s_skyline_from_Carlton_North._September_2023.jpg/960px-Aerial_panorama_of_Melbourne%27s_skyline_from_Carlton_North._September_2023.jpg" },
  { id: 900023, name: "University of Sydney", city: "Sydney", state: "Australia", country: "Australia", control: "public", size: 55000, sizeTier: "large", admissionRate: 0.30, costOfAttendance: 54200, netPrice: 54200, tuition: 37400, roomBoard: 16800, medianEarnings10yr: null, medianDebt: null, satAverage: null, dataSource: AU_SOURCE, imageUrl: "/images/colleges/sydney.jpg" },
  { id: 900024, name: "Australian National University", city: "Canberra", state: "Australia", country: "Australia", control: "public", size: 20000, sizeTier: "large", admissionRate: 0.35, costOfAttendance: 53500, netPrice: 53500, tuition: 36700, roomBoard: 16800, medianEarnings10yr: null, medianDebt: null, satAverage: null, dataSource: AU_SOURCE, imageUrl: "/images/colleges/anu.jpg" },
  { id: 900025, name: "University of New South Wales", city: "Sydney", state: "Australia", country: "Australia", control: "public", size: 61000, sizeTier: "large", admissionRate: 0.35, costOfAttendance: 48300, netPrice: 48300, tuition: 31500, roomBoard: 16800, medianEarnings10yr: null, medianDebt: null, satAverage: null, dataSource: AU_SOURCE, imageUrl: "/images/colleges/unsw.jpg" },
  { id: 900026, name: "Monash University", city: "Melbourne", state: "Australia", country: "Australia", control: "public", size: 65000, sizeTier: "large", admissionRate: 0.40, costOfAttendance: 50000, netPrice: 50000, tuition: 33200, roomBoard: 16800, medianEarnings10yr: null, medianDebt: null, satAverage: null, dataSource: AU_SOURCE, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Iie_msa_campus_two.jpg/960px-Iie_msa_campus_two.jpg" },

  // ------------------------------------------------------------------------ Italy
  { id: 900027, name: "Bocconi University", city: "Milan", state: "Italy", country: "Italy", control: "private-nonprofit", size: 15000, sizeTier: "large", admissionRate: 0.30, costOfAttendance: 31400, netPrice: 31400, tuition: 19400, roomBoard: 12000, medianEarnings10yr: null, medianDebt: null, satAverage: null, dataSource: EU_SOURCE, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/94/Biblioteca_Universit%C3%A0_Bocconi.jpg" },
  { id: 900028, name: "Politecnico di Milano", city: "Milan", state: "Italy", country: "Italy", control: "public", size: 47000, sizeTier: "large", admissionRate: 0.50, costOfAttendance: 15100, netPrice: 15100, tuition: 3100, roomBoard: 12000, medianEarnings10yr: null, medianDebt: null, satAverage: null, dataSource: EU_SOURCE, imageUrl: "/images/colleges/polimi.jpg" },

  // ------------------------------------------------------------------------ Spain
  { id: 900029, name: "IE University", city: "Madrid", state: "Spain", country: "Spain", control: "private-nonprofit", size: 8000, sizeTier: "medium", admissionRate: 0.32, costOfAttendance: 35700, netPrice: 35700, tuition: 24700, roomBoard: 11000, medianEarnings10yr: null, medianDebt: null, satAverage: null, dataSource: EU_SOURCE, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/IE_Business_School_%28Madrid%29_01.jpg/960px-IE_Business_School_%28Madrid%29_01.jpg" },
  { id: 900030, name: "Complutense University of Madrid", city: "Madrid", state: "Spain", country: "Spain", control: "public", size: 63000, sizeTier: "large", admissionRate: 0.77, costOfAttendance: 12100, netPrice: 12100, tuition: 1100, roomBoard: 11000, medianEarnings10yr: null, medianDebt: null, satAverage: null, dataSource: EU_SOURCE, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Imagen_Bancos_exterior_Facultad_ccinfo.jpg/960px-Imagen_Bancos_exterior_Facultad_ccinfo.jpg" },

  // ----------------------------------------------------------------------- France
  // HEC Paris was historically a graduate-only grande école; it entered the
  // undergraduate market only recently via a single joint program (Bachelor in
  // Data, Society & Organizations, run with Bocconi — first 3 semesters in
  // Milan, final 3 at HEC Paris), tuition €23,000–26,500/yr. That program's
  // published range is the source here, not a general HEC Paris sticker price
  // — flagged to the student via `costNote` since "HEC Paris tuition" doesn't
  // mean the same thing here as it does for a school offering broad UG admission.
  { id: 900031, name: "Sciences Po", city: "Paris", state: "France", country: "France", control: "public", size: 15000, sizeTier: "large", admissionRate: 0.20, costOfAttendance: 30000, netPrice: 30000, tuition: 17000, roomBoard: 13000, medianEarnings10yr: null, medianDebt: null, satAverage: null, dataSource: EU_SOURCE, imageUrl: "/images/colleges/sciences-po.jpg" },
  { id: 900032, name: "HEC Paris", city: "Jouy-en-Josas", state: "France", country: "France", control: "private-nonprofit", size: 4500, sizeTier: "small", admissionRate: 0.27, costOfAttendance: 39300, netPrice: 39300, tuition: 28300, roomBoard: 11000, medianEarnings10yr: null, medianDebt: null, satAverage: null, dataSource: EU_SOURCE, costNote: "HEC Paris is mainly a graduate business school; this is its one undergraduate track (a double degree with Bocconi University), not a general HEC Paris price.", imageUrl: "/images/colleges/hec-paris.jpg" },
  { id: 900033, name: "École Polytechnique", city: "Palaiseau", state: "France", country: "France", control: "public", size: 3400, sizeTier: "small", admissionRate: 0.11, costOfAttendance: 27600, netPrice: 27600, tuition: 13800, roomBoard: 13800, medianEarnings10yr: null, medianDebt: null, satAverage: null, dataSource: EU_SOURCE, imageUrl: "/images/colleges/polytechnique.webp" },
  { id: 900034, name: "Sorbonne University", city: "Paris", state: "France", country: "France", control: "public", size: 55000, sizeTier: "large", admissionRate: 0.20, costOfAttendance: 16700, netPrice: 16700, tuition: 3700, roomBoard: 13000, medianEarnings10yr: null, medianDebt: null, satAverage: null, dataSource: EU_SOURCE, imageUrl: "/images/colleges/sorbonne.jpg" },
];
