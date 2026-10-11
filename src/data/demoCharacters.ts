import type { CharacterItem } from '../types/game';

// Exactly 9 verified characters configured with local assets and clean, high-impact hints
export const DEMO_CHARACTERS: CharacterItem[] = [
  // 3 NORMAL CHARACTERS
  {
    id: 'char-1',
    name: 'Marie Curie',
    difficulty: 'NORMAL',
    imageSrc: '/characters/marricurri.jfif',
    hints: [
      'Nghề nghiệp: Nhà vật lý & hóa học',
      'Quốc gia: Ba Lan & Pháp',
      'Phát hiện: Hiện tượng phóng xạ (Radium & Polonium)',
      'Thành tựu: Người đầu tiên giành 2 giải Nobel',
      'Dấu ấn: Nữ giáo sư đầu tiên tại Đại học Sorbonne'
    ],
    completed: false
  },
  {
    id: 'char-2',
    name: 'Mark Zuckerberg',
    difficulty: 'NORMAL',
    imageSrc: '/characters/mark.jfif',
    hints: [
      'Nghề nghiệp: Doanh nhân công nghệ',
      'Xuất thân: Sinh viên Đại học Harvard',
      'Sản phẩm: Mạng xã hội lớn nhất hành tinh',
      'Tập đoàn: Nhà sáng lập Meta (Facebook, Instagram)',
      'Phong cách: Áo phông xám & đam mê Metaverse'
    ],
    completed: false
  },
  {
    id: 'char-3',
    name: 'Leonardo da Vinci',
    difficulty: 'NORMAL',
    imageSrc: '/characters/davinci.jfif',
    hints: [
      'Thời đại: Thời kỳ Phục hưng Ý (Florence)',
      'Tài năng: Danh họa, nhà điêu khắc, nhà phát minh',
      'Bản vẽ: Người Vitruvius & cỗ máy bay',
      'Kiệt tác 1: Bức bích họa Bữa ăn tối cuối cùng',
      'Kiệt tác 2: Bức họa nàng Mona Lisa với nụ cười bí ẩn'
    ],
    completed: false
  },

  // 3 HARD CHARACTERS
  {
    id: 'char-4',
    name: 'Michael Jackson',
    difficulty: 'HARD',
    imageSrc: '/characters/jackson.jfif',
    hints: [
      'Profession: Singer, songwriter & dancer',
      'Country: United States (lead singer of the Jackson 5)',
      'Style: Single white rhinestone glove & fedora hat',
      'Choreography: Legendary Moonwalk dance & 45-degree lean',
      'Title: Universally crowned "King of Pop"'
    ],
    completed: false
  },
  {
    id: 'char-5',
    name: 'Warren Buffett',
    difficulty: 'HARD',
    imageSrc: '/characters/buffet.jfif',
    hints: [
      'Field: Value investing & business tycoon',
      'Hometown: Omaha, Nebraska, United States',
      'Conglomerate: Chairman & CEO of Berkshire Hathaway',
      'Lifestyle: Modest living & loves drinking Cherry Coke',
      'Moniker: Revered worldwide as the "Oracle of Omaha"'
    ],
    completed: false
  },
  {
    id: 'char-6',
    name: 'Jensen Huang',
    difficulty: 'HARD',
    imageSrc: '/characters/jensen huang.jfif',
    hints: [
      'Field: Electrical engineer & semiconductor executive',
      'Origin: Born in Tainan, Taiwan; studied at Stanford',
      'Signature Look: Trademark black leather biker jacket',
      'Company: Co-founder and CEO of NVIDIA (founded 1993)',
      'Legacy: GeForce GPUs & trillion-dollar AI revolution'
    ],
    completed: false
  },

  // 3 EXTREMELY HARD CHARACTERS
  {
    id: 'char-7',
    name: 'Lionel Messi',
    difficulty: 'EXTREME',
    imageSrc: '/characters/messi.jpg',
    hints: [
      'Môn thể thao: Bóng đá (Số áo 10 huyền thoại)',
      'Quốc gia: Đội trưởng đội tuyển Argentina',
      'Câu lạc bộ: Cống hiến hơn 2 thập kỷ cho FC Barcelona',
      'Kỷ lục: Cầu thủ sở hữu 8 Quả bóng Vàng (Ballon d\'Or)',
      'Đỉnh cao: Vô địch FIFA World Cup 2022 tại Qatar'
    ],
    completed: false
  },
  {
    id: 'char-8',
    name: 'Kylian Mbappé',
    difficulty: 'EXTREME',
    imageSrc: '/characters/mbape.jpg',
    hints: [
      'Môn thể thao: Cầu thủ bóng đá tiền đạo',
      'Quốc gia: Đội tuyển Pháp (sinh ra tại Bondy, Paris)',
      'Vũ khí: Tốc độ bứt phá kinh hoàng lên tới 38 km/h',
      'World Cup: Vô địch World Cup 2018 khi mới 19 tuổi',
      'Hiện tại: Tiền đạo ngôi sao của Real Madrid'
    ],
    completed: false
  },
  {
    id: 'char-9',
    name: 'Erling Haaland',
    difficulty: 'EXTREME',
    imageSrc: '/characters/haaland.jpg',
    hints: [
      'Môn thể thao: Tiền đạo cắm thể hình hộ pháp',
      'Quốc tịch: Đội tuyển quốc gia Na Uy',
      'Biệt danh: Cỗ máy ghi bàn "Kẻ hủy diệt" (Terminator)',
      'Ăn mừng: Dáng ngồi thiền Zen đặc trưng sau mỗi bàn thắng',
      'Kỷ lục: Vua phá lưới Ngoại hạng Anh & cú ăn ba với Manchester City'
    ],
    completed: false
  }
];
