import { 
  User, Post, Comment, FactCheckRecord, Lesson, Scenario, ReportItem, SearchResultItem, AppNotification 
} from '../types';
import { parseDateInput } from '../utils/timeAgo';
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
  NOTIFICATIONS: 'trustnet_notifications',
  FACT_CHECKS: 'trustnet_fact_checks',
  LESSONS: 'trustnet_lessons',
  SCENARIOS: 'trustnet_scenarios',
  REPORTS: 'trustnet_reports',
  ACCOUNTS: 'trustnet_accounts',
  IS_LOGGED_IN: 'trustnet_is_logged_in',
  DEVICE_ACCOUNTS: 'trustnet_device_accounts',
};

export interface DeviceSavedAccount {
  id: string;
  name: string;
  username: string;
  avatar: string;
  school?: string;
  className?: string;
  role?: string;
  points?: number;
  lastLogin: string;
  lastLoginTimestamp: number;
}

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
    username: 'admin',
    name: 'Quản Trị Viên TrustNet',
    email: 'admin@trustnet.vn',
    password: 'TrustNet@Admin2026',
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

// Dynamic ISO Time Generator Helpers
const getIsoMinutesAgo = (mins: number) => new Date(Date.now() - mins * 60 * 1000).toISOString();
const getIsoHoursAgo = (hours: number) => new Date(Date.now() - Math.round(hours * 3600 * 1000)).toISOString();
const getIsoDaysAgo = (days: number) => new Date(Date.now() - Math.round(days * 86400 * 1000)).toISOString();

// Initial Posts with 100% Real Metrics (likesCount matches likedBy.length, commentsCount matches INITIAL_COMMENTS, sharesCount matches sharedBy.length)
export const INITIAL_POSTS: Post[] = [
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
    likesCount: 4,
    commentsCount: 3,
    sharesCount: 2,
    likedBy: ['u-dung-01', 'u-genz-01', 'u-admin-01', 'u-user-4'],
    sharedBy: ['u-dung-01', 'u-genz-01'],
    isLiked: true,
    isSaved: true,
    createdAt: getIsoHoursAgo(2)
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
    likesCount: 1,
    commentsCount: 2,
    sharesCount: 0,
    likedBy: ['u-user-scam'],
    sharedBy: [],
    isLiked: false,
    isSaved: false,
    createdAt: getIsoHoursAgo(4)
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
    likesCount: 0,
    commentsCount: 2,
    sharesCount: 0,
    likedBy: [],
    sharedBy: [],
    isLiked: false,
    isSaved: false,
    createdAt: getIsoHoursAgo(6)
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
    likesCount: 3,
    commentsCount: 2,
    sharesCount: 1,
    likedBy: ['u-dung-01', 'u-user-22', 'u-genz-01'],
    sharedBy: ['u-dung-01'],
    isLiked: true,
    isSaved: false,
    createdAt: getIsoHoursAgo(12)
  }
];

