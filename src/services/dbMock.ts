import { 
  User, Post, Comment, FactCheckRecord, Lesson, Scenario, ReportItem, SearchResultItem 
} from '../types';
import { 
  MASTER_LESSONS_CATALOG, 
  buildWeeklyLessonsSchedule, 
  getCurrentAcademicWeek, 
  getNextLessonUnlockInfo 
} from '../data/lessonsData';
import { MASTER_SCENARIOS_CATALOG } from '../data/scenariosData';
import { MASTER_SEARCH_CATALOG } from '../data/searchData';

const STORAGE_KEYS = {
  USER: 'trustnet_current_user',
  POSTS: 'trustnet_posts',
  COMMENTS: 'trustnet_comments',
  FACT_CHECKS: 'trustnet_fact_checks',
  LESSONS: 'trustnet_lessons',
  SCENARIOS: 'trustnet_scenarios',
  REPORTS: 'trustnet_reports',
  ACCOUNTS: 'trustnet_accounts',
  IS_LOGGED_IN: 'trustnet_is_logged_in',
};

// Initial Accounts Collection
export const INITIAL_ACCOUNTS: User[] = [
  {
    id: 'u-dung-01',
    username: 'hoangdinhdung822',
    name: 'Hoàng Đình Dũng',
    email: 'hoangdinhdung822@gmail.com',
    password: '123456',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
    school: 'Trường THPT Số 1 Phan Đình Phùng',
    className: 'Khối 11 - Đoàn Trường',
    bio: 'Học sinh THPT Số 1 Phan Đình Phùng đam mê an toàn số, công nghệ & AI kiểm chứng tin tức.',
    points: 850,
    role: 'user',
    rankTitle: 'Người kiểm chứng (Fact Checker)',
    badges: [
      {
        id: 'b-fact-checker',
        name: 'Fact Checker',
        icon: '🏅',
        description: 'Đã thực hiện hơn 10 lượt kiểm chứng thông tin chính xác.',
        isUnlocked: true,
        unlockedAt: '2026-09-15'
      },
      {
        id: 'b-cyber-guardian',
        name: 'Cyber Guardian',
        icon: '🛡️',
        description: 'Vượt qua 5 tình huống an ninh mạng với độ chính xác trên 80%.',
        isUnlocked: true,
        unlockedAt: '2026-09-20'
      },
      {
        id: 'b-school-rep',
        name: 'Đại sứ THPT Số 1',
        icon: '🏫',
        description: 'Đại sứ lan tỏa văn hóa kiểm chứng tại THPT Số 1 Phan Đình Phùng.',
        isUnlocked: true,
        unlockedAt: '2026-09-22'
      }
    ],
    factChecksCount: 18,
    scenariosCompletedCount: 9,
    quizAccuracy: 92,
    createdAt: '2026-08-15'
  },
  {
    id: 'u-genz-01',
    username: 'baotram_digital',
    name: 'Bảo Trâm',
    email: 'baotram.tech@trustnet.vn',
    password: '123456',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    school: 'Trường THPT Số 1 Phan Đình Phùng',
    className: 'Lớp 11A2',
    bio: 'Sống có phản biện, đọc có kiểm chứng. Thành viên CLB Truyền thông số.',
    points: 450,
    role: 'user',
    rankTitle: 'Người kiểm chứng',
    badges: [
      {
        id: 'b-fact-checker',
        name: 'Fact Checker',
        icon: '🏅',
        description: 'Đã thực hiện hơn 10 lượt kiểm chứng thông tin chính xác.',
        isUnlocked: true,
        unlockedAt: '2026-09-15'
      },
      {
        id: 'b-cyber-guardian',
        name: 'Cyber Guardian',
        icon: '🛡️',
        description: 'Vượt qua 5 tình huống an ninh mạng với độ chính xác trên 80%.',
        isUnlocked: true,
        unlockedAt: '2026-09-20'
      }
    ],
    factChecksCount: 12,
    scenariosCompletedCount: 7,
    quizAccuracy: 85,
    createdAt: '2026-08-01'
  },
  {
    id: 'u-admin-01',
    username: 'trustnet_admin',
    name: 'Quản Trị Viên TrustNet',
    email: 'admin@trustnet.vn',
    password: 'admin123',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=250&q=80',
    school: 'Ban Quản trị An toàn Thông tin TrustNet',
    className: 'Admin Desk',
    bio: 'Quản trị viên hệ thống TrustNet - Giám sát tin giả và điều phối an toàn mạng học đường.',
    points: 2500,
    role: 'admin',
    rankTitle: 'Hiệp sĩ an toàn số (Digital Knight)',
    badges: [
      {
        id: 'b-admin-shield',
        name: 'Tổng Quản Trị',
        icon: '👑',
        description: 'Đặc quyền kiểm duyệt và điều hành nền tảng TrustNet.',
        isUnlocked: true,
        unlockedAt: '2026-07-01'
      }
    ],
    factChecksCount: 120,
    scenariosCompletedCount: 25,
    quizAccuracy: 98,
    createdAt: '2026-07-01'
  }
];

