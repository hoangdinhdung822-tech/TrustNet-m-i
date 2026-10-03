import { SearchResultItem } from '../types';

export interface OfficialPortal {
  id: 'chinhphu.vn' | 'tuoitre.vn' | 'moh.gov.vn';
  name: string;
  shortName: string;
  baseUrl: string;
  badge: string;
  color: string;
  accentBorder: string;
  accentBg: string;
  iconType: 'gov' | 'news' | 'health';
  description: string;
  officialTrustScore: number;
  liveSearchUrl: (query: string) => string;
  googleSiteSearchUrl: (query: string) => string;
}

export const OFFICIAL_PORTALS: Record<string, OfficialPortal> = {
  'chinhphu.vn': {
    id: 'chinhphu.vn',
    name: 'Cổng Thông tin Điện tử Chính phủ',
    shortName: 'chinhphu.vn',
    baseUrl: 'https://chinhphu.vn',
    badge: 'Cơ quan Nhà nước (.gov.vn)',
    color: 'text-amber-400',
    accentBorder: 'border-amber-500/40',
    accentBg: 'bg-amber-500/10',
    iconType: 'gov',
    description: 'Văn bản quy phạm pháp luật, chỉ đạo của Thủ tướng Chính phủ, chính quyền số & thông cáo báo chí chính thống.',
    officialTrustScore: 99,
    liveSearchUrl: (q: string) => `https://chinhphu.vn/tim-kiem?q=${encodeURIComponent(q)}`,
    googleSiteSearchUrl: (q: string) => `https://www.google.com/search?q=site:chinhphu.vn+${encodeURIComponent(q)}`
  },
  'tuoitre.vn': {
    id: 'tuoitre.vn',
    name: 'Báo Tuổi Trẻ Online',
    shortName: 'tuoitre.vn',
    baseUrl: 'https://tuoitre.vn',
    badge: 'Báo chí chính thống (Được cấp phép)',
    color: 'text-rose-400',
    accentBorder: 'border-rose-500/40',
    accentBg: 'bg-rose-500/10',
    iconType: 'news',
    description: 'Thời sự 24/7, chuyên mục kiểm chứng "Nói Lại Cho Rõ", điều tra độc lập vạch trần tin đồn và bẫy lừa đảo mạng.',
    officialTrustScore: 95,
    liveSearchUrl: (q: string) => `https://tuoitre.vn/tim-kiem.htm?keywords=${encodeURIComponent(q)}`,
    googleSiteSearchUrl: (q: string) => `https://www.google.com/search?q=site:tuoitre.vn+${encodeURIComponent(q)}`
  },
  'moh.gov.vn': {
    id: 'moh.gov.vn',
    name: 'Cổng Thông tin Bộ Y tế',
    shortName: 'moh.gov.vn',
    baseUrl: 'https://moh.gov.vn',
    badge: 'Bộ Y tế Việt Nam (.gov.vn)',
    color: 'text-emerald-400',
    accentBorder: 'border-emerald-500/40',
    accentBg: 'bg-emerald-500/10',
    iconType: 'health',
    description: 'Thông báo khẩn về dịch bệnh theo mùa, vắc xin tiêm chủng, an toàn thực phẩm và đính chính các thông tin thuốc giả.',
    officialTrustScore: 98,
    liveSearchUrl: (q: string) => `https://moh.gov.vn/tim-kiem?q=${encodeURIComponent(q)}`,
    googleSiteSearchUrl: (q: string) => `https://www.google.com/search?q=site:moh.gov.vn+${encodeURIComponent(q)}`
  }
};

