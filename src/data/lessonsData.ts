import { Lesson } from '../types';

/**
 * START_SEMESTER_DATE: Ngày bắt đầu chu kỳ học an toàn số (Thứ Hai đầu năm học)
 */
export const ACADEMY_SEMESTER_START = '2026-08-17T00:00:00.000Z';

/**
 * 15 Chuyên đề An toàn số & Kỹ năng phản biện dành cho học sinh, thanh thiếu niên và công dân số
 */
export const MASTER_LESSONS_CATALOG: Lesson[] = [
  {
    id: 'lesson-1',
    weekNumber: 1,
    releaseDate: '2026-08-17',
    title: 'Nghệ Thuật Bóc Mẽ Tin Giả (Fake News Detection)',
    topic: 'Kỹ năng xác minh nguồn',
    icon: '🕵️‍♂️',
    description: 'Nắm vững quy tắc vàng 5 ngón tay: Kiểm tra tác giả, tên miền, ngày đăng, so sánh chéo và đọc kỹ trước khi bấm share.',
    readTime: '3 phút',
    difficulty: 'Dễ',
    points: 100,
    content: [
      {
        heading: '1. Không bao giờ chỉ dừng lại ở tiêu đề (Clickbait)',
        body: 'Hơn 60% người dùng mạng xã hội chia sẻ bài viết chỉ sau khi đọc tít giật gân. Các trang tin rác thường đặt tiêu đề cường điệu để câu tương tác, trong khi nội dung bên trong lại hoàn toàn khác hoặc trích dẫn sai sự thật.',
        tip: 'Mẹo: Luôn click vào đọc ít nhất 3 đoạn đầu và kiểm tra xem tiêu đề có bằng chứng cụ thể bên dưới hay không.'
      },
      {
        heading: '2. Kỹ thuật đảo ngược hình ảnh (Reverse Image Search)',
        body: 'Nhiều kẻ tạo tin giả lấy ảnh từ một vụ hỏa hoạn ở nước ngoài từ 5 năm trước rồi gán ghép thành sự việc xảy ra sáng nay tại Hà Nội.',
        example: 'Sử dụng Google Images hoặc Google Lens để tìm ảnh gốc và ngày xuất bản đầu tiên của tấm hình.'
      },
      {
        heading: '3. Kiểm tra tên miền và ngày xuất bản',
        body: 'Chú ý các tên miền nhái tinh vi như vnexpress-24h.com, tuoitre-news.cc thay vì các trang chính thống có đuôi .vn chuẩn xác.',
        warning: 'Cảnh báo: Luôn nhìn thanh địa chỉ URL của trình duyệt trước khi tin nội dung.'
      }
    ],
    quiz: {
      question: 'Bạn thấy một bài đăng với tiêu đề "Khẩn cấp: Uống giấm táo trị khỏi hoàn toàn bệnh ung thư sau 3 ngày!". Hành động nào thể hiện tư duy an toàn số đúng đắn nhất?',
      options: [
        'A. Chia sẻ ngay vào nhóm gia đình để cảnh báo người thân',
        'B. Bấm nút thích và để lại bình luận xin công thức chi tiết',
        'C. Đọc kỹ nội dung, kiểm tra nguồn y khoa chính thống (Bộ Y tế/WHO) và đối chiếu với AI Fact Check',
        'D. Chụp màn hình gửi cho tất cả bạn bè trong danh bạ'
      ],
      answerIndex: 2,
      explanation: 'Chính xác! Các khẳng định y khoa thần kỳ không có căn cứ từ Bộ Y tế hoặc WHO thường là tin giả nguy hiểm. Cần kiểm tra chéo và đối soát trước khi có bất kỳ hành động nào.'
    },
    isCompleted: true
  },
  {
    id: 'lesson-2',
    weekNumber: 2,
    releaseDate: '2026-08-24',
    title: 'Giải Mã Cạm Bẫy Phishing & Lừa Đảo Trực Tuyến',
    topic: 'An toàn phòng ngừa lừa đảo',
    icon: '🎣',
    description: 'Cách nhận diện email mạo danh ngân hàng, tin nhắn trúng thưởng giả mạo và các link độc chiếm đoạt tài khoản.',
    readTime: '4 phút',
    difficulty: 'Trung bình',
    points: 120,
    content: [
      {
        heading: '1. Bản chất của tấn công Phishing (Lừa câu cá)',
        body: 'Kẻ xấu giả dạng làm người có thẩm quyền (ngân hàng, công an, thầy cô giáo, sàn thương mại điện tử) để tạo cảm xúc cấp bách hoặc lòng tham, ép nạn nhân hành động ngay lập tức.',
        tip: 'Quy tắc: Ngân hàng và công an KHÔNG BAO GIỜ yêu cầu bạn đọc mã OTP hoặc chuyển tiền vào tài khoản cá nhân để "phục vụ điều tra".'
      },
      {
        heading: '2. Phân tích đường link đáng ngờ',
        body: 'Kẻ lừa đảo sử dụng các ký tự gần giống (homograph attack) như thay chữ "o" bằng số "0", hoặc dùng tên miền phụ: vietcombank.login-security.xyz (bản chất tên miền là login-security.xyz).',
        example: 'Đường link thật: https://www.vietcombank.com.vn | Đường link giả: http://vietcombank.portal-security.com'
      }
    ],
    quiz: {
      question: 'Một tin nhắn SMS có brandname giống ngân hàng của bạn gửi đến: "Tài khoản của bạn sẽ bị đóng băng sau 30 phút nếu không bấm vào link http://msb.xacthuc-247.com". Bạn nên làm gì?',
      options: [
        'A. Vội vàng ấn vào link và nhập mật khẩu Internet Banking để không bị khóa',
        'B. Bỏ qua tin nhắn, tuyệt đối không ấn vào link và gọi thẳng tới hotline tổng đài in trên thẻ ATM để xác minh',
        'C. Nhập mã OTP vào trang web để lấy lại tài khoản',
        'D. Gửi link này cho bạn bè hỏi xem họ có bị khóa giống mình không'
      ],
      answerIndex: 1,
      explanation: 'Xuất sắc! Đây là hình thức giả mạo SMS Brandname bằng trạm BTS giả. Hotline in trực tiếp sau thẻ ATM là kênh liên lạc duy nhất đáng tin cậy.'
    },
    isCompleted: false
  },
  {
    id: 'lesson-3',
    weekNumber: 3,
    releaseDate: '2026-08-31',
    title: 'Pháo Đài Mật Khẩu & Xác Thực Hai Lớp (2FA)',
    topic: 'Bảo mật tài khoản',
    icon: '🔐',
    description: 'Xây dựng mật khẩu không thể phá vỡ và thiết lập ứng dụng Authenticator bảo vệ tuyệt đối mạng xã hội.',
    readTime: '3 phút',
    difficulty: 'Dễ',
    points: 100,
    content: [
      {
        heading: '1. Tại sao mật khẩu "123456" hay ngày sinh vẫn bị hack trong 1 giây?',
        body: 'Kẻ tấn công sử dụng kỹ thuật Brute-force và danh sách từ điển hàng tỷ mật khẩu bị rò rỉ. Nếu bạn dùng một mật khẩu cho cả Facebook, TikTok, email trường học, khi một trang bị lộ thì bạn mất tất cả.',
        tip: 'Nên dùng cụm mật khẩu (Passphrase) gồm 4 từ ngẫu nhiên có dấu hoặc ký tự đặc biệt, ví dụ: "BanhMi-KemTrung-2026@SieuNgon".'
      },
      {
        heading: '2. Bật 2FA bằng App thay vì SMS',
        body: 'Mã OTP qua tin nhắn SMS có thể bị đánh cắp bằng thủ đoạn tráo SIM (SIM swap). Hãy ưu tiên dùng Google Authenticator hoặc Microsoft Authenticator.',
        example: 'Ứng dụng sinh mã TOTP 6 số tự động đổi mỗi 30 giây ngay cả khi không có mạng.'
      }
    ],
    quiz: {
      question: 'Phương thức xác thực 2 yếu tố (2FA) nào sau đây an toàn và khó bị can thiệp nhất đối với tài khoản cá nhân?',
      options: [
        'A. Gửi mã OTP qua cuộc gọi điện thoại thông thường',
        'B. Gửi mã qua tin nhắn SMS',
        'C. Sử dụng ứng dụng xác thực chuyên dụng (Google/Microsoft Authenticator) hoặc khóa bảo mật phần cứng',
        'D. Ghi nhớ mã bí mật ra một tờ giấy dán trên màn hình'
      ],
      answerIndex: 2,
      explanation: 'Chính xác! Ứng dụng Authenticator tạo mã cục bộ theo chuẩn thuật toán mã hóa TOTP, không bị ảnh hưởng bởi sóng điện thoại hay tấn công tráo SIM.'
    },
    isCompleted: false
  },
  {
    id: 'lesson-4',
    weekNumber: 4,
    releaseDate: '2026-09-07',
    title: 'Dấu Chân Kỹ Thuật Số & Bảo Vệ Dữ Liệu Cá Nhân',
    topic: 'Quyền riêng tư trực tuyến',
    icon: '🛡️',
    description: 'Kiểm soát những gì bạn đăng: Tại sao bức ảnh vé máy bay hay góc học tập có thể trở thành vũ khí chống lại bạn.',
    readTime: '4 phút',
    difficulty: 'Trung bình',
    points: 120,
    content: [
      {
        heading: '1. Nguy hiểm từ việc "Check-in" quá chi tiết',
        body: 'Chụp hình căn cước công dân, thẻ sinh viên, hoặc vé máy bay có mã vạch barcode có thể làm lộ họ tên, số hộ chiếu, ngày sinh và hành trình đi lại cho kẻ xấu lợi dụng lừa đảo người thân ở nhà.',
        warning: 'Tuyệt đối không khoe mã vạch, mã QR trên vé sự kiện hoặc CCCD lên mạng xã hội.'
      },
      {
        heading: '2. Dọn dẹp quyền ứng dụng (App Permissions)',
        body: 'Một ứng dụng đèn pin hay chỉnh sửa ảnh selfie không có lý do gì để đòi quyền đọc danh bạ điện thoại, đọc tin nhắn SMS hay định vị vị trí 24/7.',
        tip: 'Hãy vào Cài đặt điện thoại và thu hồi các quyền truy cập vô lý ngay lập tức.'
      }
    ],
    quiz: {
      question: 'Bạn vừa đỗ kỳ thi quan trọng và muốn đăng ảnh lên mạng xã hội để ăn mừng. Bạn nên xử lý tấm ảnh phiếu điểm/CCCD như thế nào?',
      options: [
        'A. Đăng nguyên bản không che để mọi người thấy tính xác thực',
        'B. Che toàn bộ số định danh cá nhân, mã QR/Barcode, ngày sinh, địa chỉ nhà trước khi chia sẻ',
        'C. Gửi ảnh gốc vào các nhóm công khai để xin lời khuyên',
        'D. Đổi ảnh đại diện bằng hình chụp mặt trước và mặt sau CCCD'
      ],
      answerIndex: 1,
      explanation: 'Rất chuẩn! Việc che giấu (redact) các dữ liệu định danh như số CCCD, mã QR và địa chỉ nhà ngăn chặn triệt để hành vi đánh cắp danh tính để mở thẻ tín dụng ảo hoặc lừa đảo mạo danh.'
    },
    isCompleted: false
  },
  {
    id: 'lesson-5',
    weekNumber: 5,
    releaseDate: '2026-09-14',
    title: 'Vén Màn Deepfake & Trí Tuệ Nhân Tạo Giả Mạo',
    topic: 'Công nghệ AI & Nhận thức thế hệ mới',
    icon: '🤖',
    description: 'Cách phát hiện hình ảnh do AI vẽ, video hoán đổi khuôn mặt và giọng nói nhái của người thân gọi video call.',
    readTime: '5 phút',
    difficulty: 'Nâng cao',
    points: 150,
    content: [
      {
        heading: '1. Dấu hiệu nhận biết video Deepfake gọi video lừa tiền',
        body: 'Kẻ lừa đảo thường thực hiện cuộc gọi video rất ngắn (vài giây), viện cớ "sóng yếu, mạng chập chờn" rồi cúp máy để nhắn tin xin chuyển tiền gấp.',
        tip: 'Khi có người thân gọi video xin tiền khẩn cấp: Hãy yêu cầu họ quay nghiêng mặt sang hai bên hoặc đưa bàn tay qua mặt. Deepfake AI sẽ bị lỗi biến dạng (glitch) ở phần viền khuôn mặt.'
      },
      {
        heading: '2. Nhận biết ảnh do AI tạo ra (AI-generated)',
        body: 'Soi kỹ các chi tiết phức tạp: Khớp ngón tay (thường bị 6 ngón hoặc biến dạng), bóng đổ không nhất quán với nguồn sáng, văn bản nền bị méo mó vô nghĩa, và vành tai không tự nhiên.',
        example: 'Chú ý tròng mắt: Kính mắt của người do AI tạo thường có gọng hai bên không đối xứng hoặc ánh phản chiếu trong mắt kỳ lạ.'
      }
    ],
    quiz: {
      question: 'Khi nhận được video call từ tài khoản mẹ bạn nói đang gặp tai nạn cần chuyển tiền gấp, nhưng hình ảnh giật cục và chỉ nói 5 giây rồi tắt. Bạn nên làm gì?',
      options: [
        'A. Chuyển tiền ngay lập tức vì sợ mẹ gặp nguy hiểm',
        'B. Đăng lên Facebook hỏi ý kiến mọi người',
        'C. Giữ bình tĩnh, KHÔNG chuyển tiền. Gọi trực tiếp số điện thoại viễn thông thông thường (SIM) của mẹ hoặc người thân khác để kiểm tra',
        'D. Nhắn tin vào tài khoản đó xin số tài khoản lạ để chuyển'
      ],
      answerIndex: 2,
      explanation: 'Xuất sắc! Cuộc gọi video call ngắn vài giây kèm lý do khẩn cấp là chiêu bài Deepfake kinh điển. Luôn dùng kênh liên lạc thứ hai độc lập (gọi điện thoại trực tiếp qua mạng viễn thông) để xác minh.'
    },
    isCompleted: false
  },
  {
    id: 'lesson-6',
    weekNumber: 6,
    releaseDate: '2026-09-21',
    title: 'An Toàn Giao Dịch & Ví Điện Tử (Fintech & Banking)',
    topic: 'Bảo mật tài chính số',
    icon: '💳',
    description: 'Bảo vệ tài khoản ngân hàng, nhận diện thủ đoạn dán đè mã QR độc và chiêu trò chuyển tiền nhầm ép vay nặng lãi.',
    readTime: '4 phút',
    difficulty: 'Trung bình',
    points: 130,
    content: [
      {
        heading: '1. Thủ đoạn dán đè mã QR độc (QR Tampering)',
        body: 'Kẻ xấu in mã QR chứa tài khoản cá nhân của chúng hoặc link dẫn tới trang web giả mạo rồi dán đè lên mã thanh toán tại quầy thu ngân của các cửa hàng, quán ăn.',
        tip: 'Quy tắc: Trước khi bấm chuyển tiền, luôn nhìn kỹ tên chủ tài khoản thụ hưởng hiển thị trên ứng dụng ngân hàng xem có đúng tên cửa hàng/người bán hay không.'
      },
      {
        heading: '2. Chiêu trò "Chuyển tiền nhầm" ép vay nợ',
        body: 'Một số tiền bất ngờ được chuyển vào tài khoản bạn kèm lời nhắn cho vay. Sau đó kẻ xấu gọi điện đòi tiền với lãi suất cắt cổ hoặc đe dọa.',
        warning: 'Tuyệt đối KHÔNG tự ý chuyển tiền trả lại vào số tài khoản lạ do người gọi yêu cầu. Hãy để nguyên tiền và liên hệ ngân hàng chính thức để lập thủ tục tra soát hoàn trả.'
      }
    ],
    quiz: {
      question: 'Bạn bất ngờ nhận được 5.000.000 VNĐ từ số tài khoản lạ, sau đó có người xưng là chủ tài khoản năn nỉ bạn chuyển trả vào một số tài khoản khác ở ngân hàng khác. Bạn nên làm gì?',
      options: [
        'A. Lập tức rút ra tiêu vì nghĩ là tiền may mắn',
        'B. Chuyển ngay số tiền đó vào số tài khoản mới mà người kia vừa cung cấp qua Zalo',
        'C. Giữ nguyên số tiền, không bấm link lạ và chủ động ra quầy ngân hàng hoặc gọi tổng đài chính thức để yêu cầu tra soát theo quy trình hợp pháp',
        'D. Chặn số điện thoại và coi như không có chuyện gì xảy ra'
      ],
      answerIndex: 2,
      explanation: 'Chính xác! Tự ý chuyển trả vào tài khoản khác có thể khiến bạn trở thành nạn nhân của đường dây rửa tiền hoặc bẫy ép vay nặng lãi. Mọi giao dịch hoàn tiền phải thông qua kênh tra soát chính thức của ngân hàng.'
    },
    isCompleted: false
  },
  {
    id: 'lesson-7',
    weekNumber: 7,
    releaseDate: '2026-09-28',
    title: 'Phòng Chống Bắt Nạt Mạng & Digital Wellbeing',
    topic: 'Văn hóa ứng xử & Sức khỏe tâm lý số',
    icon: '🧘',
    description: 'Kỹ năng đối phó khi bị tấn công mạng xã hội, quấy rối nhóm (cyberbullying) và duy trì sự tỉnh thức trong kỷ nguyên số.',
    readTime: '4 phút',
    difficulty: 'Dễ',
    points: 110,
    content: [
      {
        heading: '1. Nhận diện các dạng thức bạo lực mạng',
        body: 'Bắt nạt mạng không chỉ là bình luận ác ý, mà còn bao gồm: Doxing (phát tán thông tin cá nhân/số điện thoại để người khác quấy rối), Trolling (khiêu khích gây phẫn nộ) và chế ảnh chế nhạo (Meme shaming).',
        tip: 'Quy tắc 3 bước vàng: Không đối đầu/đôi co - Chụp màn hình làm bằng chứng có ngày giờ URL - Chặn (Block) và Báo cáo (Report).'
      },
      {
        heading: '2. Bảo vệ sức khỏe tâm thần (Digital Detox)',
        body: 'Thuật toán mạng xã hội tối ưu hóa để kích thích cảm giác FOMO (sợ bỏ lỡ) và tranh cãi tiêu cực để giữ chân người dùng. Biết ngắt kết nối là biểu hiện của một công dân số bản lĩnh.',
        example: 'Hãy đặt giới hạn sử dụng mạng xã hội dưới 90 phút/ngày và bật chế độ Không làm phiền sau 22h đêm.'
      }
    ],
    quiz: {
      question: 'Một học sinh bị một nhóm tài khoản ẩn danh liên tục đăng bài bôi nhọ và chia sẻ vào các nhóm trường học. Hành vi ứng phó nào sáng suốt nhất?',
      options: [
        'A. Dùng tài khoản clone để chửi bới và đe dọa trả đũa lại nhóm đó',
        'B. Khóc một mình và âm thầm xóa tài khoản trong sợ hãi',
        'C. Chụp màn hình đầy đủ các bài viết/bình luận vi phạm, chặn các tài khoản bôi nhọ và báo cáo ngay với giáo viên chủ nhiệm, gia đình cùng ban giám hiệu',
        'D. Đăng bài xin lỗi dù mình không làm gì sai để họ tha cho'
      ],
      answerIndex: 2,
      explanation: 'Tuyệt vời! Thu thập chứng cứ nguyên trạng và nhờ sự can thiệp của người lớn có trách nhiệm (gia đình, nhà trường) là biện pháp đúng đắn, chấm dứt hành vi bạo lực mạng một cách triệt để.'
    },
    isCompleted: false
  },
  {
    id: 'lesson-8',
    weekNumber: 8,
    releaseDate: '2026-10-05',
    title: 'Khắc Tinh Của Mã Độc Tống Tiền (Ransomware & Crack Traps)',
    topic: 'Phòng chống mã độc nguy hiểm',
    icon: '🦠',
    description: 'Hiểu rõ cơ chế hoạt động của mã độc tống tiền, bẫy tải game crack và quy tắc sao lưu dữ liệu 3-2-1.',
    readTime: '5 phút',
    difficulty: 'Nâng cao',
    points: 160,
    content: [
      {
        heading: '1. Hiểm họa ngầm từ "Bản Crack Miễn Phí"',
        body: 'Không có bữa ăn nào miễn phí. Hơn 85% các file crack phần mềm hoặc game lậu trên mạng đều bị chèn mã độc đánh cắp Cookie trình duyệt (Infostealer) hoặc Ransomware mã hóa toàn bộ ổ cứng.',
        warning: 'Khi bạn nhấn "Tắt Windows Defender để chạy file crack", bạn đang tự mở cửa nhà cho kẻ trộm bước vào.'
      },
      {
        heading: '2. Chiến thuật sao lưu 3-2-1 bất khả xâm phạm',
        body: '3 bản sao dữ liệu quan trọng - trên 2 loại thiết bị lưu trữ khác nhau - trong đó có 1 bản lưu ngoại tuyến (Offline/Cloud độc lập).',
        example: 'Bài thuyết trình tốt nghiệp nên có: 1 bản trên laptop, 1 bản trên USB cất trong balo, và 1 bản trên Google Drive trường cấp.'
      }
    ],
    quiz: {
      question: 'Bạn muốn tải một phần mềm đồ họa chuyên nghiệp và thấy trên mạng có link "Tải trọn bộ Crack Full không virus 100%". Hành vi nào an toàn nhất?',
      options: [
        'A. Tắt trình diệt virus và bấm chạy file Setup.exe với quyền Administrator',
        'B. Tải về và chia sẻ ngay cho bạn bè cùng lớp',
        'C. Tuyệt đối không tải; sử dụng các phần mềm mã nguồn mở thay thế miễn phí hợp pháp hoặc dùng gói sinh viên chính hãng',
        'D. Đổi đuôi file sang .txt để kiểm tra rồi mới chạy'
      ],
      answerIndex: 2,
      explanation: 'Chính xác! Các file crack chia sẻ trôi nổi là phương thức phát tán mã độc tống tiền hàng đầu. Sử dụng phần mềm thay thế mã nguồn mở hoặc gói bản quyền giáo dục là lựa chọn an toàn tuyệt đối.'
    },
    isCompleted: false
  },
  {
    id: 'lesson-9',
    weekNumber: 9,
    releaseDate: '2026-10-12',
    title: 'Cạm Bẫy Wi-Fi Công Cộng & Tấn Công Man-in-the-Middle',
    topic: 'An ninh kết nối không dây',
    icon: '📡',
    description: 'Cách tin tặc lập trạm Wi-Fi ma (Evil Twin) tại quán cà phê để nghe lén gói tin thanh toán và mật khẩu của bạn.',
    readTime: '4 phút',
    difficulty: 'Trung bình',
    points: 130,
    content: [
      {
        heading: '1. Tấn công Wi-Fi ma (Evil Twin / Rogue AP)',
        body: 'Tin tặc tạo một điểm phát sóng Wi-Fi miễn phí không cần mật khẩu có tên y hệt quán cà phê: "Highlands_Coffee_Free" để dụ người dùng kết nối, từ đó theo dõi toàn bộ lưu lượng dữ liệu chưa mã hóa.',
        tip: 'Khi đến quán: Hãy hỏi nhân viên tên mạng Wi-Fi và mật khẩu chính xác thay vì bấm vào mạng mở bất kỳ.'
      },
      {
        heading: '2. Quy tắc vàng khi ở nơi công cộng',
        body: 'Tuyệt đối KHÔNG đăng nhập tài khoản ngân hàng, ví điện tử hoặc thực hiện giao dịch tài chính nhạy cảm qua mạng Wi-Fi công cộng không có mật khẩu bảo vệ.',
        example: 'Nếu bắt buộc phải làm việc nhạy cảm ở nơi công cộng, hãy phát 4G/5G từ điện thoại cá nhân hoặc bật VPN mã hóa.'
      }
    ],
    quiz: {
      question: 'Khi đang ngồi tại sân bay và cần chuyển tiền gấp, bạn thấy danh sách Wi-Fi có một mạng tên "Airport_Free_HighSpeed_NoPass". Bạn nên xử lý thế nào?',
      options: [
        'A. Kết nối ngay để tiết kiệm dung lượng 4G',
        'B. Mở app ngân hàng và chuyển tiền thật nhanh rồi ngắt kết nối',
        'C. Tắt Wi-Fi công cộng, sử dụng gói dữ liệu di động cá nhân (4G/5G) để thực hiện giao dịch an toàn',
        'D. Nhờ người ngồi cạnh đăng nhập tài khoản của họ chuyển giúp'
      ],
      answerIndex: 2,
      explanation: 'Rất chuẩn xác! Mạng Wi-Fi mở không mật khẩu rất dễ bị kẻ xấu dựng lên để đánh chặn dữ liệu (Man-in-the-Middle). Dùng dữ liệu di động 4G/5G cá nhân là giải pháp bảo mật nhất.'
    },
    isCompleted: false
  },
  {
    id: 'lesson-10',
    weekNumber: 10,
    releaseDate: '2026-10-19',
    title: 'Bóc Mẽ Bẫy Việc Làm Online & Giật Đơn Kiếm Tiền',
    topic: 'Phòng ngừa lừa đảo tài chính',
    icon: '🎯',
    description: 'Nhận diện chiêu trò tuyển cộng tác viên xem video TikTok nhận lương, giật đơn sàn thương mại điện tử nạp tiền.',
    readTime: '4 phút',
    difficulty: 'Dễ',
    points: 110,
    content: [
      {
        heading: '1. Kịch bản bẫy hoa hồng mồi chài',
        body: 'Giai đoạn 1: Kẻ lừa đảo cho bạn làm nhiệm vụ dễ (like video, gõ mã captcha) và chuyển trả thật 50.000đ - 100.000đ để tạo lòng tin. Giai đoạn 2: Yêu cầu nạp 500k - 2 triệu để nhận đơn hàng hoa hồng khủng, sau đó viện cớ lỗi hệ thống bắt nạp tiếp hàng chục triệu rồi biến mất.',
        warning: 'Dấu hiệu nhận biết: Bất kỳ công việc nào yêu cầu ứng viên PHẢI NẠP TIỀN TRƯỚC để làm nhiệm vụ đều 100% là bẫy lừa đảo.'
      },
      {
        heading: '2. Các hội nhóm Telegram "chuyên gia đọc lệnh"',
        body: 'Các hội nhóm khoe ảnh chụp màn hình tài khoản ngân hàng nhảy số hàng trăm triệu mỗi ngày thực chất là ảnh giả mạo do các ứng dụng tạo bill giả tạo ra để đánh vào lòng tham.',
        tip: 'Quy tắc: Không có công việc nào "việc nhẹ lương cao, ngồi nhà gõ phím kiếm chục triệu mỗi ngày".'
      }
    ],
    quiz: {
      question: 'Bạn nhận được lời mời làm cộng tác viên xử lý đơn hàng Shopee với mức hoa hồng 20%, nhưng bên tuyển dụng yêu cầu bạn nạp trước 300.000đ tiền cọc bảo lãnh. Đây là dấu hiệu gì?',
      options: [
        'A. Cơ hội khởi nghiệp tuyệt vời cần nắm bắt ngay',
        'B. Bẫy lừa đảo nạp tiền nhiệm vụ kinh điển, cần chặn và báo cáo ngay lập tức',
        'C. Quy trình tuyển dụng bình thường của các tập đoàn công nghệ lớn',
        'D. Vay thêm tiền bạn bè để nạp hẳn gói VIP 3 triệu cho hoa hồng cao hơn'
      ],
      answerIndex: 1,
      explanation: 'Chính xác! Các sàn TMĐT chính thống không bao giờ tuyển CTV qua tin nhắn riêng và không bao giờ thu tiền cọc làm nhiệm vụ. Đây là bẫy lừa đảo tài chính phổ biến.'
    },
    isCompleted: false
  },
  {
    id: 'lesson-11',
    weekNumber: 11,
    releaseDate: '2026-10-26',
    title: 'Nghệ Thuật Thao Túng Tâm Lý (Social Engineering)',
    topic: 'Tâm lý học an ninh mạng',
    icon: '🎭',
    description: 'Khám phá cách tin tặc đánh vào nỗi sợ hãi, sự tò mò và lòng trắc ẩn để hạ gục ngay cả những người am hiểu công nghệ.',
    readTime: '5 phút',
    difficulty: 'Nâng cao',
    points: 150,
    content: [
      {
        heading: '1. Đòn đánh "Tạo khủng hoảng giả tạo"',
        body: 'Kẻ lừa đảo giả danh Viện kiểm sát, Tòa án hoặc giáo viên thông báo bạn liên quan đến đường dây rửa tiền hoặc sắp bị đuổi học, cấm nói với bất kỳ ai để cô lập nạn nhân về tâm lý.',
        tip: 'Hãy nhớ: Cơ quan công an và tư pháp Việt Nam làm việc tại trụ sở có giấy mời/giấy triệu tập bằng văn bản, KHÔNG BAO GIỜ làm việc qua điện thoại hay Zalo.'
      },
      {
        heading: '2. Áp dụng quy tắc "60 giây hạ nhiệt"',
        body: 'Khi nhận được bất kỳ tin nhắn nào khiến bạn tim đập nhanh, cực kỳ sợ hãi hoặc cực kỳ phấn khích: Hãy dừng lại đúng 60 giây, đặt điện thoại xuống và uống một ngụm nước để não bộ thoát khỏi trạng thái phản xạ cảm xúc.',
        example: 'Hỏi ý kiến của một người thứ ba khách quan trước khi đưa ra bất kỳ quyết định chuyển tiền hay nhập thông tin.'
      }
    ],
    quiz: {
      question: 'Đặc điểm chung nổi bật nhất của các cuộc tấn công thao túng tâm lý (Social Engineering) là gì?',
      options: [
        'A. Luôn sử dụng mã độc virus cực kỳ phức tạp để xâm nhập phần cứng',
        'B. Thường xuyên khai thác cảm xúc con người (sợ hãi, lòng tham, sự tò mò) và tạo cảm giác cấp bách để ép hành động ngay',
        'C. Luôn diễn ra vào ban đêm khi người dùng đi ngủ',
        'D. Chỉ nhắm vào người già không biết dùng điện thoại thông minh'
      ],
      answerIndex: 1,
      explanation: 'Xuất sắc! Social Engineering tấn công vào "lỗ hổng con người" thay vì lỗ hổng phần mềm. Ép nạn nhân hành động trong cảm xúc vội vã là chìa khóa của mọi vụ lừa đảo.'
    },
    isCompleted: false
  },
  {
    id: 'lesson-12',
    weekNumber: 12,
    releaseDate: '2026-11-02',
    title: 'Luật An Ninh Mạng & Đạo Đức Số Học Đường',
    topic: 'Pháp luật & Trách nhiệm số',
    icon: '⚖️',
    description: 'Hiểu rõ các giới hạn pháp lý khi chia sẻ nội dung trên mạng, khung hình phạt khi đưa tin sai sự thật và bản quyền số.',
    readTime: '4 phút',
    difficulty: 'Trung bình',
    points: 120,
    content: [
      {
        heading: '1. Trách nhiệm pháp lý của việc bấm nút "Chia sẻ"',
        body: 'Theo Nghị định 15/2020/NĐ-CP, hành vi cung cấp, chia sẻ thông tin giả mạo, thông tin sai sự thật, xuyên tạc, vu khống, xúc phạm uy tín của cơ quan, tổ chức, danh dự của cá nhân bị phạt tiền từ 10.000.000đ đến 20.000.000đ.',
        warning: 'Chia sẻ bài viết sai sự thật từ người khác cũng phải chịu trách nhiệm pháp lý tương đương như người đăng ban đầu.'
      },
      {
        heading: '2. Tôn trọng bản quyền & Dữ liệu riêng tư của người khác',
        body: 'Không tự ý chụp ảnh, quay lén và đăng tải hình ảnh bạn bè, thầy cô lên mạng xã hội với mục đích bêu riếu hoặc câu tương tác khi chưa có sự đồng ý của họ.',
        tip: 'Quy tắc vàng: Nếu bạn không dám nói điều đó công khai trước mặt mọi người, đừng gõ nó lên bàn phím.'
      }
    ],
    quiz: {
      question: 'Một học sinh 16 tuổi thấy một tin đồn thất thiệt về tai nạn giao thông nghiêm trọng trong trường và chia sẻ lại lên trang cá nhân gây hoang mang cho phụ huynh. Học sinh này có bị xử lý pháp luật không?',
      options: [
        'A. Không, vì học sinh chưa đủ 18 tuổi nên được miễn trừ mọi trách nhiệm pháp luật',
        'B. Có, người từ đủ 14 tuổi đến dưới 16 tuổi và từ 16 tuổi trở lên đều phải chịu các chế tài xử phạt hành chính hoặc hình sự tương ứng với mức độ vi phạm',
        'C. Không, vì học sinh chỉ chia sẻ lại chứ không phải là người viết ra tin đồn',
        'D. Chỉ cần xin lỗi trên trang cá nhân là xong, không có luật nào quy định'
      ],
      answerIndex: 1,
      explanation: 'Hoàn toàn chính xác! Pháp luật Việt Nam quy định rõ độ tuổi chịu trách nhiệm hành chính và hình sự. Việc lan truyền tin giả gây hoang mang dư luận xã hội đều phải chịu chế tài nghiêm minh.'
    },
    isCompleted: false
  },
  {
    id: 'lesson-13',
    weekNumber: 13,
    releaseDate: '2026-11-09',
    title: 'Mua Sắm Trực Tuyến & Bóc Mẽ Đánh Giá Ảo (Fake Reviews)',
    topic: 'Người tiêu dùng số thông thái',
    icon: '🛍️',
    description: 'Kỹ năng nhận diện shop lừa đảo, hàng giả tinh vi và mẹo đọc vị đánh giá seeding "5 sao ảo" trên các sàn TMĐT.',
    readTime: '4 phút',
    difficulty: 'Dễ',
    points: 110,
    content: [
      {
        heading: '1. Cách bóc mẽ đánh giá ảo (Seeding Reviews)',
        body: 'Các gian hàng lừa đảo thường mua hàng loạt đánh giá 5 sao từ bot: Các bình luận có nội dung khen chung chung giống hệt nhau, hình ảnh đính kèm trùng lặp, và được đăng dồn dập trong cùng 1-2 ngày.',
        tip: 'Mẹo: Luôn lọc xem các đánh giá 1 sao - 3 sao kèm video/hình ảnh thực tế của người mua để biết được nhược điểm thật của sản phẩm.'
      },
      {
        heading: '2. Cảnh giác bẫy giao hàng "Ship COD không cho kiểm tra"',
        body: 'Kẻ lừa đảo gửi các gói hàng rác (mẩu giấy, vòng tay rẻ tiền) với phí COD 200.000đ - 500.000đ vào lúc bạn vắng nhà và người thân nhận hộ.',
        warning: 'Dặn dò người thân ở nhà: Tuyệt đối không nhận hộ các đơn hàng mà người mua chưa báo trước mã vận đơn.'
      }
    ],
    quiz: {
      question: 'Khi mua một món đồ công nghệ đắt tiền trên mạng, bước nào sau đây giúp bạn tránh rủi ro bị lừa đảo nhất?',
      options: [
        'A. Chỉ nhìn vào số lượng 5 sao trên đầu trang và bấm mua ngay',
        'B. Nhắn tin riêng cho shop để chuyển khoản trực tiếp qua ngân hàng nhận chiết khấu cao',
        'C. Mua qua gian hàng chính hãng (Mall/Official), thanh toán qua sàn, lọc đọc kỹ đánh giá 1-3 sao và quay video lúc mở hộp (Unbox)',
        'D. Chọn gian hàng rẻ nhất thị trường dù không có đánh giá nào'
      ],
      answerIndex: 2,
      explanation: 'Chính xác! Mua tại gian hàng uy tín, thanh toán qua sàn có bảo hộ và quay video unbox là bằng chứng bảo vệ bạn 100% khi phát sinh tranh chấp hoặc nhận hàng sai quy cách.'
    },
    isCompleted: false
  },
  {
    id: 'lesson-14',
    weekNumber: 14,
    releaseDate: '2026-11-16',
    title: 'Bảo Vệ Camera Gia Đình & Thiết Bị Thông Minh IoT',
    topic: 'An ninh thiết bị kết nối IoT',
    icon: '📷',
    description: 'Ngăn chặn nguy cơ lộ clip đời tư nhạy cảm do mật khẩu camera mặc định và bảo vệ mạng gia đình khỏi tin tặc.',
    readTime: '4 phút',
    difficulty: 'Trung bình',
    points: 130,
    content: [
      {
        heading: '1. Hiểm họa từ "Mật khẩu mặc định" (Default Password)',
        body: 'Hàng ngàn camera an ninh tại Việt Nam bị phát trực tiếp lên các trang web đen mỗi ngày chỉ vì chủ nhà giữ nguyên mật khẩu do thợ lắp đặt để lại: "admin", "123456" hoặc để trống mật khẩu.',
        warning: 'Sau khi lắp đặt bất kỳ camera hay bộ phát Wi-Fi nào: Việc đầu tiên bắt buộc phải làm là đổi mật khẩu quản trị sang một chuỗi bí mật chỉ gia đình bạn biết.'
      },
      {
        heading: '2. Vị trí đặt camera thông minh',
        body: 'Hạn chế tối đa việc lắp đặt camera kết nối Internet tại các không gian riêng tư (phòng ngủ, phòng tắm). Nếu có, hãy chọn các dòng camera có màn che vật lý (Privacy Shutter).',
        tip: 'Tắt tính năng truy cập từ xa (Cloud Access) nếu bạn chỉ có nhu cầu xem camera khi ở nhà qua mạng nội bộ.'
      }
    ],
    quiz: {
      question: 'Thao tác bảo mật quan trọng hàng đầu cần thực hiện ngay sau khi kỹ thuật viên hoàn tất lắp đặt camera giám sát trong nhà là gì?',
      options: [
        'A. Chia sẻ tài khoản camera cho tất cả hàng xóm cùng xem giúp',
        'B. Đăng nhập ngay bằng tài khoản của thợ và giữ nguyên để tiện nhờ bảo hành',
        'C. Đổi ngay mật khẩu tài khoản và mật khẩu thiết bị sang chuỗi mạnh của riêng bạn, đồng thời bật xác thực 2 lớp trên ứng dụng',
        'D. Dán băng keo đen che ống kính vĩnh viễn'
      ],
      answerIndex: 2,
      explanation: 'Xuất sắc! Đổi mật khẩu thiết bị và kích hoạt xác thực 2 bước ngay lập tức loại bỏ hoàn toàn khả năng bị thợ lắp đặt hoặc tin tặc dò quét truy cập trái phép vào hình ảnh gia đình.'
    },
    isCompleted: false
  },
  {
    id: 'lesson-15',
    weekNumber: 15,
    releaseDate: '2026-11-23',
    title: 'Cấp Cứu 15 Phút: Xử Lý Khẩn Cấp Khi Bị Hack Tài Khoản',
    topic: 'Ứng phó sự cố an ninh cá nhân',
    icon: '🚨',
    description: 'Quy trình chuẩn 4 bước "giờ vàng" để thu hồi tài khoản mạng xã hội và cô lập thiệt hại khi bị kẻ xấu chiếm quyền.',
    readTime: '5 phút',
    difficulty: 'Nâng cao',
    points: 180,
    content: [
      {
        heading: '1. Thời gian vàng 15 phút đầu tiên',
        body: 'Bước 1: Lập tức bảo vệ email gốc (đổi mật khẩu email và bật 2FA vì email là chìa khóa để reset mọi dịch vụ khác). Bước 2: Dùng tính năng "Đăng xuất khỏi tất cả các thiết bị" (Log out of all sessions). Bước 3: Đổi mật khẩu tài khoản bị hack sang mật khẩu mới. Bước 4: Kiểm tra và xóa các ứng dụng bên thứ ba được cấp quyền đáng ngờ.',
        tip: 'Nếu không vào được tài khoản: Dùng ngay tính năng "Báo cáo tài khoản bị xâm phạm" (Hacked Report) của chính nền tảng bằng thiết bị và mạng Wi-Fi quen thuộc bạn hay dùng.'
      },
      {
        heading: '2. Cảnh báo người thân ngay lập tức',
        body: 'Kẻ hack nick thường sẽ nhắn tin mượn tiền tất cả danh bạ trong vòng 30 phút đầu. Hãy dùng điện thoại gọi trực tiếp hoặc nhờ bạn bè đăng bài cảnh báo: "Nick của tôi vừa bị hack, tuyệt đối không ai chuyển tiền".',
        warning: 'Không bao giờ tin tưởng các dịch vụ "nhận lấy lại nick Facebook" trên mạng xã hội vì đa phần chúng là chiêu trò lừa tiền cọc lần 2.'
      }
    ],
    quiz: {
      question: 'Khi phát hiện tài khoản Facebook của mình bị chiếm đoạt và đang nhắn tin mượn tiền bạn bè, phản ứng đầu tiên cần ưu tiên làm ngay là gì?',
      options: [
        'A. Thuê ngay các dịch vụ "hacker lấy lại nick" trên mạng với giá 500k',
        'B. Nhanh chóng dùng kênh khác (gọi điện, nhờ người thân đăng bài) cảnh báo mọi người KHÔNG chuyển tiền, đồng thời bảo vệ hộp thư email gốc để thực hiện quy trình khôi phục chính thức',
        'C. Ngồi khóc và chờ kẻ hack chán tự trả lại',
        'D. Chuyển tiền vào tài khoản kẻ hack yêu cầu để chuộc lại'
      ],
      answerIndex: 1,
      explanation: 'Tuyệt đỉnh! Bảo vệ người thân không bị mất tiền là ưu tiên số 1, sau đó tiến hành khôi phục tài khoản qua kênh chính thống của nền tảng dựa trên hòm thư email bảo mật.'
    },
    isCompleted: false
  }
];

