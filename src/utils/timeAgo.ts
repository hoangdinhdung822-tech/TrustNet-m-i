/**
 * TrustNet Facebook-Style Time Formatter
 * Định dạng thời gian bài đăng, bình luận và thông báo theo chuẩn Facebook tiếng Việt.
 * - < 1 phút: "Vừa xong"
 * - < 60 phút: "X phút trước" (hoặc "X phút")
 * - < 24 giờ: "X giờ trước" (hoặc "X giờ")
 * - Hôm qua: "Hôm qua lúc HH:mm"
 * - Trong vòng 7 ngày: "X ngày trước"
 * - Cùng năm: "D tháng M lúc HH:mm" (ví dụ: "21 tháng 10 lúc 14:30")
 * - Khác năm: "D tháng M, YYYY" (ví dụ: "15 tháng 8, 2025")
 * - Tooltip đầy đủ: "Thứ X, D tháng M, YYYY lúc HH:mm:ss"
 */

/**
 * Phân tích đầu vào thời gian thành Date object an toàn
 */
export function parseDateInput(dateInput: string | number | Date | undefined | null): Date {
  if (!dateInput) return new Date();

  if (dateInput instanceof Date) return dateInput;

  if (typeof dateInput === 'number') {
    return new Date(dateInput);
  }

  // Nếu là chuỗi ISO hoặc định dạng ngày tháng hợp lệ
  const parsed = new Date(dateInput);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  // Hỗ trợ định dạng ngày Việt Nam DD/MM/YYYY hoặc DD-MM-YYYY kèm HH:mm:ss
  const str = String(dateInput).trim();
  const dateMatch = str.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (dateMatch) {
    const timeMatch = str.match(/(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/);
    const d = parseInt(dateMatch[1], 10);
    const mo = parseInt(dateMatch[2], 10) - 1;
    const y = parseInt(dateMatch[3], 10);
    const h = timeMatch ? parseInt(timeMatch[1], 10) : 0;
    const min = timeMatch ? parseInt(timeMatch[2], 10) : 0;
    const s = timeMatch && timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
    const dObj = new Date(y, mo, d, h, min, s);
    if (!isNaN(dObj.getTime())) {
      return dObj;
    }
  }

  // Xử lý các chuỗi tương đối cũ (legacy) như "2 giờ trước", "4 giờ trước", "Vừa xong"
  const now = Date.now();
  const lower = str.toLowerCase();

  if (lower.includes('vừa xong') || lower === 'just now') {
    return new Date(now - 30 * 1000); // 30s trước
  }

  const minMatch = lower.match(/(\d+)\s*phút/);
  if (minMatch) {
    return new Date(now - parseInt(minMatch[1], 10) * 60 * 1000);
  }

  const hourMatch = lower.match(/(\d+)\s*giờ/);
  if (hourMatch) {
    return new Date(now - parseInt(hourMatch[1], 10) * 3600 * 1000);
  }

  const dayMatch = lower.match(/(\d+)\s*ngày/);
  if (dayMatch) {
    return new Date(now - parseInt(dayMatch[1], 10) * 86400 * 1000);
  }

  return new Date();
}

/**
 * Định dạng thời gian theo phong cách Facebook Việt Nam
 */
export function formatFacebookTime(dateInput: string | number | Date | undefined | null): string {
  const date = parseDateInput(dateInput);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  // Nếu thời gian ở tương lai hoặc vừa mới đăng (< 60 giây)
  if (diffMs < 60 * 1000) {
    return 'Vừa xong';
  }

  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  if (diffMinutes < 60) {
    return `${diffMinutes} phút trước`;
  }

  const diffHours = Math.floor(diffMs / (3600 * 1000));
  if (diffHours < 24) {
    return `${diffHours} giờ trước`;
  }

  // Kiểm tra ngày hôm qua
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = 
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  const hoursStr = String(date.getHours()).padStart(2, '0');
  const minutesStr = String(date.getMinutes()).padStart(2, '0');

  if (isYesterday) {
    return `Hôm qua lúc ${hoursStr}:${minutesStr}`;
  }

  const diffDays = Math.floor(diffMs / (86400 * 1000));
  if (diffDays <= 6) {
    return `${diffDays} ngày trước`;
  }

  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  // Cùng năm
  if (year === now.getFullYear()) {
    return `${day} tháng ${month} lúc ${hoursStr}:${minutesStr}`;
  }

  // Khác năm
  return `${day} tháng ${month}, ${year}`;
}

/**
 * Định dạng thời gian đầy đủ hiển thị trên Tooltip (khi rê chuột vào ngày giờ như Facebook)
 */
export function formatFacebookFullTime(dateInput: string | number | Date | undefined | null): string {
  const date = parseDateInput(dateInput);
  
  const dayNames = [
    'Chủ Nhật',
    'Thứ Hai',
    'Thứ Ba',
    'Thứ Tư',
    'Thứ Năm',
    'Thứ Sáu',
    'Thứ Bảy',
  ];

  const dayName = dayNames[date.getDay()];
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${dayName}, ${day} tháng ${month}, ${year} lúc ${hours}:${minutes}:${seconds}`;
}

/**
 * Định dạng thời gian dành riêng cho lịch sử kiểm chứng Fact-Check:
 * Trả về giờ:phút:giây - ngày/tháng/năm thật và thời gian tương đối chính xác với thời điểm tra cứu
 */
export function formatFactCheckDateTime(dateInput: string | number | Date | undefined | null): {
  exactTime: string;
  exactDate: string;
  exactFull: string;
  relative: string;
  tooltip: string;
} {
  const d = parseDateInput(dateInput);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  const exactTime = `${hours}:${minutes}:${seconds}`;
  const exactDate = `${day}/${month}/${year}`;
  const exactFull = `${exactTime} - ${exactDate}`;
  const relative = formatFacebookTime(d);
  const tooltip = formatFacebookFullTime(d);

  return {
    exactTime,
    exactDate,
    exactFull,
    relative,
    tooltip
  };
}
