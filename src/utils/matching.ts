import type { CapitalOffer, LoanRequest } from '../types';

export interface MatchResult {
  score: number; // 0 - 100
  reasons: string[];
  bestOffer: CapitalOffer | null;
}

/**
 * Thuật toán ghép nối theo quy tắc (Rule-based Matching) giữa nhu cầu vay và nguồn vốn khả dụng.
 * Chỉ phục vụ gợi ý minh họa trong đề án, không phải đánh giá rủi ro tín dụng chính thức.
 */
export function computeSmartMatch(
  loan: LoanRequest,
  lenderOffers: CapitalOffer[]
): MatchResult {
  const activeOffers = lenderOffers.filter(
    (o) =>
      o.status === 'Đang khả dụng' ||
      o.status === 'Đang chờ kết nối' ||
      o.status === 'Đã phân bổ một phần'
  );

  if (activeOffers.length === 0) {
    return {
      score: 0,
      reasons: ['Bạn chưa có nguồn vốn khả dụng nào để đối chiếu.'],
      bestOffer: null,
    };
  }

  let bestScore = -1;
  let bestReasons: string[] = [];
  let bestOffer: CapitalOffer | null = null;

  for (const offer of activeOffers) {
    const available = Math.max(0, offer.totalCapital - offer.allocatedCapital);
    let score = 0;
    const reasons: string[] = [];

    // 1. Khả năng đáp ứng số tiền (tối đa 35 điểm)
    if (
      available >= loan.amount &&
      loan.amount >= offer.minPerLoan &&
      loan.amount <= offer.maxPerLoan
    ) {
      score += 35;
      reasons.push(`Phù hợp số tiền (${offer.code} đủ ${loan.amount.toLocaleString('vi-VN')} đ)`);
    } else if (available >= loan.amount) {
      score += 18;
      reasons.push('Nguồn vốn đủ số dư nhưng ngoài khoảng min/max ưu tiên');
    }

    // 2. Kỳ hạn hỗ trợ (tối đa 25 điểm)
    if (offer.supportedTerms.includes(loan.termMonths)) {
      score += 25;
      reasons.push(`Phù hợp kỳ hạn ${loan.termMonths} tháng`);
    } else {
      score += 8;
    }

    // 3. Mục đích hỗ trợ (tối đa 20 điểm)
    if (offer.supportedPurposes.includes(loan.purpose)) {
      score += 20;
      reasons.push(`Phù hợp mục đích "${loan.purpose}"`);
    }

    // 4. Điểm tín nhiệm mô phỏng (tối đa 20 điểm)
    if (loan.creditGrade === 'A') {
      score += 20;
      reasons.push('Hạng tín nhiệm mô phỏng A (tốt)');
    } else if (loan.creditGrade === 'B') {
      score += 15;
      reasons.push('Hạng tín nhiệm mô phỏng B (khá)');
    } else if (loan.creditGrade === 'C') {
      score += 10;
    } else {
      score += 5;
    }

    if (score > bestScore) {
      bestScore = score;
      bestReasons = reasons;
      bestOffer = offer;
    }
  }

  return {
    score: Math.min(100, Math.max(0, bestScore)),
    reasons: bestReasons,
    bestOffer,
  };
}