// Initial Current User
const DEFAULT_USER: User = INITIAL_ACCOUNTS[0];

// Initial Posts
const INITIAL_POSTS: Post[] = [
  {
    id: 'post-01',
    userId: 'u-official-01',
    author: {
      id: 'u-official-01',
      name: 'Cổng Thông Tin Bộ Giáo Dục',
      username: 'moet_official',
      avatar: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=200&q=80',
      rankTitle: 'Tổ chức Kiểm chứng Uy tín',
      isVerifiedUser: true
    },
    content: 'Chính thức: Bộ GD&ĐT công bố quy chế thi tốt nghiệp THPT mới với nhiều đổi mới kỹ thuật số và tăng cường bảo mật đề thi bằng mã hóa đa tầng. Học sinh các trường THPT có thể tra cứu lịch thi và đề thi minh họa tại cổng chính thức.',
    sourceUrl: 'https://moet.gov.vn/quy-che-thi-moi-2026',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
    verificationStatus: 'verified',
    verificationScore: 95,
    aiExplanation: {
      score: 95,
      status: 'verified',
      summary: 'Thông tin chính thống, khớp 100% với văn bản quy phạm pháp luật của Bộ GD&ĐT.',
      reasoning: 'Nguồn phát hành từ cổng thông tin .gov.vn được bảo hộ pháp lý. Không có yếu tố cắt xén giật gân.',
      claims: [
        'Bộ GD&ĐT công bố quy chế thi tốt nghiệp THPT mới',
        'Có đề thi minh họa và lịch thi chính thức trên cổng moet.gov.vn'
      ],
      supportingEvidence: [
        'Thông cáo báo chí số 142/TC-BGDĐT ngày 20/09/2026.',
        'Đã được xác nhận bởi các cơ quan báo đài quốc gia (VTV, TTXVN).'
      ],
      refutingEvidence: [],
      sources: [
        { title: 'Cổng thông tin Bộ Giáo Dục và Đào Tạo', url: 'https://moet.gov.vn', reliability: 'high' }
      ],
      unverifiedPoints: [],
      misleadingTerms: [],
      recommendation: 'Học sinh lớp 12 nên lưu lại và truy cập trực tiếp website Bộ để tải tài liệu chính xác.'
    },
    likesCount: 142,
    commentsCount: 28,
    sharesCount: 56,
    isLiked: false,
    isSaved: true,
    createdAt: '2 giờ trước'
  },
  {
    id: 'post-02',
    userId: 'u-user-22',
    author: {
      id: 'u-user-22',
      name: 'Hoàng Minh Quân',
      username: 'minhquan_vlog',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
      rankTitle: 'Người dùng mới',
      isVerifiedUser: false
    },
    content: 'Cảnh báo mọi người: Uống nước chanh sả gừng nóng lúc sáng sớm chữa khỏi 100% mọi loại biến thể cúm mùa và virus mới mà không cần tới bệnh viện! Nhà thuốc đang giấu bí quyết này để bán thuốc tây đắt tiền, chia sẻ ngay cho người thân biết nhé mọi người!',
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
    verificationStatus: 'suspicious',
    verificationScore: 32,
    aiExplanation: {
      score: 32,
      status: 'suspicious',
      summary: 'Thông tin có dấu hiệu giật gân, thiếu căn cứ y khoa và kích động tâm lý tẩy chay điều trị chính thống.',
      reasoning: 'Bài viết khẳng định "chữa khỏi 100%" - đây là dấu hiệu điển hình của ngụy khoa học (pseudoscience). Không có bất kỳ công trình thử nghiệm lâm sàng nào chứng minh chanh sả gừng diệt được hoàn toàn virus.',
      claims: [
        'Chanh sả gừng chữa khỏi 100% mọi biến thể cúm không cần thuốc',
        'Các hãng dược đang giấu thông tin'
      ],
      supportingEvidence: [
        'Chanh sả gừng có tính ấm, bổ sung vitamin C giúp tăng sức đề kháng nhẹ cho cơ thể.'
      ],
      refutingEvidence: [
        'Tổ chức Y tế Thế giới (WHO) và Bộ Y tế Việt Nam khẳng định chưa có thực phẩm tự nhiên nào diệt được hoàn toàn virus trong máu.',
        'Tự ý bỏ thuốc tây hoặc trì hoãn đến bệnh viện khi sốt cao có thể dẫn đến biến chứng suy hô hấp nguy hiểm.'
      ],
      sources: [
        { title: 'Tổ chức Y tế Thế giới (WHO) - Fact Check Y Tế', url: 'https://who.int', reliability: 'high' },
        { title: 'Cục Quản lý Khám, Chữa bệnh (Bộ Y tế)', url: 'https://kcb.vn', reliability: 'high' }
      ],
      unverifiedPoints: [
        'Lời tuyên bố "nhà thuốc đang giấu bí quyết" là thuyết âm mưu không có chứng cứ.'
      ],
      misleadingTerms: ['chữa khỏi 100%', 'bí quyết bị giấu kín', 'chia sẻ ngay'],
      recommendation: '⚠️ Đừng vội chia sẻ! Hãy đi khám bác sĩ khi có triệu chứng sốt hoặc ho kéo dài.'
    },
    likesCount: 19,
    commentsCount: 45,
    sharesCount: 4,
    isLiked: false,
    isSaved: false,
    createdAt: '4 giờ trước'
  },
  {
    id: 'post-03',
    userId: 'u-user-scam',
    author: {
      id: 'u-user-scam',
      name: 'Tri Ân Khách Hàng Online',
      username: 'trian_mungsinhnhat',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      rankTitle: 'Tài khoản đang bị hạn chế',
      isVerifiedUser: false
    },
    content: '🎉 CHÚC MỪNG BẠN ĐÃ TRÚNG THƯỞNG! Nhân dịp kỷ niệm thành lập, gửi tặng ngẫu nhiên thẻ mua sắm trị giá 5.000.000đ cho 50 bạn nhanh tay nhất. Nhấp ngay vào link: http://tang-voucher-shopee-mung-sinh-nhat.xyz/claim để nhập số điện thoại và nhận mã quà tặng ngay hôm nay!',
    verificationStatus: 'debunked',
    verificationScore: 8,
    aiExplanation: {
      score: 8,
      status: 'debunked',
      summary: '🚨 CẢNH BÁO LỪA ĐẢO NGUY HIỂM: Phát hiện thủ đoạn Phishing chiếm đoạt tài khoản.',
      reasoning: 'Tên miền .xyz lạ, mạo danh thương hiệu thương mại điện tử lớn. Dẫn dắt người dùng nhập số điện thoại và mã OTP để chiếm đoạt ví điện tử/tài khoản ngân hàng.',
      claims: [
        'Tặng thẻ mua sắm 5.000.000đ ngẫu nhiên',
        'Cần bấm vào link .xyz để nhận'
      ],
      supportingEvidence: [],
      refutingEvidence: [
        'Đại diện Shopee xác nhận mọi chương trình quà tặng chỉ tổ chức trên ứng dụng chính thức hoặc tên miền shopee.vn.',
        'Cảnh báo từ Cục An toàn thông tin: Tên miền chứa từ khóa thương hiệu kèm đuôi .xyz, .top là 99% website giả mạo.'
      ],
      sources: [
        { title: 'Cổng Không Gian Mạng Quốc Gia (NCSC)', url: 'https://khonggianmang.vn', reliability: 'high' }
      ],
      unverifiedPoints: [],
      misleadingTerms: ['trúng thưởng', 'nhấp ngay vào link', 'nhận mã quà tặng'],
      recommendation: '🚫 KHÔNG click vào link! Báo cáo ngay cho ban quản trị để ngăn chặn phát tán.'
    },
    likesCount: 3,
    commentsCount: 62,
    sharesCount: 1,
    isLiked: false,
    isSaved: false,
    createdAt: '6 giờ trước'
  },
  {
    id: 'post-04',
    userId: 'u-user-eco',
    author: {
      id: 'u-user-eco',
      name: 'Thanh Trúc - Tech Insider',
      username: 'truc_tech',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
      rankTitle: 'Người kiểm chứng',
      isVerifiedUser: true
    },
    content: 'Có thông tin rò rỉ rằng các hãng pin thể rắn (solid-state battery) sẽ bắt đầu thương mại hóa cho xe máy điện vào đầu năm sau, giúp sạc đầy trong 10 phút và đi được 300km. Mình đang tìm tài liệu từ các viện nghiên cứu để kiểm tra lại.',
    sourceUrl: 'https://trustnet.vn/research/batteries-2026',
    verificationStatus: 'unverified',
    verificationScore: 65,
    aiExplanation: {
      score: 65,
      status: 'unverified',
      summary: 'Thông tin có cơ sở khoa học nhưng giai đoạn thương mại hóa đại trà cần thêm chứng nhận sản xuất.',
      reasoning: 'Công nghệ pin thể rắn đã có nguyên mẫu phòng thí nghiệm thành công, tuy nhiên chi phí dây chuyền sản xuất quy mô lớn vẫn đang được các tập đoàn thử nghiệm.',
      claims: [
        'Pin thể rắn thương mại hóa cho xe máy điện năm sau',
        'Sạc đầy trong 10 phút, quãng đường 300km'
      ],
      supportingEvidence: [
        'Báo cáo từ Hiệp hội Kỹ sư Ô tô (SAE) ghi nhận tiến bộ đột phá về chất điện phân gốm nano.'
      ],
      refutingEvidence: [
        'Chưa có hãng sản xuất xe máy nào tại Việt Nam công bố hợp đồng thương mại chính thức cho quý 1 năm sau.'
      ],
      sources: [
        { title: 'Tạp chí Khoa học & Công nghệ Việt Nam', url: 'https://vjst.vn', reliability: 'high' }
      ],
      unverifiedPoints: [
        'Thời điểm mở bán chính thức tại thị trường Đông Nam Á.'
      ],
      misleadingTerms: [],
      recommendation: '🟡 Theo dõi thông cáo từ các nhà sản xuất xe điện chính thức trước khi đặt cọc.'
    },
    likesCount: 88,
    commentsCount: 16,
    sharesCount: 12,
    isLiked: true,
    isSaved: false,
    createdAt: '12 giờ trước'
  }
];