// Initial Comments (All matching post IDs with real ISO timestamps)
export const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'c-101',
    postId: 'post-01',
    userId: 'u-user-4',
    author: {
      name: 'Nguyễn Tấn Đạt',
      username: 'dat_nguyen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      rankTitle: 'Học sinh Lớp 12',
      school: 'THPT Số 1 Phan Đình Phùng'
    },
    content: 'Cảm ơn TrustNet đã gắn nhãn Đã kiểm chứng! Nhiều trang mạng xã hội đăng tin đổi môn thi làm mình hoang mang mãi.',
    createdAt: getIsoHoursAgo(2),
    likesCount: 3,
    likedBy: ['u-dung-01', 'u-genz-01', 'u-admin-01']
  },
  {
    id: 'c-102',
    postId: 'post-01',
    userId: 'u-genz-01',
    author: {
      name: 'Bảo Trâm',
      username: 'baotram_digital',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      rankTitle: 'Người kiểm chứng',
      school: 'THPT Số 1 Phan Đình Phùng'
    },
    content: 'Mình vừa tải đề thi minh họa trên trang moet.gov.vn về rồi, cấu trúc đề thi rất sát với hướng dẫn đổi mới năm nay.',
    createdAt: getIsoHoursAgo(1.5),
    likesCount: 2,
    likedBy: ['u-dung-01', 'u-user-4']
  },
  {
    id: 'c-103',
    postId: 'post-01',
    userId: 'u-admin-01',
    author: {
      name: 'Quản Trị Viên TrustNet',
      username: 'admin',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
      rankTitle: 'Hiệp sĩ an toàn số',
      school: 'Ban Quản trị An toàn Thông tin'
    },
    content: 'Đoàn trường THPT Số 1 Phan Đình Phùng cũng đã ghim thông báo này vào bảng tin học tập của các lớp 12.',
    createdAt: getIsoMinutesAgo(35),
    likesCount: 4,
    likedBy: ['u-dung-01', 'u-genz-01', 'u-user-4', 'u-user-22']
  },
  {
    id: 'c-201',
    postId: 'post-02',
    userId: 'u-genz-01',
    author: {
      name: 'Bảo Trâm',
      username: 'baotram_digital',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      rankTitle: 'Người kiểm chứng',
      school: 'THPT Số 1 Phan Đình Phùng'
    },
    content: 'Mọi người nhớ bấm xem giải thích của AI nhé. Đừng tin ba cái bài thuốc thần dược trên mạng, rất hại dạ dày.',
    createdAt: getIsoHoursAgo(3.5),
    likesCount: 3,
    likedBy: ['u-dung-01', 'u-admin-01', 'u-user-4']
  },
  {
    id: 'c-202',
    postId: 'post-02',
    userId: 'u-dung-01',
    author: {
      name: 'Hoàng Đình Dũng',
      username: 'hoangdinhdung822',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
      rankTitle: 'Đại sứ THPT Số 1',
      school: 'Khối 11 - Đoàn Trường'
    },
    content: 'Bộ Y tế đã có văn bản cảnh báo thông tin này từ lâu. Uống chanh gừng chỉ hỗ trợ giữ ấm chứ không tiêu diệt được virus cúm.',
    createdAt: getIsoHoursAgo(2),
    likesCount: 2,
    likedBy: ['u-genz-01', 'u-admin-01']
  },
  {
    id: 'c-301',
    postId: 'post-03',
    userId: 'u-genz-01',
    author: {
      name: 'Bảo Trâm',
      username: 'baotram_digital',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      rankTitle: 'Người kiểm chứng',
      school: 'THPT Số 1 Phan Đình Phùng'
    },
    content: 'Cảnh báo lừa đảo phishing! Mình đã gửi báo cáo cho Quản trị viên để gỡ bài này khỏi nền tảng.',
    createdAt: getIsoHoursAgo(5.5),
    likesCount: 5,
    likedBy: ['u-dung-01', 'u-admin-01', 'u-user-22', 'u-user-4', 'u-user-eco']
  },
  {
    id: 'c-302',
    postId: 'post-03',
    userId: 'u-admin-01',
    author: {
      name: 'Quản Trị Viên TrustNet',
      username: 'admin',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
      rankTitle: 'Tổng Quản Trị',
      school: 'Ban Quản trị Hệ Thống'
    },
    content: 'Hệ thống AI đã phát hiện tên miền độc hại .xyz và gắn nhãn Cảnh báo đỏ. Đề nghị người dùng không truy cập liên kết.',
    createdAt: getIsoHoursAgo(4.8),
    likesCount: 3,
    likedBy: ['u-dung-01', 'u-genz-01', 'u-user-4']
  },
  {
    id: 'c-401',
    postId: 'post-04',
    userId: 'u-dung-01',
    author: {
      name: 'Hoàng Đình Dũng',
      username: 'hoangdinhdung822',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
      rankTitle: 'Đại sứ THPT Số 1',
      school: 'Khối 11 - Đoàn Trường'
    },
    content: 'Công nghệ này tiềm năng thật nhưng cần đợi các viện kiểm định an toàn cháy nổ trước khi áp dụng thương mại.',
    createdAt: getIsoHoursAgo(8),
    likesCount: 2,
    likedBy: ['u-genz-01', 'u-user-22']
  },
  {
    id: 'c-402',
    postId: 'post-04',
    userId: 'u-user-22',
    author: {
      name: 'Hoàng Minh Quân',
      username: 'minhquan_vlog',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
      rankTitle: 'Người dùng mới',
      school: 'THPT Số 1 Phan Đình Phùng'
    },
    content: 'Mình cũng đang đọc báo cáo của SAE, có vẻ chi phí sản xuất pin thể rắn vẫn cao gấp 3 lần pin lithium hiện tại.',
    createdAt: getIsoHoursAgo(6.5),
    likesCount: 1,
    likedBy: ['u-dung-01']
  }
];