/**
 * Helper: Tính toán tuần học hiện tại dựa trên ngày thực tế
 * Chu kỳ mỗi tuần 1 bài học bắt đầu từ ACADEMY_SEMESTER_START
 */
export function getCurrentAcademicWeek(): number {
  const startDate = new Date(ACADEMY_SEMESTER_START).getTime();
  const now = Date.now();
  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  
  const diffWeeks = Math.floor((now - startDate) / ONE_WEEK_MS);
  // Tuần 1 bắt đầu từ diffWeeks = 0
  const currentWeek = Math.max(1, diffWeeks + 1);
  return currentWeek;
}

/**
 * Helper: Tính thời gian mở khóa bài học tiếp theo
 */
export function getNextLessonUnlockInfo(currentWeek: number) {
  const startDate = new Date(ACADEMY_SEMESTER_START).getTime();
  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  
  // Thời điểm tuần kế tiếp bắt đầu (Thứ Hai 00:00)
  const nextUnlockTimestamp = startDate + currentWeek * ONE_WEEK_MS;
  const now = Date.now();
  const diffMs = Math.max(0, nextUnlockTimestamp - now);
  
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diffMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  
  return {
    nextWeekNumber: currentWeek + 1,
    unlockDate: new Date(nextUnlockTimestamp).toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }),
    daysRemaining: days,
    hoursRemaining: hours
  };
}