// Initial Comments
const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'c-1',
    postId: 'post-01',
    userId: 'u-user-4',
    author: {
      name: 'Nguyễn Tấn Đạt',
      username: 'dat_nguyen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
    },
    content: 'Cảm ơn TrustNet đã gắn nhãn Đã kiểm chứng! Nhiều trang mạng xã hội đăng tin đổi môn thi làm mình hoang mang mãi.',
    createdAt: '1 giờ trước'
  },
  {
    id: 'c-2',
    postId: 'post-02',
    userId: 'u-genz-01',
    author: {
      name: 'Bảo Trâm',
      username: 'baotram_digital',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    },
    content: 'Mọi người nhớ bấm xem giải thích của AI nhé. Đừng tin ba cái bài thuốc thần dược trên mạng, rất hại dạ dày.',
    createdAt: '3 giờ trước'
  }
];

// 5 Digital Safety Academy Lessons
// Danh mục bài học an toàn số (15 tuần và tự động mở rộng theo chu kỳ hàng tuần)
const INITIAL_LESSONS: Lesson[] = MASTER_LESSONS_CATALOG;


// Danh mục 12 kịch bản an toàn số tương tác cao
const INITIAL_SCENARIOS: Scenario[] = MASTER_SCENARIOS_CATALOG;