// Initial Real Notifications
export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    userId: 'u-dung-01',
    actor: {
      id: 'u-genz-01',
      name: 'Bảo Trâm',
      username: 'baotram_digital',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
    },
    type: 'comment',
    title: 'Bảo Trâm đã bình luận về bài viết quy chế thi Bộ GD&ĐT',
    content: '"Mình vừa tải đề thi minh họa trên trang moet.gov.vn về rồi, cấu trúc đề thi rất sát..."',
    targetPostId: 'post-01',
    targetTab: 'feed',
    read: false,
    createdAt: getIsoMinutesAgo(15)
  },
  {
    id: 'notif-2',
    userId: 'u-dung-01',
    actor: {
      id: 'u-system',
      name: 'Hệ Thống TrustNet AI',
      username: 'trustnet_ai',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80'
    },
    type: 'fact_check',
    title: 'AI đã kiểm chứng bài viết của bạn: Đã kiểm chứng (95/100)',
    content: 'Nội dung trùng khớp 100% với văn bản quy phạm pháp luật của Bộ GD&ĐT. Bạn nhận +25 XP!',
    targetPostId: 'post-01',
    targetTab: 'feed',
    read: false,
    createdAt: getIsoHoursAgo(1.2)
  },
  {
    id: 'notif-3',
    userId: 'u-dung-01',
    actor: {
      id: 'u-admin-01',
      name: 'Quản Trị Viên TrustNet',
      username: 'admin',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=250&q=80'
    },
    type: 'like',
    title: 'Quản Trị Viên đã thích bài viết kiểm chứng của bạn',
    targetPostId: 'post-01',
    targetTab: 'feed',
    read: true,
    createdAt: getIsoHoursAgo(3)
  },
  {
    id: 'notif-4',
    userId: 'u-dung-01',
    actor: {
      id: 'u-system',
      name: 'Trường THPT Số 1 Phan Đình Phùng',
      username: 'thpt_phandinhphung',
      avatar: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=200&q=80'
    },
    type: 'reward',
    title: 'Bạn nhận được huy hiệu Đại sứ THPT Số 1 Phan Đình Phùng!',
    content: 'Ghi nhận đóng góp tích cực trong việc lan tỏa văn hóa kiểm chứng an toàn mạng.',
    targetTab: 'school',
    read: true,
    createdAt: getIsoDaysAgo(1)
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
    createdAt: getIsoMinutesAgo(30)
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
    createdAt: getIsoHoursAgo(1)
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
        const found = accounts.find(a => a.id === initAcc.id || a.username === initAcc.username || (initAcc.role === 'admin' && a.role === 'admin'));
        if (!found) {
          accounts.unshift(initAcc);
          changed = true;
        } else {
          if (initAcc.role === 'admin') {
            found.username = 'admin';
            found.password = 'TrustNet@Admin2026';
            found.role = 'admin';
            changed = true;
          } else if (!found.password) {
            found.password = initAcc.password;
            changed = true;
          }
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

  // Lấy danh sách các tài khoản đã đăng nhập trước đây trên thiết bị này
  public static getDeviceAccounts(): DeviceSavedAccount[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DEVICE_ACCOUNTS);
    if (!raw) {
      const userRaw = localStorage.getItem(STORAGE_KEYS.USER);
      if (userRaw) {
        try {
          const u: User = JSON.parse(userRaw);
          if (u && u.username) {
            const initialEntry: DeviceSavedAccount = {
              id: u.id || 'u-default',
              name: u.name,
              username: u.username,
              avatar: u.avatar,
              school: u.school,
              className: u.className,
              role: u.role,
              points: u.points,
              lastLogin: 'Gần đây',
              lastLoginTimestamp: Date.now()
            };
            localStorage.setItem(STORAGE_KEYS.DEVICE_ACCOUNTS, JSON.stringify([initialEntry]));
            return [initialEntry];
          }
        } catch {}
      }
      return [];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  // Ghi nhớ tài khoản trên thiết bị này sau khi đăng nhập thành công
  public static saveDeviceAccount(user: User): void {
    try {
      const list = this.getDeviceAccounts();
      const existingIdx = list.findIndex(a => a.id === user.id || a.username.toLowerCase() === user.username.toLowerCase());
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}`;
      const entry: DeviceSavedAccount = {
        id: user.id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        school: user.school,
        className: user.className,
        role: user.role,
        points: user.points,
        lastLogin: timeStr,
        lastLoginTimestamp: Date.now()
      };
      if (existingIdx >= 0) {
        list[existingIdx] = { ...list[existingIdx], ...entry };
      } else {
        list.unshift(entry);
      }
      list.sort((a, b) => b.lastLoginTimestamp - a.lastLoginTimestamp);
      localStorage.setItem(STORAGE_KEYS.DEVICE_ACCOUNTS, JSON.stringify(list.slice(0, 5)));
    } catch (e) {
      console.error('Error saving device account:', e);
    }
  }

  // Xóa tài khoản khỏi danh sách đã lưu trên thiết bị này
  public static removeDeviceAccount(idOrUsername: string): DeviceSavedAccount[] {
    try {
      const list = this.getDeviceAccounts().filter(
        a => a.id !== idOrUsername && a.username.toLowerCase() !== idOrUsername.toLowerCase()
      );
      localStorage.setItem(STORAGE_KEYS.DEVICE_ACCOUNTS, JSON.stringify(list));
      return list;
    } catch {
      return [];
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
    const isAdminId = cleanId === 'admin' || cleanId === 'trustnet_admin' || cleanId === 'admin@trustnet.vn';
    
    let found = accounts.find(a => 
      a.username.toLowerCase() === cleanId || 
      a.name.toLowerCase() === cleanId ||
      a.email.toLowerCase() === cleanId
    );

    if (!found && isAdminId) {
      found = accounts.find(a => a.role === 'admin');
    }

    if (!found) {
      return { 
        success: false, 
        error: 'Tài khoản không tồn tại trên hệ thống. Vui lòng kiểm tra lại tên đăng nhập hoặc chuyển sang tab "Tạo tài khoản mới"!' 
      };
    }

    const expectedPassword = found.password || (found.role === 'admin' ? 'TrustNet@Admin2026' : '123456');
    const isPasswordValid = 
      password.trim() === expectedPassword.trim() || 
      (found.role === 'admin' && (password.trim() === 'TrustNet@Admin2026' || password.trim() === 'admin123'));

    if (!isPasswordValid) {
      if (found.role === 'admin') {
        return { 
          success: false, 
          error: 'Mật khẩu Quản trị viên không chính xác! Chỉ người được cấp tài khoản & mật khẩu admin mới có quyền truy cập.' 
        };
      }
      return { 
        success: false, 
        error: 'Mật khẩu không chính xác! Vui lòng thử lại.' 
      };
    }

    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(found));
    localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
    this.saveDeviceAccount(found);
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
    this.saveDeviceAccount(found);
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
    this.saveDeviceAccount(newUser);
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

    // Đồng bộ avatar mới vào các bài viết của người dùng
    if (updatedFields.avatar || updatedFields.name) {
      const rawPosts = localStorage.getItem(STORAGE_KEYS.POSTS);
      if (rawPosts) {
        try {
          const posts = JSON.parse(rawPosts);
          const syncedPosts = posts.map((p: any) => {
            if (p.author?.username === current.username || p.author?.name === current.name) {
              return {
                ...p,
                author: {
                  ...p.author,
                  name: updated.name,
                  avatar: updated.avatar
                }
              };
            }
            return p;
          });
          localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(syncedPosts));
        } catch {}
      }

      // Đồng bộ avatar mới vào các bình luận của người dùng
      const rawComments = localStorage.getItem(STORAGE_KEYS.COMMENTS);
      if (rawComments) {
        try {
          const comments = JSON.parse(rawComments);
          const syncedComments = comments.map((c: any) => {
            if (c.author?.username === current.username || c.author?.name === current.name || c.userId === current.id) {
              return {
                ...c,
                author: {
                  ...c.author,
                  name: updated.name,
                  avatar: updated.avatar
                }
              };
            }
            return c;
          });
          localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(syncedComments));
        } catch {}
      }
    }

    return updated;
  }

  // Đăng xuất (xóa cờ đăng nhập và trả về tài khoản mặc định)
  public static logout(): User {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (raw) {
      try {
        const u = JSON.parse(raw);
        if (u && u.username) {
          this.saveDeviceAccount(u);
        }
      } catch {}
    }
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

  // Lấy Posts với số liệu thực tế (likes, comments, shares, ISO timestamps)
  public static getPosts(): Post[] {
    const currentUser = this.getCurrentUser();
    const raw = localStorage.getItem(STORAGE_KEYS.POSTS);
    
    // Migration v5: Nâng cấp số liệu thực tế, bình luận công khai đa người dùng và chia sẻ ra ngoài
    const migrationFlag = localStorage.getItem('trustnet_metrics_v5_comments_share');
    if (!migrationFlag) {
      localStorage.setItem('trustnet_metrics_v5_comments_share', 'true');
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(INITIAL_POSTS));
      localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(INITIAL_COMMENTS));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_POSTS.map(p => ({
        ...p,
        isLiked: Boolean(p.likedBy && p.likedBy.includes(currentUser.id))
      }));
    }

    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(INITIAL_POSTS));
      return INITIAL_POSTS.map(p => ({
        ...p,
        isLiked: Boolean(p.likedBy && p.likedBy.includes(currentUser.id))
      }));
    }

    try {
      const posts: Post[] = JSON.parse(raw);
      const comments = this.getRawComments();
      let changed = false;

      const processed = posts.map(p => {
        // Chuẩn hóa likedBy và likesCount
        const likedBy = Array.isArray(p.likedBy) ? p.likedBy : (p.isLiked ? [currentUser.id] : []);
        const likesCount = likedBy.length;
        
        // Chuẩn hóa sharedBy và sharesCount
        const sharedBy = Array.isArray(p.sharedBy) ? p.sharedBy : [];
        const sharesCount = sharedBy.length;

        // Chuẩn hóa commentsCount theo số bình luận thực tế trong database
        const realCommentsCount = comments.filter(c => c.postId === p.id).length;

        // Chuẩn hóa createdAt sang ISO nếu đang là chuỗi legacy như '2 giờ trước'
        let createdAtIso = p.createdAt;
        if (!p.createdAt || p.createdAt.includes('trước') || p.createdAt.includes('Vừa xong')) {
          createdAtIso = parseDateInput(p.createdAt).toISOString();
          changed = true;
        }

        const isLiked = likedBy.includes(currentUser.id);

        if (
          p.likesCount !== likesCount ||
          p.commentsCount !== realCommentsCount ||
          p.sharesCount !== sharesCount ||
          p.isLiked !== isLiked ||
          p.createdAt !== createdAtIso ||
          !p.likedBy ||
          !p.sharedBy
        ) {
          changed = true;
          return {
            ...p,
            likedBy,
            likesCount,
            sharedBy,
            sharesCount,
            commentsCount: realCommentsCount,
            isLiked,
            createdAt: createdAtIso
          };
        }
        return p;
      });

      if (changed) {
        localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(processed));
      }
      return processed;
    } catch {
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(INITIAL_POSTS));
      return INITIAL_POSTS;
    }
  }

  // Thêm Post mới
  public static createPost(newPost: Post): Post[] {
    const posts = this.getPosts();
    const updated = [newPost, ...posts];
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(updated));
    this.addPoints(25, 'Đăng bài có kiểm chứng AI');
    return updated;
  }

  // Admin xóa vĩnh viễn bài đăng (gỡ bài sai sự thật / lừa đảo)
  public static deletePost(postId: string): Post[] {
    const posts = this.getPosts();
    const updated = posts.filter(p => p.id !== postId);
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(updated));

    // Xóa các comment liên quan
    const rawComments = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    if (rawComments) {
      try {
        const comments = JSON.parse(rawComments);
        const filteredComments = comments.filter((c: any) => c.postId !== postId);
        localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(filteredComments));
      } catch {}
    }

    return updated;
  }

  // Admin can thiệp kiểm duyệt và dán nhãn bài viết (xác nhận, cảnh báo tin giả, gỡ bỏ)
  public static moderatePost(
    postId: string, 
    status: Post['verificationStatus'], 
    score?: number, 
    summary?: string
  ): Post[] {
    const posts = this.getPosts();
    const updated = posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          verificationStatus: status,
          verificationScore: score !== undefined ? score : (status === 'verified' ? 95 : 20),
          verificationSummary: summary || (
            status === 'verified' 
              ? 'Đã được Quản trị viên TrustNet xác nhận nội dung an toàn.' 
              : 'Quản trị viên đã gắn nhãn cảnh báo: Bài viết có dấu hiệu sai sự thật hoặc lừa đảo.'
          )
        };
      }
      return p;
    });
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(updated));
    return updated;
  }

  // Admin xóa tài khoản người dùng vi phạm
  public static deleteUserAccount(userId: string): { success: boolean; accounts: User[]; error?: string } {
    const accounts = this.getAllAccounts();
    const target = accounts.find(a => a.id === userId);
    if (!target) {
      return { success: false, accounts, error: 'Không tìm thấy tài khoản người dùng.' };
    }
    if (target.role === 'admin') {
      return { success: false, accounts, error: 'Không thể xóa tài khoản Quản trị viên hệ thống!' };
    }
    const updated = accounts.filter(a => a.id !== userId);
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(updated));
    return { success: true, accounts: updated };
  }

  // Toggle Like Post (Thực tế: Quản lý danh sách likedBy, likesCount = likedBy.length)
  public static toggleLike(postId: string): Post[] {
    const user = this.getCurrentUser();
    const posts = this.getPosts();
    let authorToNotify: { userId: string; postTitle: string } | null = null;
    let isNowLiked = false;

    const updated = posts.map(p => {
      if (p.id === postId) {
        const likedBy = Array.isArray(p.likedBy) ? [...p.likedBy] : [];
        const userIndex = likedBy.indexOf(user.id);

        if (userIndex >= 0) {
          // Bỏ like
          likedBy.splice(userIndex, 1);
          isNowLiked = false;
        } else {
          // Thêm like
          likedBy.push(user.id);
          isNowLiked = true;
          if (p.userId !== user.id) {
            authorToNotify = {
              userId: p.userId,
              postTitle: p.content.slice(0, 45) + (p.content.length > 45 ? '...' : '')
            };
          }
        }

        return {
          ...p,
          likedBy,
          likesCount: likedBy.length,
          isLiked: isNowLiked
        };
      }
      return p;
    });

    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(updated));

    // Tạo thông báo thực tế nếu vừa like bài người khác
    if (authorToNotify && isNowLiked) {
      this.addNotification({
        userId: (authorToNotify as any).userId,
        actor: {
          id: user.id,
          name: user.name,
          username: user.username,
          avatar: user.avatar
        },
        type: 'like',
        title: `${user.name} đã thích bài viết của bạn`,
        content: `"${(authorToNotify as any).postTitle}"`,
        targetPostId: postId,
        targetTab: 'feed'
      });
    }

    return updated;
  }

  // Chia sẻ bài viết (Thực tế: quản lý sharedBy, sharesCount = sharedBy.length)
  public static sharePost(postId: string): Post[] {
    const user = this.getCurrentUser();
    const posts = this.getPosts();
    let authorToNotify: { userId: string; snippet: string } | null = null;

    const updated = posts.map(p => {
      if (p.id === postId) {
        const sharedBy = Array.isArray(p.sharedBy) ? [...p.sharedBy] : [];
        if (!sharedBy.includes(user.id)) {
          sharedBy.push(user.id);
        }
        if (p.userId !== user.id) {
          authorToNotify = {
            userId: p.userId,
            snippet: p.content.slice(0, 45) + (p.content.length > 45 ? '...' : '')
          };
        }
        return {
          ...p,
          sharedBy,
          sharesCount: sharedBy.length
        };
      }
      return p;
    });

    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(updated));

    // Thưởng 5 XP cho hành động lan tỏa thông tin kiểm chứng
    this.addPoints(5, 'Lan tỏa thông tin kiểm chứng an toàn');

    // Tạo thông báo thực tế cho tác giả
    if (authorToNotify) {
      this.addNotification({
        userId: (authorToNotify as any).userId,
        actor: {
          id: user.id,
          name: user.name,
          username: user.username,
          avatar: user.avatar
        },
        type: 'share',
        title: `${user.name} đã chia sẻ bài viết của bạn`,
        content: `"${(authorToNotify as any).snippet}"`,
        targetPostId: postId,
        targetTab: 'feed'
      });
    }

    return updated;
  }

  // Lấy toàn bộ bình luận từ database
  public static getRawComments(): Comment[] {
    const raw = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(INITIAL_COMMENTS));
      return INITIAL_COMMENTS;
    }
    try {
      const parsed: Comment[] = JSON.parse(raw);
      let changed = false;
      const normalized = parsed.map(c => {
        if (!c.createdAt || c.createdAt.includes('trước') || c.createdAt.includes('Vừa xong')) {
          changed = true;
          return {
            ...c,
            createdAt: parseDateInput(c.createdAt).toISOString()
          };
        }
        return c;
      });
      if (changed) {
        localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(normalized));
      }
      return normalized;
    } catch {
      localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(INITIAL_COMMENTS));
      return INITIAL_COMMENTS;
    }
  }

  // Lấy bình luận của post
  public static getComments(postId: string): Comment[] {
    return this.getRawComments().filter(c => c.postId === postId);
  }

  // Thêm bình luận thực tế
  public static addComment(postId: string, content: string): Comment {
    const user = this.getCurrentUser();
    const all = this.getRawComments();
    const nowIso = new Date().toISOString();

    const newComment: Comment = {
      id: 'c-' + Date.now(),
      postId,
      userId: user.id,
      author: {
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        rankTitle: user.rankTitle,
        school: user.school
      },
      content,
      createdAt: nowIso,
      likesCount: 0,
      likedBy: []
    };
    all.push(newComment);
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(all));

    // Bắn event để tất cả PostCard và cửa sổ khác nhận được bình luận ngay lập tức
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('trustnet_comment_event', { detail: { postId } }));
    }

    // Update commentsCount trên post theo số lượng bình luận thực
    const posts = this.getPosts();
    let authorToNotify: { userId: string } | null = null;
    const postCommentsCount = all.filter(c => c.postId === postId).length;

    const updatedPosts = posts.map(p => {
      if (p.id === postId) {
        if (p.userId !== user.id) {
          authorToNotify = { userId: p.userId };
        }
        return {
          ...p,
          commentsCount: postCommentsCount
        };
      }
      return p;
    });
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(updatedPosts));

    // Thưởng điểm tương tác phản biện
    this.addPoints(5, 'Tham gia bình luận & thảo luận kiểm chứng');

    // Tạo thông báo thực tế gửi đến tác giả bài viết
    if (authorToNotify) {
      this.addNotification({
        userId: (authorToNotify as any).userId,
        actor: {
          id: user.id,
          name: user.name,
          username: user.username,
          avatar: user.avatar
        },
        type: 'comment',
        title: `${user.name} đã bình luận về bài viết của bạn`,
        content: content.length > 60 ? `"${content.slice(0, 57)}..."` : `"${content}"`,
        targetPostId: postId,
        targetTab: 'feed'
      });
    }

    return newComment;
  }

  // Toggle thích bình luận của người khác
  public static toggleLikeComment(commentId: string): Comment[] {
    const user = this.getCurrentUser();
    const all = this.getRawComments();
    const updated = all.map(c => {
      if (c.id === commentId) {
        const likedBy = Array.isArray(c.likedBy) ? [...c.likedBy] : [];
        const idx = likedBy.indexOf(user.id);
        if (idx >= 0) {
          likedBy.splice(idx, 1);
        } else {
          likedBy.push(user.id);
        }
        return {
          ...c,
          likedBy,
          likesCount: likedBy.length
        };
      }
      return c;
    });
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('trustnet_comment_event'));
    }
    return updated;
  }

  // Lấy danh sách thông báo thực tế
  public static getNotifications(userId?: string): AppNotification[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const targetUserId = userId || this.getCurrentUser().id;

    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS.filter(n => n.userId === targetUserId || n.userId === 'all');
    }

    try {
      const all: AppNotification[] = JSON.parse(raw);
      const filtered = all.filter(n => n.userId === targetUserId || n.userId === 'all');
      return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS.filter(n => n.userId === targetUserId || n.userId === 'all');
    }
  }

  // Thêm thông báo mới vào hệ thống
  public static addNotification(data: Omit<AppNotification, 'id' | 'createdAt' | 'read'>): AppNotification {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const all: AppNotification[] = raw ? JSON.parse(raw) : [...INITIAL_NOTIFICATIONS];

    const newNotif: AppNotification = {
      ...data,
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      read: false,
      createdAt: new Date().toISOString()
    };

    all.unshift(newNotif);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(all));

    // Bắn event để Navbar hoặc các component lắng nghe cập nhật realtime
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('trustnet_notification_event', { detail: newNotif }));
    }

    return newNotif;
  }

  // Đánh dấu thông báo đã đọc
  public static markNotificationAsRead(notifId: string): AppNotification[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) return [];
    try {
      const all: AppNotification[] = JSON.parse(raw);
      const updated = all.map(n => n.id === notifId ? { ...n, read: true } : n);
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('trustnet_notification_event'));
      }
      return this.getNotifications();
    } catch {
      return [];
    }
  }

  // Đánh dấu tất cả thông báo đã đọc
  public static markAllNotificationsAsRead(userId?: string): AppNotification[] {
    const targetUserId = userId || this.getCurrentUser().id;
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) return [];
    try {
      const all: AppNotification[] = JSON.parse(raw);
      const updated = all.map(n => {
        if (n.userId === targetUserId || n.userId === 'all') {
          return { ...n, read: true };
        }
        return n;
      });
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('trustnet_notification_event'));
      }
      return this.getNotifications(targetUserId);
    } catch {
      return [];
    }
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

      // Tạo thông báo thực tế chúc mừng hoàn thành tình huống
      this.addNotification({
        userId: user.id,
        actor: {
          id: 'u-system',
          name: 'Phòng Huấn Luyện Kỹ Năng Số',
          username: 'trustnet_academy',
          avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80'
        },
        type: 'reward',
        title: `Hoàn thành tình huống: ${target.title} (+${target.pointsReward} XP)`,
        content: `Bạn đã xuất sắc phân tích và đưa ra quyết định an toàn chính xác.`,
        targetTab: 'scenarios'
      });
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

  // Lịch sử Fact-Check cá nhân: Tự động chuẩn hóa thời gian thực tế và điểm tin cậy
  public static getFactCheckHistory(): FactCheckRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.FACT_CHECKS);
    if (!raw) return [];
    try {
      const list: FactCheckRecord[] = JSON.parse(raw);
      if (!Array.isArray(list)) return [];

      let needsSync = false;
      const normalized = list.map((record, index) => {
        let changed = false;

        // 1. Chuẩn hóa thời gian tìm kiếm thật chính xác với lúc kiểm tra
        // Khắc phục lỗi hiển thị tĩnh 'Vừa xong' hoặc thiếu timestamp chuẩn
        if (!record.createdAt || record.createdAt === 'Vừa xong' || !record.createdAt.includes('T')) {
          let realTimestampMs = 0;

          // Trích xuất mốc thời gian thực từ ID dạng fc-179257...
          if (record.id && record.id.startsWith('fc-')) {
            const rawIdNum = parseInt(record.id.replace('fc-', ''), 10);
            if (!isNaN(rawIdNum) && rawIdNum > 1600000000000 && rawIdNum < 3000000000000) {
              realTimestampMs = rawIdNum;
            }
          }

          // Hoặc đối soát qua timestampChecked được ghi lại lúc kiểm chứng
          if (!realTimestampMs && record.result?.timestampChecked) {
            const parsedChecked = parseDateInput(record.result.timestampChecked);
            if (!isNaN(parsedChecked.getTime()) && parsedChecked.getTime() > 1600000000000) {
              realTimestampMs = parsedChecked.getTime();
            }
          }

          // Nếu không có, gán thời gian lùi dần hợp lý theo thứ tự
          if (!realTimestampMs) {
            realTimestampMs = Date.now() - (index * 6 + 1) * 60 * 1000;
          }

          record.createdAt = new Date(realTimestampMs).toISOString();
          changed = true;
        }

        // 2. Chuẩn hóa mức độ tin cậy của thông tin:
        // Đã là thông tin sai (FALSE / debunked) thì mức độ tin cậy PHẢI THẤP (3 - 12/100), không thể là 60/100!
        const isFalse = 
          record.result?.verdict === 'FALSE' || 
          record.result?.status === 'debunked' || 
          record.result?.directVerdict === 'SAI';

        if (isFalse && record.result) {
          if (record.result.score > 20) {
            // Chuẩn hóa điểm tin cậy về mức thấp chuẩn xác (3-12/100)
            const lowCredibility = Math.max(4, Math.min(12, Math.round(100 - record.result.score))) || 8;
            record.result.score = lowCredibility;
            changed = true;
          }
          if (record.result.verdict !== 'FALSE') {
            record.result.verdict = 'FALSE';
            changed = true;
          }
        }

        if (changed) {
          needsSync = true;
        }

        return record;
      });

      if (needsSync) {
        localStorage.setItem(STORAGE_KEYS.FACT_CHECKS, JSON.stringify(normalized));
      }

      return normalized;
    } catch {
      return [];
    }
  }

  public static saveFactCheckRecord(record: FactCheckRecord): void {
    // Đảm bảo thời gian tạo là ISO chuẩn
    if (!record.createdAt || record.createdAt === 'Vừa xong') {
      record.createdAt = new Date().toISOString();
    }

    // Đảm bảo nếu là thông tin sai thì điểm tin cậy phải thấp
    const isFalse = 
      record.result?.verdict === 'FALSE' || 
      record.result?.status === 'debunked' || 
      record.result?.directVerdict === 'SAI';
    if (isFalse && record.result && record.result.score > 20) {
      record.result.score = Math.max(4, Math.min(12, Math.round(100 - record.result.score))) || 8;
    }

    const list = this.getFactCheckHistory();
    list.unshift(record);
    localStorage.setItem(STORAGE_KEYS.FACT_CHECKS, JSON.stringify(list));

    const user = this.getCurrentUser();
    user.factChecksCount += 1;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    this.addPoints(15, 'Kiểm chứng thông tin mới');
  }
}