/**
 * Kho đề tài dự phòng để tự động tạo bài học mới cho các tuần tiếp theo vô tận
 */
const EXTENDED_SAFETY_THEMES = [
  {
    topic: 'An toàn Trí tuệ Nhân tạo',
    icon: '🧠',
    title: 'Phòng Ngừa Bẫy Prompt Injection & Rò Rỉ Dữ Liệu Qua Chatbot AI',
    desc: 'Cách sử dụng ChatGPT, Gemini an toàn: Không nạp dữ liệu riêng tư, nhận diện các câu trả lời giả mạo (Hallucination).'
  },
  {
    topic: 'Bảo mật Tài sản Số',
    icon: '🪙',
    title: 'Nhận Diện Lừa Đảo Tiền Kỹ Thuật Số & Dự Án Đa Cấp Web3',
    desc: 'Bóc mẻ bẫy tặng Token miễn phí (Airdrop giả mạo), cẩn trọng với các ứng dụng ví phi tập trung không rõ nguồn gốc.'
  },
  {
    topic: 'Văn hóa Số & Bản quyền',
    icon: '🎨',
    title: 'Bảo Vệ Tác Phẩm Nghệ Thuật & Nội Dung Sáng Tạo Trên Không Gian Số',
    desc: 'Gắn Watermark thông minh, đăng ký bản quyền số và cách xử lý khi tác phẩm bị kẻ khác tải về xào nấu trái phép.'
  },
  {
    topic: 'An toàn Thiết bị Di động',
    icon: '📱',
    title: 'Phòng Ngừa Phần Mềm Gián Điệp (Spyware) & Dịch Vụ Định Vị Ẩn',
    desc: 'Cách kiểm tra xem điện thoại có bị cài ứng dụng gián điệp theo dõi hay không và mẹo khôi phục cài đặt gốc an toàn.'
  },
  {
    topic: 'Đạo đức & Danh dự Số',
    icon: '🌐',
    title: 'Xây Dựng Thương Hiệu Cá Nhân Tích Cực Trong Kỷ Nguyên Trí Tuệ Nhân Tạo',
    desc: 'Biến không gian mạng thành bệ phóng tương lai thay vì chiếc bẫy lưu giữ những vết đen số khó xóa nhòa.'
  }
];