// Cơ sở dữ liệu tra cứu chính thống kết nối chinhphu.vn, tuoitre.vn, moh.gov.vn
const INITIAL_SEARCH_RESULTS: SearchResultItem[] = MASTER_SEARCH_CATALOG;

// Initial Admin Reports
const INITIAL_REPORTS: ReportItem[] = [
  {
    id: 'rep-01',
    reporterId: 'u-genz-01',
    reporterName: 'Bảo Trâm',
    postId: 'post-03',
    postSnippet: '🎉 CHÚC MỪNG BẠN ĐÃ TRÚNG THƯỞNG! Nhấp ngay vào link: http://tang-voucher-shopee...',
    postAuthor: 'Tri Ân Khách Hàng Online',
    reason: 'Đường link lừa đảo mạo danh ngân hàng và Shopee, có dấu hiệu đánh cắp OTP.',
    status: 'pending',
    createdAt: '30 phút trước'
  },
  {
    id: 'rep-02',
    reporterId: 'u-user-22',
    reporterName: 'Hoàng Minh Quân',
    postId: 'post-02',
    postSnippet: 'Uống nước chanh sả gừng nóng lúc sáng sớm chữa khỏi 100%...',
    postAuthor: 'Hoàng Minh Quân',
    reason: 'Thông tin y tế sai lệch gây nguy hiểm cho người già và trẻ nhỏ.',
    status: 'pending',
    createdAt: '1 giờ trước'
  }
];