export const MASTER_SEARCH_CATALOG: SearchResultItem[] = [
  // 1. CHINHPHU.VN (Cổng Thông tin Điện tử Chính phủ)
  {
    id: 'src-cp-01',
    title: 'Nghị định 15/2020/NĐ-CP: Mức phạt đối với hành vi tung tin giả, xuyên tạc trên mạng',
    summary: 'Quy định chi tiết các mức phạt hành chính từ 10 - 20 triệu đồng đối với hành vi chia sẻ thông tin bịa đặt, sai sự thật gây hoang mang dư luận hoặc xúc phạm danh dự tổ chức, cá nhân.',
    source: 'Cổng TTĐT Chính phủ',
    sourceType: 'Cơ quan Nhà nước',
    date: 'Hôm nay',
    url: 'https://chinhphu.vn',
    credibilityScore: 99,
    reliability: 'Rất cao',
    category: 'official',
    connectedPortal: 'chinhphu.vn'
  },
  {
    id: 'src-cp-02',
    title: 'Cổng Dịch vụ công Quốc gia: Cảnh báo thủ đoạn mạo danh cán bộ thuế và công an lừa cài app VNeID giả',
    summary: 'Khuyến cáo người dân chỉ tải ứng dụng định danh điện tử qua Google Play và App Store chính thức, tuyệt đối không cài file .apk lạ từ đường link lạ do kẻ xấu gửi qua Zalo hay SMS.',
    source: 'Cổng Dịch vụ công Quốc gia (chinhphu.vn)',
    sourceType: 'Cơ quan Nhà nước',
    date: 'Hôm qua',
    url: 'https://dichvucong.gov.vn',
    credibilityScore: 99,
    reliability: 'Rất cao',
    category: 'official',
    connectedPortal: 'chinhphu.vn'
  },
  {
    id: 'src-cp-03',
    title: 'Thông cáo báo chí Văn phòng Chính phủ: Đính chính tin đồn giả mạo quyết định nghỉ Tết và lịch thi',
    summary: 'Văn phòng Chính phủ khẳng định mọi công văn, quyết định chính thức đều được đăng tải trực tiếp tại chinhphu.vn và có chữ ký số điện tử hợp lệ.',
    source: 'Cổng TTĐT Chính phủ',
    sourceType: 'Cơ quan Nhà nước',
    date: '28/09/2026',
    url: 'https://chinhphu.vn',
    credibilityScore: 99,
    reliability: 'Rất cao',
    category: 'official',
    connectedPortal: 'chinhphu.vn'
  },
  {
    id: 'src-cp-04',
    title: 'Quyết định số 749/QĐ-TTg của Thủ tướng Chính phủ: Phê duyệt Chương trình Chuyển đổi số quốc gia',
    summary: 'Chiến lược phát triển chính phủ số, kinh tế số và xã hội số toàn diện; ưu tiên trang bị kỹ năng an toàn số và phản biện thông tin cho học sinh, thanh thiếu niên.',
    source: 'Cổng TTĐT Chính phủ',
    sourceType: 'Cơ quan Nhà nước',
    date: '25/09/2026',
    url: 'https://chinhphu.vn',
    credibilityScore: 98,
    reliability: 'Rất cao',
    category: 'official',
    connectedPortal: 'chinhphu.vn'
  },
  {
    id: 'src-cp-05',
    title: 'Chính sách hỗ trợ học phí và bảo hiểm y tế học sinh, sinh viên năm học 2025 - 2026',
    summary: 'Nghị định mới của Chính phủ quy định miễn giảm học phí cho các đối tượng chính sách, học sinh vùng đồng bào dân tộc thiểu số và hỗ trợ mức đóng BHYT.',
    source: 'Cổng TTĐT Chính phủ',
    sourceType: 'Cơ quan Nhà nước',
    date: '20/09/2026',
    url: 'https://chinhphu.vn',
    credibilityScore: 99,
    reliability: 'Rất cao',
    category: 'official',
    connectedPortal: 'chinhphu.vn'
  },

  // 2. TUOITRE.VN (Báo Tuổi Trẻ Online)
  {
    id: 'src-tt-01',
    title: 'Tuổi Trẻ Online: Kiểm chứng thông tin - Mục Nói Lại Cho Rõ',
    summary: 'Chuyên mục điều tra độc lập của báo Tuổi Trẻ, xác minh các tin đồn chấn động trên mạng xã hội, phỏng vấn chuyên gia và đưa ra bằng chứng thực tế khách quan.',
    source: 'Báo Tuổi Trẻ Online',
    sourceType: 'Báo chính thống',
    date: 'Hôm nay',
    url: 'https://tuoitre.vn/noi-lai-cho-ro.htm',
    credibilityScore: 95,
    reliability: 'Rất cao',
    category: 'news',
    connectedPortal: 'tuoitre.vn'
  },
  {
    id: 'src-tt-02',
    title: 'Tuổi Trẻ Pháp Luật: Vạch trần chiêu trò lừa đảo "việc nhẹ lương cao" like video TikTok kiếm 500k/ngày',
    summary: 'Hàng loạt nạn nhân bị dẫn dụ vào nhóm Telegram nạp tiền cọc rồi bị đóng băng tài khoản. Cảnh sát khuyến cáo không có công việc nào kiếm tiền dễ dàng như quảng cáo trên mạng.',
    source: 'Báo Tuổi Trẻ Online',
    sourceType: 'Báo chính thống',
    date: 'Hôm qua',
    url: 'https://tuoitre.vn',
    credibilityScore: 95,
    reliability: 'Rất cao',
    category: 'news',
    connectedPortal: 'tuoitre.vn'
  },
  {
    id: 'src-tt-03',
    title: 'Tuổi Trẻ Giáo Dục: Đính chính thông tin "lộ đề thi môn Ngữ văn và Toán" lan truyền trên mạng',
    summary: 'Bộ GD&ĐT cùng cơ quan an ninh mạng khẳng định hình ảnh đề thi trôi nổi trên mạng là đề thi thử của các năm trước được cắt ghép, kích động phụ huynh và thí sinh.',
    source: 'Báo Tuổi Trẻ Online',
    sourceType: 'Báo chính thống',
    date: '27/09/2026',
    url: 'https://tuoitre.vn',
    credibilityScore: 94,
    reliability: 'Rất cao',
    category: 'news',
    connectedPortal: 'tuoitre.vn'
  },
  {
    id: 'src-tt-04',
    title: 'Tuổi Trẻ Sống Khỏe: Sự thật về bài thuốc nam gia truyền "trị dứt điểm ung thư" trên Facebook',
    summary: 'Bác sĩ Bệnh viện K trung ương cảnh báo việc bỏ phác đồ điều trị y khoa hiện đại để uống thuốc nam trôi nổi khiến nhiều bệnh nhân mất đi cơ hội cứu sống quý giá.',
    source: 'Báo Tuổi Trẻ Online',
    sourceType: 'Báo chính thống',
    date: '24/09/2026',
    url: 'https://tuoitre.vn',
    credibilityScore: 95,
    reliability: 'Rất cao',
    category: 'news',
    connectedPortal: 'tuoitre.vn'
  },
  {
    id: 'src-tt-05',
    title: 'Tuổi Trẻ Công Nghệ: Cảnh báo thủ đoạn mạo danh video Deepfake gọi điện vay tiền',
    summary: 'Phân tích thủ thuật tạo video cử động mặt đơ cứng, âm thanh giật cục để giả mạo bạn bè đang cấp cứu mượn tiền gấp và hướng dẫn cách nhận diện nhanh.',
    source: 'Báo Tuổi Trẻ Online',
    sourceType: 'Báo chính thống',
    date: '22/09/2026',
    url: 'https://tuoitre.vn',
    credibilityScore: 95,
    reliability: 'Rất cao',
    category: 'news',
    connectedPortal: 'tuoitre.vn'
  },

  // 3. MOH.GOV.VN (Cổng Thông tin Bộ Y tế)
  {
    id: 'src-moh-01',
    title: 'Bộ Y tế: Khuyến cáo khẩn cấp về công tác giám sát và tiêm chủng phòng chống dịch sởi mùa tựu trường',
    summary: 'Yêu cầu các trường học phối hợp trạm y tế rà soát tiền sử tiêm chủng của học sinh, tổ chức tiêm bù tiêm vét và thực hiện các biện pháp thông thoáng lớp học.',
    source: 'Bộ Y tế Việt Nam',
    sourceType: 'Cơ quan Nhà nước',
    date: 'Hôm nay',
    url: 'https://moh.gov.vn',
    credibilityScore: 98,
    reliability: 'Rất cao',
    category: 'official',
    connectedPortal: 'moh.gov.vn'
  },
  {
    id: 'src-moh-02',
    title: 'Cục An toàn thực phẩm (Bộ Y tế): Cảnh báo hàng loạt thực phẩm chức năng giả mạo giấy phép lưu hành',
    summary: 'Công bố danh tính 12 nhãn hiệu trà giảm cân, viên uống tăng chiều cao quảng cáo thổi phồng công dụng như thần dược trên sàn thương mại điện tử và mạng xã hội.',
    source: 'Cục An toàn Thực phẩm (Bộ Y tế)',
    sourceType: 'Cơ quan Nhà nước',
    date: 'Hôm qua',
    url: 'https://vfa.gov.vn',
    credibilityScore: 98,
    reliability: 'Rất cao',
    category: 'official',
    connectedPortal: 'moh.gov.vn'
  },
  {
    id: 'src-moh-03',
    title: 'Bộ Y tế: Bác bỏ tin đồn thất thiệt về loại virus lạ gây suy hô hấp cấp tính tại các thành phố',
    summary: 'Bộ Y tế khẳng định hệ thống giám sát dịch bệnh quốc gia hoạt động 24/7 và hoàn toàn không ghi nhận bất kỳ chủng virus lạ nào như thông tin lan truyền trên các hội nhóm mạng xã hội.',
    source: 'Bộ Y tế Việt Nam',
    sourceType: 'Cơ quan Nhà nước',
    date: '26/09/2026',
    url: 'https://moh.gov.vn',
    credibilityScore: 99,
    reliability: 'Rất cao',
    category: 'official',
    connectedPortal: 'moh.gov.vn'
  },
  {
    id: 'src-moh-04',
    title: 'Cục Quản lý Khám chữa bệnh: Hướng dẫn sơ cấp cứu ngộ độc thực phẩm học đường và tai nạn sinh hoạt',
    summary: 'Cung cấp tài liệu đào tạo chuẩn y khoa về kỹ thuật hô hấp nhân tạo, xử trí hóc dị vật Heimlich và các bước ứng phó tức thì tại phòng y tế học đường.',
    source: 'Cục Quản lý Khám chữa bệnh (Bộ Y tế)',
    sourceType: 'Cơ quan Nhà nước',
    date: '21/09/2026',
    url: 'https://moh.gov.vn',
    credibilityScore: 98,
    reliability: 'Rất cao',
    category: 'official',
    connectedPortal: 'moh.gov.vn'
  },
  {
    id: 'src-moh-05',
    title: 'Bộ Y tế: Khuyến cáo phòng chống sốt xuất huyết Dengue theo mùa và diệt lăng quăng bọ gậy',
    summary: 'Hướng dẫn các gia đình dọn dẹp nơi chứa nước đọng, ngủ màn kể cả ban ngày và các dấu hiệu cảnh báo nguy hiểm cần đưa bệnh nhân đến cơ sở y tế gần nhất.',
    source: 'Bộ Y tế Việt Nam',
    sourceType: 'Cơ quan Nhà nước',
    date: '18/09/2026',
    url: 'https://moh.gov.vn',
    credibilityScore: 98,
    reliability: 'Rất cao',
    category: 'official',
    connectedPortal: 'moh.gov.vn'
  },

  // 4. Các nguồn kiểm chứng uy tín khác (VAFC Tingia.gov.vn, Báo Lao Động, Giáo Dục)
  {
    id: 'src-vafc-01',
    title: 'Trung tâm Xử lý Tin giả Việt Nam (VAFC): Danh sách các website và fanpage lừa đảo mới bị chặn',
    summary: 'Công bố hơn 150 tên miền giả mạo ngân hàng, sàn giao dịch tiền ảo bất hợp pháp và cảnh báo các chiến dịch tin giả có tổ chức.',
    source: 'VAFC (Bộ TT&TT)',
    sourceType: 'Chuyên trang Công nghệ',
    date: '25/09/2026',
    url: 'http://tingia.gov.vn',
    credibilityScore: 97,
    reliability: 'Rất cao',
    category: 'tech',
    connectedPortal: 'other'
  }
];
