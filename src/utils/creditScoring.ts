import type { CreditGrade, CreditScoreResult, RepaymentRecord, User } from '../types';

/**
 * Thuật toán chấm điểm tín nhiệm mô phỏng A-D (thang 100 điểm).
 * Minh bạch, dựa trên quy tắc rõ ràng, không dùng GPA làm căn cứ duy nhất.
 */
export function calculateSimulatedCreditScore(
  user: User,
  repayments: RepaymentRecord[] = [],
  requestedAmount = 3_000_000
): CreditScoreResult {
  // 1. Hoàn thiện hồ sơ (tối đa 20 điểm)
  let profileScore = 8;
  if (user.university && user.university.trim().length > 3) profileScore += 4;
  if (user.studentId && user.studentId.trim().length >= 4) profileScore += 4;
  if (user.phone && user.phone.trim().length >= 9) profileScore += 4;

  // 2. Kết quả học tập GPA (tối đa 20 điểm - chỉ là 1 trong 5 yếu tố)
  const gpa = user.gpa ?? 2.8;
  let gpaScore = 10;
  if (gpa >= 3.4) gpaScore = 20;
  else if (gpa >= 3.0) gpaScore = 17;
  else if (gpa >= 2.6) gpaScore = 14;
  else if (gpa >= 2.2) gpaScore = 11;
  else gpaScore = 8;

  // 3. Khả năng tài chính & thu nhập hàng tháng (tối đa 25 điểm)
  const income = user.monthlyIncome ?? 2_500_000;
  let financialCapacityScore = 10;
  if (income >= 5_000_000) financialCapacityScore = 25;
  else if (income >= 3_500_000) financialCapacityScore = 21;
  else if (income >= 2_500_000) financialCapacityScore = 17;
  else if (income >= 1_500_000) financialCapacityScore = 13;

  // 4. Tỷ lệ khoản vay so với thu nhập (tối đa 20 điểm)
  const ratio = income > 0 ? requestedAmount / (income * 3) : 2;
  let incomeStabilityScore = 12;
  if (ratio <= 0.6) incomeStabilityScore = 20;
  else if (ratio <= 1.0) incomeStabilityScore = 17;
  else if (ratio <= 1.5) incomeStabilityScore = 14;
  else incomeStabilityScore = 10;

  // 5. Lịch sử thanh toán mô phỏng trong hệ thống (tối đa 15 điểm)
  const userRepayments = repayments.filter((r) => r.borrowerId === user.id);
  const repaymentHistoryScore = Math.min(15, 7 + userRepayments.length * 3);

  const score = Math.min(
    100,
    profileScore + gpaScore + financialCapacityScore + incomeStabilityScore + repaymentHistoryScore
  );

  let grade: CreditGrade = 'D';
  if (score >= 80) grade = 'A';
  else if (score >= 65) grade = 'B';
  else if (score >= 50) grade = 'C';

  const reasons: string[] = [
    `Hồ sơ sinh viên ${profileScore >= 18 ? 'đầy đủ thông tin cơ bản' : 'cần bổ sung thêm thông tin'} (${profileScore}/20 điểm).`,
    `GPA hiện tại (${gpa.toFixed(2)}/4.0) đóng góp ${gpaScore}/20 điểm — không phải tiêu chí duy nhất.`,
    `Thu nhập/trợ cấp hàng tháng (${income.toLocaleString('vi-VN')} đ) cho thấy khả năng cân đối tài chính đạt ${financialCapacityScore}/25 điểm.`,
    `Lịch sử thanh toán mô phỏng ghi nhận ${userRepayments.length} giao dịch hoàn trả (${repaymentHistoryScore}/15 điểm).`,
  ];

  const recommendations: string[] = [];
  if (profileScore < 20) {
    recommendations.push('Cập nhật đầy đủ mã sinh viên, trường đại học và số điện thoại liên hệ.');
  }
  if (financialCapacityScore < 20) {
    recommendations.push('Bổ sung minh họa nguồn thu nhập từ làm thêm hoặc trợ cấp gia đình để tăng mức an toàn.');
  }
  if (repaymentHistoryScore < 15) {
    recommendations.push('Thực hiện thanh toán đúng hạn các kỳ trong mô phỏng để tích lũy điểm lịch sử.');
  }
  if (recommendations.length === 0) {
    recommendations.push('Hồ sơ mô phỏng đang ở trạng thái tốt. Tiếp tục duy trì kỷ luật hoàn trả và quản lý ngân sách.');
  }

  return {
    userId: user.id,
    score,
    grade,
    factors: {
      profileScore,
      gpaScore,
      financialCapacityScore,
      incomeStabilityScore,
      repaymentHistoryScore,
    },
    reasons,
    recommendations,
    updatedAt: new Date().toISOString(),
  };
}