/**
 * Service quản lý CSDL LocalStorage mô phỏng
 */
export class DatabaseService {
  // Lấy tất cả tài khoản (đồng bộ mật khẩu mặc định nếu chưa có)
  public static getAllAccounts(): User[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(INITIAL_ACCOUNTS));
      return INITIAL_ACCOUNTS;
    }
    try {
      const accounts: User[] = JSON.parse(raw);
      let changed = false;
      for (const initAcc of INITIAL_ACCOUNTS) {
        const found = accounts.find(a => a.id === initAcc.id || a.username === initAcc.username);
        if (!found) {
          accounts.unshift(initAcc);
          changed = true;
        } else if (!found.password) {
          found.password = initAcc.password;
          changed = true;
        }
      }
      for (const acc of accounts) {
        if (!acc.password) {
          acc.password = acc.role === 'admin' ? 'admin123' : '123456';
          changed = true;
        }
      }
      if (changed) {
        localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
      }
      return accounts;
    } catch {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(INITIAL_ACCOUNTS));
      return INITIAL_ACCOUNTS;
    }
  }

  // Kiểm tra trạng thái đã đăng nhập hay chưa
  public static isLoggedIn(): boolean {
    return localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN) === 'true';
  }

  // Cập nhật trạng thái đăng nhập
  public static setLoggedIn(status: boolean): void {
    if (status) {
      localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
    }
  }

  // Đăng nhập an toàn: bắt buộc đúng tài khoản và mật khẩu
  public static loginSecure(identifier: string, password: string): { success: boolean; user?: User; error?: string } {
    const cleanId = identifier.trim().toLowerCase().replace('@', '');
    if (!cleanId) {
      return { success: false, error: 'Vui lòng nhập tên người dùng hoặc email.' };
    }
    if (!password || !password.trim()) {
      return { success: false, error: 'Vui lòng nhập mật khẩu tài khoản của bạn.' };
    }

    const accounts = this.getAllAccounts();
    const found = accounts.find(a => 
      a.username.toLowerCase() === cleanId || 
      a.name.toLowerCase() === cleanId ||
      a.email.toLowerCase() === cleanId
    );

    if (!found) {
      return { 
        success: false, 
        error: 'Tài khoản không tồn tại trên hệ thống. Vui lòng kiểm tra lại hoặc chuyển sang tab "Tạo tài khoản mới"!' 
      };
    }

    const expectedPassword = found.password || (found.role === 'admin' ? 'admin123' : '123456');
    if (password.trim() !== expectedPassword.trim()) {
      return { 
        success: false, 
        error: 'Mật khẩu không chính xác! Vui lòng thử lại. (Gợi ý tài khoản mẫu: 123456, Admin: admin123)' 
      };
    }

    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(found));
    localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
    return { success: true, user: found };
  }

  // Chuyển đổi tài khoản có xác thực mật khẩu
  public static switchAccountSecure(userId: string, password: string): { success: boolean; user?: User; error?: string } {
    const accounts = this.getAllAccounts();
    const found = accounts.find(a => a.id === userId);
    if (!found) {
      return { success: false, error: 'Không tìm thấy tài khoản.' };
    }

    const expectedPassword = found.password || (found.role === 'admin' ? 'admin123' : '123456');
    if (password.trim() !== expectedPassword.trim()) {
      return { success: false, error: 'Mật khẩu của tài khoản này không chính xác!' };
    }

    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(found));
    localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
    return { success: true, user: found };
  }

  // Kiểm tra xác thực mật khẩu tài khoản hiện tại (bảo vệ thông tin cá nhân)
  public static verifyUserPassword(userId: string, password: string): { success: boolean; error?: string } {
    const accounts = this.getAllAccounts();
    const user = accounts.find(a => a.id === userId);
    if (!user) {
      return { success: false, error: 'Không tìm thấy tài khoản người dùng.' };
    }
    const expected = user.password || (user.role === 'admin' ? 'admin123' : '123456');
    if (password.trim() !== expected.trim()) {
      return { success: false, error: 'Mật khẩu xác thực không chính xác! Vui lòng nhập đúng mật khẩu.' };
    }
    return { success: true };
  }

  // Đổi mật khẩu tài khoản
  public static changePassword(userId: string, currentPass: string, newPass: string): { success: boolean; error?: string } {
    const accounts = this.getAllAccounts();
    const user = accounts.find(a => a.id === userId);
    if (!user) {
      return { success: false, error: 'Không tìm thấy thông tin tài khoản.' };
    }

    const expected = user.password || (user.role === 'admin' ? 'admin123' : '123456');
    if (currentPass.trim() !== expected.trim()) {
      return { success: false, error: 'Mật khẩu hiện tại không đúng!' };
    }

    if (!newPass || newPass.trim().length < 3) {
      return { success: false, error: 'Mật khẩu mới phải có ít nhất 3 ký tự.' };
    }

    user.password = newPass.trim();
    const updatedAccounts = accounts.map(a => a.id === user.id ? user : a);
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(updatedAccounts));
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return { success: true };
  }

  // Chuyển đổi tài khoản nhanh
  public static switchAccount(userId: string): User {
    const accounts = this.getAllAccounts();
    const found = accounts.find(a => a.id === userId);
    if (found) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(found));
      localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
      return found;
    }
    return this.getCurrentUser();
  }

  // Đăng nhập thường
  public static login(identifier: string, password?: string): User {
    const res = this.loginSecure(identifier, password || '123456');
    if (res.success && res.user) {
      return res.user;
    }
    return this.registerUser({
      name: identifier.trim(),
      username: identifier.trim().toLowerCase().replace('@', ''),
      password: password || '123456'
    });
  }

  // Đăng ký tài khoản mới
  public static registerUser(data: Partial<User>): User {
    const accounts = this.getAllAccounts();
    const cleanUsername = data.username ? data.username.trim().replace('@', '').toLowerCase() : 'user_' + Date.now().toString().slice(-4);
    const newUser: User = {
      id: 'u-' + Date.now(),
      username: cleanUsername,
      name: data.name?.trim() || 'Người dùng mới',
      email: data.email || `${cleanUsername}@trustnet.vn`,
      avatar: data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
      school: data.school || 'Trường THPT Số 1 Phan Đình Phùng',
      className: data.className || 'Học sinh',
      bio: data.bio || 'Thành viên mới tham gia mạng xã hội kiểm chứng TrustNet.',
      points: 150,
      role: 'user',
      rankTitle: 'Tân binh khởi đầu',
      badges: [
        {
          id: 'b-welcome',
          name: 'Gia nhập TrustNet',
          icon: '🎉',
          description: 'Chào mừng bạn đến với mạng xã hội kiểm chứng thông tin.',
          isUnlocked: true,
          unlockedAt: new Date().toISOString().split('T')[0]
        }
      ],
      factChecksCount: 0,
      scenariosCompletedCount: 0,
      quizAccuracy: 100,
      createdAt: new Date().toISOString().split('T')[0],
      password: data.password
    };

    const updated = [newUser, ...accounts.filter(a => a.username !== newUser.username)];
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(updated));
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
    return newUser;
  }

  // Cập nhật thông tin cá nhân (Edit Profile)
  public static updateUserProfile(updatedFields: Partial<User>): User {
    const current = this.getCurrentUser();
    const updated: User = {
      ...current,
      ...updatedFields
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));

    // Đồng bộ lại vào danh sách accounts
    const accounts = this.getAllAccounts();
    const updatedAccounts = accounts.map(a => a.id === updated.id ? updated : a);
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(updatedAccounts));

    return updated;
  }

  // Đăng xuất (xóa cờ đăng nhập và trả về tài khoản mặc định)
  public static logout(): User {
    localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
    const accounts = this.getAllAccounts();
    const fallback = accounts[0] || DEFAULT_USER;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(fallback));
    return fallback;
  }

  // Lấy User
  public static getCurrentUser(): User {
    // Migration: nếu chưa nâng cấp v2 hoặc tài khoản cũ lưu Bảo Trâm thì chuyển sang Hoàng Đình Dũng
    if (!localStorage.getItem('trustnet_user_v2')) {
      localStorage.setItem('trustnet_user_v2', 'true');
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_USER));
      return DEFAULT_USER;
    }
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_USER));
      return DEFAULT_USER;
    }
    try {
      return JSON.parse(raw);
    } catch {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_USER));
      return DEFAULT_USER;
    }
  }

  // Cập nhật điểm và huy hiệu cho User
  public static addPoints(pointsToAdd: number, reason: string): User {
    const user = this.getCurrentUser();
    user.points += pointsToAdd;

    // Cập nhật Rank Title theo mốc điểm
    if (user.points >= 1000) {
      user.rankTitle = 'Hiệp sĩ an toàn số (Digital Knight)';
      const badge = user.badges.find(b => b.id === 'b-digital-citizen');
      if (badge && !badge.isUnlocked) {
        badge.isUnlocked = true;
        badge.unlockedAt = new Date().toISOString().split('T')[0];
      }
    } else if (user.points >= 500) {
      user.rankTitle = 'Người kiểm chứng (Fact Checker)';
    } else {
      user.rankTitle = 'Người dùng mới';
    }

    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return user;
  }

  // Lấy Posts
  public static getPosts(): Post[] {
    const raw = localStorage.getItem(STORAGE_KEYS.POSTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(INITIAL_POSTS));
      return INITIAL_POSTS;
    }
    return JSON.parse(raw);
  }

  // Thêm Post mới
  public static createPost(newPost: Post): Post[] {
    const posts = this.getPosts();
    const updated = [newPost, ...posts];
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(updated));
    this.addPoints(25, 'Đăng bài có kiểm chứng AI');
    return updated;
  }

  // Toggle Like Post
  public static toggleLike(postId: string): Post[] {
    const posts = this.getPosts();
    const updated = posts.map(p => {
      if (p.id === postId) {
        const isLiked = !p.isLiked;
        return {
          ...p,
          isLiked,
          likesCount: isLiked ? p.likesCount + 1 : p.likesCount - 1
        };
      }
      return p;
    });
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(updated));
    return updated;
  }

  // Lấy bình luận của post
  public static getComments(postId: string): Comment[] {
    const raw = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    const all: Comment[] = raw ? JSON.parse(raw) : INITIAL_COMMENTS;
    return all.filter(c => c.postId === postId);
  }

  // Thêm bình luận
  public static addComment(postId: string, content: string): Comment {
    const user = this.getCurrentUser();
    const raw = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    const all: Comment[] = raw ? JSON.parse(raw) : INITIAL_COMMENTS;
    const newComment: Comment = {
      id: 'c-' + Date.now(),
      postId,
      userId: user.id,
      author: {
        name: user.name,
        username: user.username,
        avatar: user.avatar
      },
      content,
      createdAt: 'Vừa xong'
    };
    all.push(newComment);
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(all));

    // Update commentsCount trên post
    const posts = this.getPosts();
    const updatedPosts = posts.map(p => p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p);
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(updatedPosts));

    return newComment;
  }

  // Lấy danh sách Scenarios (Tự động nâng cấp danh mục 12+ kịch bản đa tương tác)
  public static getScenarios(): Scenario[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SCENARIOS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SCENARIOS, JSON.stringify(INITIAL_SCENARIOS));
      return INITIAL_SCENARIOS;
    }
    try {
      const parsed: Scenario[] = JSON.parse(raw);
      // Nếu số lượng tình huống cũ ít hơn danh mục mới hoặc thiếu questionType, nâng cấp danh mục và bảo lưu tiến độ hoàn thành
      if (parsed.length < INITIAL_SCENARIOS.length) {
        const completedMap = new Map<string, boolean>();
        for (const s of parsed) {
          if (s.isCompleted) completedMap.set(s.id, true);
        }
        const upgraded = INITIAL_SCENARIOS.map(s => ({
          ...s,
          isCompleted: completedMap.get(s.id) || s.isCompleted || false
        }));
        localStorage.setItem(STORAGE_KEYS.SCENARIOS, JSON.stringify(upgraded));
        return upgraded;
      }
      return parsed;
    } catch {
      localStorage.setItem(STORAGE_KEYS.SCENARIOS, JSON.stringify(INITIAL_SCENARIOS));
      return INITIAL_SCENARIOS;
    }
  }

  // Hoàn thành scenario
  public static completeScenario(scenarioId: string): Scenario[] {
    const list = this.getScenarios();
    const updated = list.map(s => s.id === scenarioId ? { ...s, isCompleted: true } : s);
    localStorage.setItem(STORAGE_KEYS.SCENARIOS, JSON.stringify(updated));
    
    // Tăng XP cho user
    const target = list.find(s => s.id === scenarioId);
    if (target) {
      this.addPoints(target.pointsReward, `Hoàn thành tình huống: ${target.title}`);
      const user = this.getCurrentUser();
      user.scenariosCompletedCount += 1;
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
    return updated;
  }

  // Lấy danh sách Lessons được đồng bộ tự động theo chu kỳ mỗi tuần 1 bài học
  public static getLessons(previewAll: boolean = false): Lesson[] {
    let parsedStored: Lesson[] = [];
    const raw = localStorage.getItem(STORAGE_KEYS.LESSONS);
    if (raw) {
      try {
        parsedStored = JSON.parse(raw);
      } catch {}
    }

    // Tự động xây dựng và cập nhật lịch trình bài học theo tuần
    const scheduledLessons = buildWeeklyLessonsSchedule(parsedStored, previewAll);
    localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(scheduledLessons));
    return scheduledLessons;
  }

  // Hoàn thành lesson
  public static completeLesson(lessonId: string): Lesson[] {
    const list = this.getLessons(true);
    const updated = list.map(l => l.id === lessonId ? { ...l, isCompleted: true } : l);
    localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(updated));

    const target = list.find(l => l.id === lessonId);
    if (target) {
      this.addPoints(target.points, `Hoàn thành bài học: ${target.title}`);
    }
    return this.getLessons();
  }

  // Lấy thông tin chu kỳ tuần hiện tại và đếm ngược bài học kế tiếp
  public static getAcademyWeeklyInfo() {
    const currentWeek = getCurrentAcademicWeek();
    return getNextLessonUnlockInfo(currentWeek);
  }

  public static getCurrentAcademyWeek() {
    return getCurrentAcademicWeek();
  }

  // Lấy Reports (Admin)
  public static getReports(): ReportItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.REPORTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(INITIAL_REPORTS));
      return INITIAL_REPORTS;
    }
    return JSON.parse(raw);
  }

  // Báo cáo bài viết
  public static createReport(postId: string, postSnippet: string, postAuthor: string, reason: string): ReportItem {
    const user = this.getCurrentUser();
    const reports = this.getReports();
    const newReport: ReportItem = {
      id: 'rep-' + Date.now(),
      reporterId: user.id,
      reporterName: user.name,
      postId,
      postSnippet,
      postAuthor,
      reason,
      status: 'pending',
      createdAt: 'Vừa xong'
    };
    reports.unshift(newReport);
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    this.addPoints(10, 'Báo cáo nội dung đáng ngờ cho cộng đồng');
    return newReport;
  }

  // Admin cập nhật trạng thái report
  public static updateReportStatus(reportId: string, status: ReportItem['status']): ReportItem[] {
    const reports = this.getReports();
    const updated = reports.map(r => r.id === reportId ? { ...r, status } : r);
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(updated));
    return updated;
  }

  // Lấy Search data
  public static getSearchResults(keyword?: string, category?: string, portal?: string): SearchResultItem[] {
    let results = INITIAL_SEARCH_RESULTS;
    if (portal && portal !== 'all') {
      results = results.filter(r => r.connectedPortal === portal || r.url.toLowerCase().includes(portal.toLowerCase()));
    }
    if (category && category !== 'all') {
      results = results.filter(r => r.category === category);
    }
    if (keyword && keyword.trim().length > 0) {
      const q = keyword.toLowerCase().trim();
      results = results.filter(r => 
        r.title.toLowerCase().includes(q) || 
        r.summary.toLowerCase().includes(q) ||
        r.source.toLowerCase().includes(q)
      );
    }
    return results;
  }

  // Lịch sử Fact-Check cá nhân
  public static getFactCheckHistory(): FactCheckRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.FACT_CHECKS);
    if (!raw) return [];
    return JSON.parse(raw);
  }

  public static saveFactCheckRecord(record: FactCheckRecord): void {
    const list = this.getFactCheckHistory();
    list.unshift(record);
    localStorage.setItem(STORAGE_KEYS.FACT_CHECKS, JSON.stringify(list));

    const user = this.getCurrentUser();
    user.factChecksCount += 1;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    this.addPoints(15, 'Kiểm chứng thông tin mới');
  }
}
