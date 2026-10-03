import { Scenario } from '../types';

export const MASTER_SCENARIOS_CATALOG: Scenario[] = [
  {
    id: 'scen-1',
    title: 'Tình huống 1: Tin Nóng Khẩn Cấp Về Dịch Bệnh',
    category: 'breaking_news',
    categoryLabel: 'Tin nóng khẩn cấp',
    urgencyLevel: 'Khẩn cấp',
    questionType: 'single_choice',
    description: 'Bạn đang lướt mạng xã hội vào đêm muộn thì bắt gặp một bài đăng giật gân có hàng ngàn lượt chia sẻ trong ít phút.',
    simulatedMessage: {
      senderName: 'Nhóm Thông Tin Đô Thị 24/7',
      senderHandle: '@tinnhanh_dothi',
      senderAvatar: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=200&q=80',
      timeAgo: '12 phút trước',
      platform: 'Facebook',
      messageText: '🚨 KHẨN CẤP! Vừa phát hiện một loại virus lạ cực độc lây qua đường hô hấp đang lan rộng ở các quận trung tâm, các bệnh viện đang quá tải. Mọi người phải chia sẻ bài viết này ngay cho gia đình để kịp tích trữ lương thực trước khi phong tỏa ngày mai!!',
      mediaType: 'image',
      mediaUrl: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&w=600&q=80',
      metadataTag: '🔥 8.4k Lượt chia sẻ'
    },
    question: 'Trong tình huống này, phản xạ đúng đắn nhất của một công dân số thông minh là gì?',
    options: [
      {
        id: 'opt-1a',
        text: 'A. Chia sẻ ngay vào nhóm gia đình để mọi người đi siêu thị mua đồ tích trữ kịp thời.',
        isCorrect: false,
        feedback: 'Sai lầm nguy hiểm: Chia sẻ tin tức chưa kiểm chứng gây hoang mang dư luận xã hội và có thể kích động tình trạng khan hiếm hàng hóa giả tạo.'
      },
      {
        id: 'opt-1b',
        text: 'B. Dừng lại, giữ bình tĩnh, KHÔNG chia sẻ. Tra cứu chéo trên Cổng Thông tin Bộ Y tế (moh.gov.vn) hoặc dùng TrustNet AI Kiểm chứng.',
        isCorrect: true,
        feedback: 'Chính xác! Các thông tin dịch bệnh nguy hiểm chỉ có giá trị khi được phát ngôn chính thức từ Bộ Y tế hoặc cơ quan có thẩm quyền.'
      },
      {
        id: 'opt-1c',
        text: 'C. Viết bình luận suy đoán thêm các triệu chứng để mọi người đề phòng.',
        isCorrect: false,
        feedback: 'Thêm thắt suy đoán chỉ làm cho tin đồn thất thiệt lan rộng hơn và tăng độ hoảng loạn.'
      },
      {
        id: 'opt-1d',
        text: 'D. Nhắn tin riêng cho chủ bài viết hỏi xin thuốc điều trị đặc hiệu.',
        isCorrect: false,
        feedback: 'Các nhóm tin giật gân thường là bước đệm để bán thuốc đông y, thực phẩm chức năng giả mạo trục lợi.'
      }
    ],
    expertTip: 'Quy tắc 3 KHÔNG khi gặp tin nóng: KHÔNG vội tin - KHÔNG hoảng loạn - KHÔNG chia sẻ trước khi có thông cáo chính thống.',
    pointsReward: 50,
    isCompleted: false
  },
  {
    id: 'scen-2',
    title: 'Tình huống 2: Trúng Thưởng Xe Máy SH & Bẫy Cọc Phí Vận Chuyển',
    category: 'prize_scam',
    categoryLabel: 'Lừa đảo trúng thưởng',
    urgencyLevel: 'Đánh lừa',
    questionType: 'fill_in_the_blank',
    description: 'Bạn nhận được tin nhắn SMS thông báo trúng giải đặc biệt từ một chương trình tri ân khách hàng quy mô lớn.',
    simulatedMessage: {
      senderName: 'TỔNG ĐÀI TRI ÂN 2026',
      senderHandle: 'SMS Brandname: TRI_AN_VN',
      senderAvatar: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=200&q=80',
      timeAgo: '5 phút trước',
      platform: 'SMS',
      messageText: '🎉 CHÚC MỪNG QUÝ KHÁCH! Số thuê bao của bạn đã may mắn trúng 01 Xe máy Honda SH 150i trị giá 110 triệu VNĐ. Để hoàn tất thủ tục bàn giao xe tận nhà, quý khách vui lòng truy cập http://nhanthuong-sh2026.top, nhập mã xác thực gửi về điện thoại và chuyển 1.500.000đ tiền cọc biển số trước 12h trưa nay.',
      metadataTag: '⚠️ Yêu cầu chuyển tiền gấp'
    },
    question: 'Hãy điền từ khóa bảo mật tối quan trọng vào ô trống dưới đây để hoàn thiện quy tắc an toàn:',
    fillBlankData: {
      prefixText: 'Các ngân hàng và tập đoàn uy tín KHÔNG BAO GIỜ yêu cầu khách hàng cung cấp mã ',
      blankPlaceholder: 'Nhập từ khóa (vd: OTP...)',
      suffixText: ' hoặc nạp tiền cọc trước để làm thủ tục nhận giải thưởng tri ân.',
      acceptableAnswers: ['OTP', 'mã OTP', 'ma OTP', 'mã xác thực', 'ma xac thuc', 'mã xác nhận', 'ma xac nhan', 'one-time password'],
      hint: 'Dãy 6 chữ số bí mật do ngân hàng gửi cho riêng bạn để xác nhận chuyển tiền/giao dịch.',
      explanation: 'Chính xác! Mã OTP (One-Time Password) là chìa khóa bảo mật cuối cùng của tài khoản ngân hàng. Tuyệt đối không cung cấp mã OTP cho bất kỳ trang web hoặc cá nhân nào để tránh bị rút sạch tiền trong tài khoản.'
    },
    expertTip: 'Nguyên tắc vàng: Giải thưởng thật không bao giờ đòi hỏi người trúng phải chuyển tiền trước dưới mọi hình thức (phí vận chuyển, thuế trước bạ, phí làm hồ sơ).',
    pointsReward: 60,
    isCompleted: false
  },
  {
    id: 'scen-3',
    title: 'Tình huống 3: Cuộc Gọi Video "Sóng Yếu" Từ Người Thân Đi Xa',
    category: 'deepfake',
    categoryLabel: 'Deepfake AI mạo danh',
    urgencyLevel: 'Nguy hiểm',
    questionType: 'single_choice',
    description: 'Một tài khoản mạng xã hội của anh họ bạn đang đi du học bất ngờ gọi video call và nhờ chuyển tiền gấp.',
    simulatedMessage: {
      senderName: 'Anh Tuấn (Du Học Sinh)',
      senderHandle: '@tuan_duhoc_kr',
      senderAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
      timeAgo: '3 phút trước',
      platform: 'Facebook',
      messageText: 'Em ơi anh đang ở sân bay làm thủ tục hải quan mà bị lỗi thẻ visa, thiếu mất 12 triệu để đóng phạt hành lý. Anh vừa gọi video cho em thấy mặt anh rồi đấy, mạng chập chờn quá bị ngắt rồi. Em chuyển khoản gấp vào tài khoản cán bộ hải quan này giúp anh nhé: 1903... NGUYEN HOANG NAM.',
      metadataTag: '🚨 Yêu cầu chuyển tiền sang tài khoản người lạ'
    },
    question: 'Phương pháp an toàn nhất để xác minh tính xác thực của cuộc gọi trước khi có ý định chuyển tiền là gì?',
    options: [
      {
        id: 'opt-3a',
        text: 'A. Chuyển tiền ngay vì đã tận mắt nhìn thấy mặt anh họ cử động trong video call 5 giây.',
        isCorrect: false,
        feedback: 'Sai lầm: Kẻ lừa đảo sử dụng video quay sẵn hoặc công nghệ Deepfake AI hoán đổi khuôn mặt để tạo video ngắn vài giây rồi giả vờ mạng yếu để ngắt cuộc gọi.'
      },
      {
        id: 'opt-3b',
        text: 'B. Dừng lại, KHÔNG chuyển tiền. Gọi điện thoại trực tiếp qua số thuê bao di động (SIM viễn thông) thông thường của anh họ hoặc liên hệ phụ huynh của anh ấy để kiểm chứng độc lập.',
        isCorrect: true,
        feedback: 'Rất thông minh! Sử dụng một kênh liên lạc thứ hai độc lập (Out-of-band Verification) là biện pháp hữu hiệu nhất đánh bại mọi chiêu trò Deepfake mạo danh.'
      },
      {
        id: 'opt-3c',
        text: 'C. Nhắn tin hỏi một câu hỏi khó xem người bên kia có nhớ không.',
        isCorrect: false,
        feedback: 'Kẻ hack nick có thể đã đọc trộm toàn bộ lịch sử tin nhắn cũ nên hoàn toàn có thể trả lời được các câu hỏi cá nhân thông thường.'
      },
      {
        id: 'opt-3d',
        text: 'D. Chuyển trước một nửa số tiền để anh giải quyết việc gấp.',
        isCorrect: false,
        feedback: 'Chuyển bất kỳ số tiền nào cũng đồng nghĩa với việc bạn đã mất trắng số tiền đó cho kẻ lừa đảo.'
      }
    ],
    expertTip: 'Khi nghi ngờ Deepfake: Yêu cầu người gọi quay đầu sang trái, phải hoặc đưa bàn tay vẫy trước mặt. Thuật toán AI hiện tại sẽ bị nhòe và vỡ hình ảnh rõ rệt ở viền khuôn mặt.',
    pointsReward: 60,
    isCompleted: false
  },
  {
    id: 'scen-4',
    title: 'Tình huống 4: Thông Báo Vi Phạm Bản Quyền Từ "Đội Ngũ Hỗ Trợ Meta"',
    category: 'imposter',
    categoryLabel: 'Giả mạo tổ chức uy tín',
    urgencyLevel: 'Cảnh báo đỏ',
    questionType: 'quick_reflex_judgment',
    description: 'Một email/tin nhắn gửi đến quản trị viên Fanpage của câu lạc bộ trường học thông báo sắp bị khóa tài khoản.',
    simulatedMessage: {
      senderName: 'Meta Support Team Community',
      senderHandle: 'notice-copyright@support-meta24h.cc',
      senderAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
      timeAgo: '20 phút trước',
      platform: 'Email',
      messageText: 'CẢNH BÁO VI PHẠM: Fanpage của bạn đã vi phạm nghiêm trọng bản quyền thương hiệu và quyền sở hữu trí tuệ. Trang sẽ bị vô hiệu hóa vĩnh viễn trong vòng 24 giờ tới. Để bảo vệ trang và hủy lệnh khóa, vui lòng xác minh quyền sở hữu tại: http://meta-policy-support24h.cc/appeal',
      metadataTag: '⛔ Đường link tên miền phụ lạ'
    },
    question: 'Hãy đưa ra phán đoán phản xạ nhanh: Đường dẫn trong thông báo trên là An toàn hay Độc hại?',
    quickReflexData: {
      targetSnippet: 'http://meta-policy-support24h.cc/appeal',
      correctVerdict: 'MALICIOUS',
      maliciousLabel: '🔴 ĐỘC HẠI / LỪA ĐẢO PHISHING',
      safeLabel: '🟢 AN TOÀN / CHÍNH THỐNG TỪ META',
      explanation: 'Hoàn toàn chính xác! Tên miền chính thức của Meta là "meta.com" hoặc "facebook.com". Tên miền trong tin nhắn có đuôi lạ ".cc" và tiền tố mạo danh "support-meta24h". Đây là trang bẫy câu mật khẩu (Phishing) nhằm đánh cắp Fanpage.'
    },
    expertTip: 'Luôn nhìn vào gốc tên miền (Domain Name) ngay trước dấu gạch chéo đầu tiên: Kẻ lừa đảo thường dùng các từ khóa như "meta", "facebook" làm tiền tố để lừa mắt người đọc.',
    pointsReward: 50,
    isCompleted: false
  },
  {
    id: 'scen-5',
    title: 'Tình huống 5: Đề Thi THPT Quốc Gia "Lộ Sớm 99%" Trên Telegram',
    category: 'breaking_news',
    categoryLabel: 'Tin đồn kích động học đường',
    urgencyLevel: 'Khẩn cấp',
    questionType: 'single_choice',
    description: 'Trước kỳ thi quan trọng 1 ngày, trong các hội nhóm học sinh lan truyền một tệp hình ảnh được cho là đề thi chính thức bị rò rỉ.',
    simulatedMessage: {
      senderName: 'Cộng Đồng 2k8 Ôn Thi Cấp Tốc',
      senderHandle: '@onthi_thpt_secret',
      senderAvatar: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=200&q=80',
      timeAgo: '30 phút trước',
      platform: 'Telegram',
      messageText: 'Nguồn nội bộ cực kỳ uy tín vừa tuồn ra đề thi chính thức sáng mai! Tỷ lệ trúng 99%, các bạn share gấp cho bạn bè cùng lớp để kịp học thuộc đáp án trước khi bị ban quản trị xóa bài!',
      mediaType: 'image',
      mediaUrl: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=600&q=80',
      metadataTag: '🔥 15.000 Lượt xem trong nhóm'
    },
    question: 'Hành động đúng đắn và chuẩn mực pháp luật nhất của học sinh trong tình huống này là gì?',
    options: [
      {
        id: 'opt-5a',
        text: 'A. Tải về và chia sẻ ngay vào nhóm lớp để cả lớp cùng ôn thi theo đề này.',
        isCorrect: false,
        feedback: 'Hành vi phát tán thông tin giả mạo về kỳ thi quốc gia có thể bị cơ quan an ninh truy cứu trách nhiệm hình sự theo Luật An ninh mạng.'
      },
      {
        id: 'opt-5b',
        text: 'B. Bỏ qua tin đồn thất thiệt, giữ tâm lý vững vàng, tập trung ôn luyện theo kiến thức chuẩn của thầy cô và Bộ GD&ĐT.',
        isCorrect: true,
        feedback: 'Xuất sắc! Quy trình bảo mật đề thi quốc gia là bí mật nhà nước cấp độ tối mật. Các "đề lộ sớm" trên mạng 100% là chiêu trò câu view hoặc lừa đảo bán tài liệu giả.'
      },
      {
        id: 'opt-5c',
        text: 'C. Nhắn tin cho chủ kênh Telegram chuyển tiền mua bản có đáp án chi tiết.',
        isCorrect: false,
        feedback: 'Đây là cái bẫy để lừa tiền học sinh nhẹ dạ cả tin ngay trước ngày thi.'
      },
      {
        id: 'opt-5d',
        text: 'D. In ra hàng loạt đem đến phòng thi để so sánh đối chiếu.',
        isCorrect: false,
        feedback: 'Mang tài liệu lạ vào phòng thi sẽ bị đình chỉ thi ngay lập tức theo quy chế thi.'
      }
    ],
    expertTip: 'Đề thi quốc gia được bảo vệ bởi công an và hệ thống cách ly tuyệt đối. Bất kỳ thông tin "lộ đề" nào trên mạng xã hội đều là tin giả vi phạm pháp luật.',
    pointsReward: 50,
    isCompleted: false
  },
  {
    id: 'scen-6',
    title: 'Tình huống 6: Chiêu Trò "Dán Đè Mã QR Độc" Tại Quầy Trà Sữa',
    category: 'qr_tampering',
    categoryLabel: 'Mã QR giả mạo',
    urgencyLevel: 'Đánh lừa',
    questionType: 'quick_reflex_judgment',
    description: 'Bạn vào quán trà sữa giờ cao điểm và quét mã QR dán trên quầy để thanh toán 45.000đ.',
    simulatedMessage: {
      senderName: 'Ứng Dụng Ngân Hàng Số',
      senderHandle: 'Màn hình xác nhận giao dịch',
      senderAvatar: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=200&q=80',
      timeAgo: 'Vừa xong',
      platform: 'Zalo',
      messageText: 'Bạn vừa quét mã QR thanh toán tại quầy quán trà sữa "Gong Cha Phan Đình Phùng". Màn hình ứng dụng ngân hàng hiển thị thông tin người thụ hưởng: "Tên chủ tài khoản: NGUYEN VAN TAM - Ngân hàng: VCB - STK: 0987654321".',
      metadataTag: '⚠️ Tài khoản cá nhân lạ thay vì tên cửa hàng'
    },
    question: 'Hãy đưa ra phán đoán phản xạ nhanh: Mã QR bạn vừa quét là An toàn hay Độc hại?',
    quickReflexData: {
      targetSnippet: 'Tên người nhận tiền hiển thị: NGUYEN VAN TAM (Tài khoản cá nhân lạ)',
      correctVerdict: 'MALICIOUS',
      maliciousLabel: '🔴 ĐỘC HẠI / MÃ QR BỊ DÁN ĐÈ LỪA ĐẢO',
      safeLabel: '🟢 AN TOÀN / THANH TOÁN CHÍNH CHỦ',
      explanation: 'Rất chuẩn xác! Mã QR thanh toán chính thức tại các thương hiệu luôn có tên tài khoản là tên hộ kinh doanh hoặc công ty (ví dụ: CTY GONG CHA hoặc HKD GONG CHA). Kẻ gian đã lén dán đè mã QR tài khoản cá nhân lên quầy.'
    },
    expertTip: 'Trước khi nhập mã OTP hoặc xác nhận Face ID chuyển tiền, luôn nhìn dòng chữ "Tên người thụ hưởng" trên màn hình điện thoại xem có trùng khớp với tên cửa hàng hay không.',
    pointsReward: 60,
    isCompleted: false
  },
  {
    id: 'scen-7',
    title: 'Tình huống 7: Bẫy Làm Nhiệm Vụ Like TikTok Kiếm 500.000đ/Ngày',
    category: 'task_fraud',
    categoryLabel: 'Bẫy việc làm trực tuyến',
    urgencyLevel: 'Nguy hiểm',
    questionType: 'fill_in_the_blank',
    description: 'Một lời mời tuyển dụng hấp dẫn nhắn tin riêng cho bạn qua Telegram với công việc nhẹ nhàng không cần kinh nghiệm.',
    simulatedMessage: {
      senderName: 'Chuyên Viên Tuyển Dụng Shopee/TikTok',
      senderHandle: '@hr_tuyendung_vip247',
      senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      timeAgo: '15 phút trước',
      platform: 'Telegram',
      messageText: 'Chào bạn! Tập đoàn đang cần tuyển gấp 5 cộng tác viên xử lý đơn hàng và thả tim video TikTok tại nhà, lương 300k - 500k/ngày chuyển khoản sau 30 phút. Bạn chỉ cần vào nhóm nạp 200.000đ phí kích hoạt đơn hàng VIP là bắt đầu kiếm tiền ngay.',
      metadataTag: '💸 Yêu cầu nạp tiền để kiếm tiền'
    },
    question: 'Hãy điền hành vi bản chất của bẫy lừa đảo này vào ô trống:',
    fillBlankData: {
      prefixText: 'Dấu hiệu cốt lõi nhận biết mọi chiêu trò lừa đảo việc làm trực tuyến là yêu cầu ứng viên phải ',
      blankPlaceholder: 'Nhập hành vi (vd: nạp tiền...)',
      suffixText: ' trước để kích hoạt nhiệm vụ hoặc nạp tiền cọc làm đơn hàng ảo.',
      acceptableAnswers: ['nạp tiền', 'nap tien', 'đặt cọc', 'dat coc', 'nạp tiền cọc', 'nap tien coc', 'chuyển tiền', 'chuyen tien', 'nạp cọc', 'nap coc', 'nạp tiền trước', 'nap tien truoc'],
      hint: 'Hành động chuyển tiền/tiền vốn của chính bạn vào tài khoản kẻ lừa đảo.',
      explanation: 'Chính xác! Bất kỳ công việc nào yêu cầu ứng viên phải "nạp tiền trước", "chuyển cọc" hay "nạp vốn giật đơn" đều 100% là bẫy lừa đảo tài chính mô hình Ponzi.'
    },
    expertTip: 'Quy tắc tuyển dụng chân chính: Doanh nghiệp trả tiền cho sức lao động của bạn, không bao giờ bắt bạn phải đóng tiền cho doanh nghiệp để được làm việc.',
    pointsReward: 60,
    isCompleted: false
  },
  {
    id: 'scen-8',
    title: 'Tình huống 8: Cuộc Gọi Tự Xưng "Cán Bộ Điều Tra Công An Dọa Lệnh Bắt"',
    category: 'imposter',
    categoryLabel: 'Mạo danh cơ quan tư pháp',
    urgencyLevel: 'Cảnh báo đỏ',
    questionType: 'fill_in_the_blank',
    description: 'Một số điện thoại lạ gọi đến xưng là Thượng tá công an, thông báo bạn liên quan đến đường dây mua bán dữ liệu xuyên quốc gia.',
    simulatedMessage: {
      senderName: 'Số máy bàn lạ (+024 3825xxxx)',
      senderHandle: 'Người gọi: Cán bộ Điều tra viên',
      senderAvatar: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=200&q=80',
      timeAgo: '10 phút trước',
      platform: 'SMS',
      messageText: 'Tôi là cán bộ điều tra thuộc Cơ quan Cảnh sát điều tra Bộ Công an. Số điện thoại và CCCD của anh/chị đang đứng tên một tài khoản ngân hàng liên quan đến vụ án rửa tiền 50 tỷ đồng. Yêu cầu anh/chị giữ máy, không nói với người nhà và chuyển toàn bộ tiền vào tài khoản tạm giữ của ban chuyên án để giám định.',
      metadataTag: '⚖️ Đe dọa bắt giữ qua điện thoại'
    },
    question: 'Hãy điền hình thức làm việc chính thức của lực lượng Công an vào ô trống:',
    fillBlankData: {
      prefixText: 'Cơ quan Công an và Viện kiểm sát chỉ làm việc trực tiếp tại trụ sở thông qua ',
      blankPlaceholder: 'Nhập loại văn bản (vd: giấy triệu tập...)',
      suffixText: ' bằng văn bản có đóng dấu đỏ, tuyệt đối KHÔNG làm việc hoặc yêu cầu chuyển tiền qua điện thoại.',
      acceptableAnswers: ['giấy mời', 'giay moi', 'giấy triệu tập', 'giay trieu tap', 'văn bản', 'van ban', 'giấy mời hoặc giấy triệu tập', 'thư mời', 'thu moi'],
      hint: 'Văn bản giấy tờ chính thức có dấu mộc đỏ được gửi đến tận tay công dân qua công an địa phương.',
      explanation: 'Xuất sắc! Lực lượng Công an nhân dân Việt Nam không bao giờ làm việc qua điện thoại hay mạng xã hội và không có "tài khoản an toàn" nào để yêu cầu người dân nộp tiền thanh tra.'
    },
    expertTip: 'Khi gặp cuộc gọi tự xưng công an đe dọa: Hãy tắt máy ngay lập tức và đến thẳng trụ sở Công an phường/xã gần nhất để trình báo.',
    pointsReward: 70,
    isCompleted: false
  },
  {
    id: 'scen-9',
    title: 'Tình huống 9: Cấp Cứu 15 Phút Khi Bị Chiếm Đoạt Tài Khoản Mạng Xã Hội',
    category: 'account_takeover',
    categoryLabel: 'Xử lý sự cố bảo mật',
    urgencyLevel: 'Khẩn cấp',
    questionType: 'multi_select',
    description: 'Bạn bất ngờ bị đăng xuất khỏi tài khoản Facebook/Zalo và bạn bè gọi điện báo tin có người đang mượn tiền từ nick bạn.',
    simulatedMessage: {
      senderName: 'Thông Báo Bảo Mật Nền Tảng',
      senderHandle: 'Security Alert System',
      senderAvatar: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=200&q=80',
      timeAgo: '2 phút trước',
      platform: 'Facebook',
      messageText: 'Mật khẩu của bạn vừa được thay đổi từ một thiết bị lạ tại trình duyệt Chrome (Windows) ở địa chỉ IP 118.69.xxx.xxx. Phiên đăng nhập hiện tại trên điện thoại của bạn đã hết hạn. Kẻ xấu đang nhắn tin hàng loạt mượn tiền người thân.',
      metadataTag: '🚨 Nick bị hack và đang phát tán tin nhắn mượn tiền'
    },
    question: 'Hãy chọn TẤT CẢ các hành động ĐÚNG và CẤP BÁCH bạn cần làm ngay trong 15 phút đầu (Chọn 3 phương án đúng):',
    multiSelectData: {
      instruction: 'Đánh dấu chọn các bước ứng cứu sự cố đúng chuẩn:',
      minCorrectRequired: 3,
      items: [
        {
          id: 'ms-1',
          text: 'Lập tức gọi điện hoặc nhờ người thân đăng bài cảnh báo bạn bè: "Nick bị hack, tuyệt đối không chuyển tiền".',
          isCorrect: true,
          feedback: 'Hành động số 1 để chặn đứng nguy cơ người thân, bạn bè bị lừa mất tiền oan.'
        },
        {
          id: 'ms-2',
          text: 'Chuyển tiền vào số tài khoản kẻ hack yêu cầu để chuộc lại tài khoản.',
          isCorrect: false,
          feedback: 'Kẻ xấu sẽ lấy tiền và không bao giờ trả lại tài khoản cho bạn.'
        },
        {
          id: 'ms-3',
          text: 'Đổi ngay mật khẩu hòm thư email gốc liên kết với tài khoản và kích hoạt bảo mật 2 lớp (2FA).',
          isCorrect: true,
          feedback: 'Email là chìa khóa gốc. Giữ vững email sẽ giúp bạn lấy lại quyền kiểm soát mọi dịch vụ.'
        },
        {
          id: 'ms-4',
          text: 'Thuê các dịch vụ "hacker nhận lấy lại nick Facebook" trên mạng xã hội.',
          isCorrect: false,
          feedback: 'Các dịch vụ này đa phần là bẫy lừa đảo lần hai để chiếm đoạt thêm tiền cọc của nạn nhân.'
        },
        {
          id: 'ms-5',
          text: 'Truy cập trung tâm trợ giúp chính thức của nền tảng (facebook.com/hacked) để gửi yêu cầu khôi phục.',
          isCorrect: true,
          feedback: 'Đây là kênh hợp pháp và duy nhất an toàn để lấy lại tài khoản từ đội ngũ bảo mật nền tảng.'
        }
      ],
      explanation: 'Tuyệt đỉnh! Trong 15 phút đầu: Ưu tiên bảo vệ người thân khỏi bị lừa tiền, khóa chặt hòm thư email gốc và sử dụng kênh khôi phục chính thức của nền tảng.'
    },
    expertTip: 'Khái niệm "Giờ vàng an ninh": 30 phút đầu sau khi bị hack là thời điểm kẻ gian điên cuồng nhắn tin mượn tiền. Tốc độ cảnh báo là yếu tố quyết định.',
    pointsReward: 70,
    isCompleted: false
  },
  {
    id: 'scen-10',
    title: 'Tình huống 10: Tệp Tin "De_Cuong_On_Tap.pdf.exe" Trong Nhóm Lớp',
    category: 'ransomware',
    categoryLabel: 'Mã độc ngụy trang',
    urgencyLevel: 'Nguy hiểm',
    questionType: 'quick_reflex_judgment',
    description: 'Một tài khoản trong nhóm học tập gửi một tệp tin tài liệu kèm lời thúc giục tải về mở ra xem gấp.',
    simulatedMessage: {
      senderName: 'Nhóm Ôn Thi Học Kỳ 1',
      senderHandle: 'File đính kèm từ thành viên',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      timeAgo: '8 phút trước',
      platform: 'Zalo',
      messageText: 'Các bạn ơi, thầy bộ môn vừa gửi cho tớ đề cương ôn thi học kỳ mới nhất có sẵn đáp án chi tiết. Mọi người tải file về máy tính giải nén xem ngay kẻo thầy thu hồi nhé!',
      metadataTag: '📁 Tệp đính kèm: De_Cuong_On_Tap.pdf.exe (2.8 MB)'
    },
    question: 'Hãy đưa ra phán đoán phản xạ nhanh: Tệp tin đính kèm này là An toàn hay Độc hại?',
    quickReflexData: {
      targetSnippet: 'Tên tệp tin: De_Cuong_On_Tap.pdf.exe (Đuôi kép .pdf.exe)',
      correctVerdict: 'MALICIOUS',
      maliciousLabel: '🔴 ĐỘC HẠI / MÃ ĐỘC THỰC THI (TROJAN/RANSOMWARE)',
      safeLabel: '🟢 AN TOÀN / TÀI LIỆU PDF CHUẨN',
      explanation: 'Rất tinh tường! Kẻ xấu sử dụng thủ thuật đuôi kép (Double Extension): Nhìn bề ngoài có chữ .pdf nhưng đuôi thực sự ở cuối là ".exe" (tệp thực thi chương trình). Mở tệp này sẽ kích hoạt mã độc đánh cắp toàn bộ cookie và mật khẩu trình duyệt của bạn.'
    },
    expertTip: 'Luôn bật tính năng "File name extensions" trong Windows File Explorer để nhìn thấy chính xác đuôi file thực sự (.exe, .scr, .bat, .vbs).',
    pointsReward: 50,
    isCompleted: false
  },
  {
    id: 'scen-11',
    title: 'Tình huống 11: Trạm Wi-Fi "Free_QuanCafe_KhongMatKhau" Tại Điểm Hẹn',
    category: 'wifi_eavesdropping',
    categoryLabel: 'Wi-Fi công cộng độc hại',
    urgencyLevel: 'Đánh lừa',
    questionType: 'fill_in_the_blank',
    description: 'Bạn đang ngồi tại quán nước công cộng và cần đăng nhập tài khoản ngân hàng để chuyển tiền đóng học phí.',
    simulatedMessage: {
      senderName: 'Cài Đặt Wi-Fi Thiết Bị',
      senderHandle: 'Danh sách mạng không dây tìm thấy',
      senderAvatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=200&q=80',
      timeAgo: 'Vừa xong',
      platform: 'SMS',
      messageText: 'Danh sách mạng hiển thị: "Coffee_Shop_VIP (Bảo mật WPA2)" và "Coffee_Shop_Free_KhongMatKhau (Mạng mở, không có biểu tượng ổ khóa)". Bạn chuẩn bị mở app ngân hàng chuyển khoản.',
      metadataTag: '⚠️ Mạng không có mật khẩu bảo vệ'
    },
    question: 'Điền loại mạng di động cá nhân an toàn bạn nên bật thay thế vào ô trống:',
    fillBlankData: {
      prefixText: 'Khi cần chuyển tiền tại nơi công cộng, giải pháp an toàn nhất là tắt Wi-Fi mở và bật ',
      blankPlaceholder: 'Nhập mạng di động (vd: 4G/5G...)',
      suffixText: ' cá nhân để dữ liệu được mã hóa riêng biệt qua nhà mạng viễn thông.',
      acceptableAnswers: ['4G', '5G', '4G/5G', 'dữ liệu di động', 'du lieu di dong', 'mạng 4G', 'mang 4G', 'mạng 5G', 'mang 5G', 'mạng di động', 'mang di dong'],
      hint: 'Mạng dữ liệu di động tốc độ cao từ SIM điện thoại của các nhà mạng.',
      explanation: 'Chính xác! Mạng 4G/5G cá nhân truyền dẫn trên kênh sóng riêng biệt có mã hóa của nhà mạng, bảo vệ an toàn tuyệt đối trước các trạm Wi-Fi ma do tin tặc dựng lên để nghe lén gói tin.'
    },
    expertTip: 'Tuyệt đối không bao giờ đăng nhập tài khoản ngân hàng trên các mạng Wi-Fi công cộng mở không có mật khẩu.',
    pointsReward: 50,
    isCompleted: false
  },
  {
    id: 'scen-12',
    title: 'Tình huống 12: Bị Lập Nhóm Anti Ảo Tung Tin Đồn Bêu Rếu Sau Giờ Học',
    category: 'emotional_bait',
    categoryLabel: 'Bắt nạt mạng (Cyberbullying)',
    urgencyLevel: 'Cảnh báo đỏ',
    questionType: 'multi_select',
    description: 'Một tài khoản ẩn danh cắt ghép ảnh của bạn và lập nhóm bôi nhọ danh dự trên mạng xã hội.',
    simulatedMessage: {
      senderName: 'Nhóm "Bóc Phốt Học Đường"',
      senderHandle: 'Nhóm riêng tư • 2.4k thành viên',
      senderAvatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=200&q=80',
      timeAgo: '1 giờ trước',
      platform: 'Facebook',
      messageText: 'Hôm nay bóc phốt bạn H. lớp 11A! Nhìn mặt hiền lành mà nhân cách tệ hại, chuyên đi nói xấu bạn bè thầy cô. Đây là bằng chứng ảnh chụp tin nhắn chế và link trang cá nhân của nó, mọi người cùng vào ném đá tẩy chay nhé!',
      metadataTag: '⛔ Doxing và bắt nạt hội đồng'
    },
    question: 'Hãy chọn TẤT CẢ các hành vi ứng phó thông minh và chuẩn mực để tự bảo vệ bản thân (Chọn 3 phương án đúng):',
    multiSelectData: {
      instruction: 'Chọn các biện pháp phòng vệ văn minh và đúng luật:',
      minCorrectRequired: 3,
      items: [
        {
          id: 'cb-1',
          text: 'Chụp ảnh màn hình đầy đủ các bài viết, bình luận, kèm ngày giờ và đường link URL làm bằng chứng nguyên vẹn.',
          isCorrect: true,
          feedback: 'Bằng chứng nguyên trạng có giá trị pháp lý quan trọng khi làm việc với cơ quan chức năng.'
        },
        {
          id: 'cb-2',
          text: 'Lập tức tạo tài khoản clone vào chửi bới, đe dọa vũ lực đối thủ để trả đũa.',
          isCorrect: false,
          feedback: 'Trả đũa bằng bạo lực ngôn từ chỉ làm tình hình tồi tệ hơn và khiến bạn cũng trở thành người vi phạm pháp luật.'
        },
        {
          id: 'cb-3',
          text: 'Chia sẻ sự việc và nhờ sự hỗ trợ của giáo viên chủ nhiệm, ban giám hiệu và gia đình.',
          isCorrect: true,
          feedback: 'Người lớn có trách nhiệm và nhà trường là điểm tựa pháp lý vững chắc nhất để can thiệp kịp thời.'
        },
        {
          id: 'cb-4',
          text: 'Âm thầm chịu đựng, nghỉ học và tự cô lập bản thân.',
          isCorrect: false,
          feedback: 'Sự im lặng khiến kẻ bắt nạt càng lấn tới. Bạn không đơn độc, luôn có thầy cô và gia đình bảo vệ.'
        },
        {
          id: 'cb-5',
          text: 'Bấm Báo cáo (Report) hành vi quấy rối (Harassment/Bullying) lên ban quản trị nền tảng và chặn tương tác.',
          isCorrect: true,
          feedback: 'Cắt đứt luồng tiêu cực và kích hoạt thuật toán kiểm duyệt gỡ bài vi phạm của mạng xã hội.'
        }
      ],
      explanation: 'Rất chuẩn mực! Lưu giữ bằng chứng, báo cáo với nhà trường/gia đình và sử dụng công cụ report của nền tảng là cách giải quyết văn minh, dứt điểm hành vi bắt nạt mạng.'
    },
    expertTip: 'Bắt nạt mạng và Doxing là hành vi vi phạm Nghị định 15/2020/NĐ-CP và có thể bị xử lý hình sự. Bạn luôn có quyền được bảo vệ.',
    pointsReward: 70,
    isCompleted: false
  }
];