/**
 * Tự động đồng bộ và tính toán danh sách bài học theo chu kỳ hàng tuần:
 * - Gán trạng thái isUnlocked cho các bài trong tuần đã tới
 * - Đánh dấu isNewThisWeek cho bài của tuần hiện tại
 * - Nếu thời gian tiến xa hơn danh mục gốc, tự động mở rộng thêm các bài tuần mới không giới hạn!
 */
export function buildWeeklyLessonsSchedule(storedLessons?: Lesson[], previewAllMode: boolean = false): Lesson[] {
  const currentWeek = getCurrentAcademicWeek();
  const completedMap = new Map<string, boolean>();
  
  if (Array.isArray(storedLessons)) {
    for (const l of storedLessons) {
      if (l.isCompleted) {
        completedMap.set(l.id, true);
      }
    }
  }

  // Danh mục bài học cơ sở
  const lessons: Lesson[] = MASTER_LESSONS_CATALOG.map((item) => {
    const isCompleted = completedMap.get(item.id) || item.isCompleted || false;
    const isUnlocked = previewAllMode || (item.weekNumber ? item.weekNumber <= currentWeek : true) || isCompleted;
    const isNewThisWeek = item.weekNumber === currentWeek;
    
    return {
      ...item,
      isCompleted,
      isUnlocked,
      isNewThisWeek
    };
  });

  // TỰ ĐỘNG CẬP NHẬT THÊM CHO CÁC TUẦN TƯƠNG LAI NẾU THỜI GIAN ĐÃ VƯỢT QUÁ DANH MỤC GỐC:
  if (currentWeek > MASTER_LESSONS_CATALOG.length) {
    const extraWeeksNeeded = currentWeek - MASTER_LESSONS_CATALOG.length;
    for (let i = 1; i <= extraWeeksNeeded; i++) {
      const weekNum = MASTER_LESSONS_CATALOG.length + i;
      const themeIdx = (i - 1) % EXTENDED_SAFETY_THEMES.length;
      const theme = EXTENDED_SAFETY_THEMES[themeIdx];
      const lessonId = `lesson-auto-week-${weekNum}`;
      
      const isCompleted = completedMap.get(lessonId) || false;
      const isUnlocked = previewAllMode || weekNum <= currentWeek || isCompleted;
      const isNewThisWeek = weekNum === currentWeek;
      
      lessons.push({
        id: lessonId,
        weekNumber: weekNum,
        releaseDate: new Date(new Date(ACADEMY_SEMESTER_START).getTime() + (weekNum - 1) * 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        title: theme.title,
        topic: theme.topic,
        icon: theme.icon,
        description: theme.desc,
        readTime: '4 phút',
        difficulty: 'Nâng cao',
        points: 150,
        content: [
          {
            heading: '1. Nhận diện thách thức bảo mật thế hệ mới',
            body: `Chuyên đề nâng cao Tuần ${weekNum}: Công nghệ thay đổi liên tục tạo ra các phương thức tấn công tinh vi hơn. Hiểu rõ bản chất công nghệ giúp bạn luôn đi trước kẻ xấu một bước.`,
            tip: 'Mẹo an toàn: Luôn cập nhật kiến thức bảo mật định kỳ và duy trì thói quen kiểm chứng trước khi tin cậy bất kỳ thông tin nào.'
          },
          {
            heading: '2. Quy tắc phòng vệ chủ động',
            body: 'Áp dụng mô hình phòng thủ Zero Trust (Không tin tưởng bất kỳ ai, luôn xác minh lại) trong mọi tình huống giao tiếp và tương tác trên mạng.',
            example: 'Khi tiếp nhận dữ liệu hoặc yêu cầu từ bất kỳ hệ sinh thái số nào, luôn kiểm tra nguồn gốc và chứng chỉ bảo mật.'
          }
        ],
        quiz: {
          question: `Trong chuyên đề Tuần ${weekNum} về "${theme.topic}", nguyên tắc an toàn số nào là cốt lõi để bảo vệ bản thân lâu dài?`,
          options: [
            'A. Tin tưởng tuyệt đối vào các ứng dụng có biểu tượng đẹp',
            'B. Luôn duy trì tư duy phản biện, xác minh đa nguồn độc lập và kích hoạt bảo mật đa tầng',
            'C. Cài đặt mọi tiện ích mở rộng được quảng cáo trên mạng',
            'D. Không bao giờ đổi mật khẩu để tránh quên'
          ],
          answerIndex: 1,
          explanation: 'Chính xác! Tư duy phản biện số kết hợp cùng các công nghệ bảo vệ chủ động là nền tảng cốt lõi của một công dân số thông minh.'
        },
        isCompleted,
        isUnlocked,
        isNewThisWeek
      });
    }
  }

  return lessons;
}
