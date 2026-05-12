const STOP_WORDS = new Set([
  'a', 'ai', 'anh', 'bac', 'bai', 'bi', 'bo', 'caa', 'cach', 'cai', 'can', 'cang', 'chi', 'chiec', 'cho', 'chung', 'co', 'con', 'cua', 'cung', 'cung', 'da', 'dang', 'de', 'den', 'di', 'do', 'duoc', 'gì', 'gi', 'gio', 'giu', 'goi', 'hai', 'hay', 'het', 'hi', 'hoi', 'hom', 'hon', 'khi', 'khien', 'khong', 'la', 'lai', 'lam', 'len', 'luc', 'ma', 'mau', 'minh', 'mot', 'muc', 'nao', 'nay', 'nen', 'neu', 'ngai', 'ngay', 'nguoi', 'nhat', 'nhieu', 'nhu', 'nhung', 'noi', 'nuoc', 'o', 'ong', 'qua', 'ra', 'rang', 'roi', 'ro', 'rõ', 'sao', 'sau', 'se', 'su', 'su', 'tai', 'the', 'thi', 'thoi', 'thu', 'toi', 'trong', 'tren', 'tu', 've', 'vi', 'voi', 'vua', 'vung', 'xa', 'xac', 'yeu', 'y', 'đã', 'đang', 'đâu', 'đây', 'đến', 'đi', 'điều', 'đó', 'được', 'để', 'ở', 'ông', 'tại', 'và', 'vì', 'với', 'vừa', 'ý'
])

function normalizeText(value = '') {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenize(value = '') {
  return normalizeText(value)
    .split(' ')
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token))
}

// Vietnamese synonym groups for paraphrase matching
const SYNONYM_GROUPS = [
  ['vi sao', 'tai sao', 'nguyen nhan', 'ly do'],
  ['bat dau', 'khoi dau', 'mo dau', 'khoi nguon'],
  ['ket thuc', 'cham dut', 'hoan thanh', 'ket cuc'],
  ['quan trong', 'y nghia', 'trong yeu', 'then chot'],
  ['anh huong', 'tac dong', 'chi phoi'],
  ['danh gia', 'nhan dinh', 'nhan xet', 'binh luan'],
  ['chien thang', 'thang loi', 'chien cong'],
  ['that bai', 'thua', 'that thu'],
  ['gian nan', 'kho khan', 'gian kho', 'cam go'],
  ['lanh dao', 'chi huy', 'cam dau', 'dung dau'],
  ['di san', 'cong lao', 'dong gop', 'de lai'],
  ['doi moi', 'cai cach', 'doi thay', 'thay doi'],
  ['y chi', 'quyet tam', 'tinh than', 'khi phach'],
  ['noi bat', 'dac sac', 'dac biet', 'khac biet'],
  ['nhan vat', 'con nguoi'],
  ['su kien', 'bien co', 'tran danh', 'chien dich'],
  ['cuoc doi', 'su nghiep', 'hanh trinh', 'doi minh'],
  ['doc lap', 'tu do', 'giai phong', 'chu quyen'],
  ['doi thu', 'ke thu', 'doi phuong', 'dich'],
  ['muu luoc', 'chien luoc', 'ke sach', 'sach luoc'],
  ['long dan', 'nhan tam', 'long nguoi'],
  ['the nao', 'nhu the nao', 'ra sao'],
]

const SYNONYM_MAP = new Map()
for (const group of SYNONYM_GROUPS) {
  for (const term of group) {
    SYNONYM_MAP.set(term, group)
  }
}

// Expand tokens with synonyms for paraphrase matching
function expandWithSynonyms(tokens) {
  const expanded = new Set(tokens)
  const normalized = tokens.join(' ')

  for (const [term, group] of SYNONYM_MAP) {
    if (normalized.includes(term)) {
      for (const syn of group) {
        for (const synToken of syn.split(' ')) {
          if (synToken.length > 1) expanded.add(synToken)
        }
      }
    }
  }

  return Array.from(expanded)
}

function diceCoefficient(left, right) {
  if (!left || !right) return 0
  if (left === right) return 1
  if (left.length < 2 || right.length < 2) return 0

  const leftBigrams = new Map()
  for (let i = 0; i < left.length - 1; i++) {
    const pair = left.slice(i, i + 2)
    leftBigrams.set(pair, (leftBigrams.get(pair) || 0) + 1)
  }

  let overlap = 0
  for (let i = 0; i < right.length - 1; i++) {
    const pair = right.slice(i, i + 2)
    const count = leftBigrams.get(pair) || 0
    if (count > 0) {
      leftBigrams.set(pair, count - 1)
      overlap += 1
    }
  }

  return (2 * overlap) / (left.length + right.length - 2)
}

function withMeta(entityId, perspective, entries) {
  return entries.map((entry, index) => ({
    id: `${entityId}-${perspective}-${index + 1}`,
    entityId,
    perspective,
    audioSrc: `/assets/audio/presets/${entityId}/${perspective}/${index + 1}.wav`,
    ...entry,
  }))
}

const presetCatalog = {
  'ho-chi-minh': {
    self: withMeta('ho-chi-minh', 'self', [
      {
        question: 'Bác đã bắt đầu hành trình tìm đường cứu nước như thế nào?',
        answer: `Năm 1911, tôi rời bến Nhà Rồng không phải để phiêu lưu, mà để tận mắt xem thế giới vận hành ra sao và vì sao dân mình mất nước. Tôi đi qua nhiều nước, làm nhiều nghề, sống giữa người lao động nghèo để hiểu rằng độc lập dân tộc không thể chỉ trông chờ vào lòng tốt của thực dân. Chính hành trình ấy đưa tôi đến với con đường cách mạng, nơi giải phóng dân tộc phải gắn với việc giải phóng con người.`
      },
      {
        question: 'Điều gì Bác luôn đặt lên hàng đầu khi nói về độc lập dân tộc?',
        answer: `Điều tôi đặt lên hàng đầu là quyền tự quyết của một dân tộc và phẩm giá của mỗi con người trong dân tộc ấy. Độc lập không chỉ là lá cờ hay bản tuyên ngôn, mà là để dân có cơm ăn, áo mặc, được học hành và sống như một người tự do. Nếu nước độc lập mà dân vẫn khổ, thì độc lập ấy chưa trọn nghĩa.`
      },
      {
        question: 'Bác muốn nhắn điều gì với thế hệ trẻ Việt Nam hôm nay?',
        answer: `Tôi mong lớp trẻ giữ lòng yêu nước nhưng đừng chỉ yêu bằng cảm xúc, mà phải yêu bằng năng lực, kỷ luật và tinh thần tự học. Thời nào cũng cần người trẻ biết nghĩ lớn nhưng bắt đầu từ việc nhỏ, làm việc gì cũng đến nơi đến chốn. Các cháu càng hiểu lịch sử sâu bao nhiêu thì càng có nền để đi xa bấy nhiêu.`
      },
    ]),
    contemporary: withMeta('ho-chi-minh', 'contemporary', [
      {
        question: 'Cuộc sống của người dân thay đổi ra sao trong thời Bác lãnh đạo?',
        answer: `Từ góc nhìn người dân, điều thay đổi rõ nhất là cảm giác mình không còn là kẻ sống cúi đầu trên chính đất nước mình nữa. Dĩ nhiên chiến tranh còn đó, thiếu thốn còn đó, nhưng người ta tin rằng những hi sinh ấy có mục tiêu và có ngày mai. Cái tên **Bác Hồ** khiến nhiều người thấy gần gũi, như có một điểm tựa tinh thần trong những năm tháng gian khó.`
      },
      {
        question: 'Người dân nhớ nhất điều gì ở Bác trong đời sống hằng ngày?',
        answer: `Người ta nhớ nhất ở Bác là sự giản dị và cách nói chuyện không làm ai thấy bị xa cách. Bác không cần vẻ uy nghi của một lãnh tụ để được kính trọng; chính lối sống mộc mạc và sự quan tâm đến dân thường khiến người ta quý. Với nhiều người, Bác hiện lên như một người lớn trong nhà, nghiêm mà ấm.`
      },
      {
        question: 'Khi nghe tin Bác mất năm 1969, mọi người đã đón nhận ra sao?',
        answer: `Tin ấy đến như một khoảng lặng rất lớn giữa chiến tranh. Nhiều người khóc thật, không phải chỉ vì mất một vị lãnh tụ, mà vì thấy như mất đi người đã đồng hành với cả một thời tuổi trẻ, hi sinh và niềm tin. Trong đau buồn vẫn có một ý nghĩ chung: phải đi tiếp con đường còn dang dở.`
      },
    ]),
    historian: withMeta('ho-chi-minh', 'historian', [
      {
        question: 'Hồ Chí Minh nên được đặt trong bối cảnh phong trào giải phóng dân tộc thế kỷ 20 như thế nào?',
        answer: `Trong lịch sử thế kỷ 20, **Hồ Chí Minh** là một trường hợp tiêu biểu của nhà cách mạng kết nối chủ nghĩa dân tộc chống thực dân với mạng lưới tư tưởng và tổ chức quốc tế. Ông không chỉ phản ứng với hoàn cảnh Việt Nam, mà còn đọc rất rõ quy luật tan rã của các đế quốc sau chiến tranh thế giới. Vì vậy, vai trò của ông cần được nhìn như một mắt xích quan trọng trong làn sóng phi thực dân hóa toàn cầu.`
      },
      {
        question: 'Những đánh giá khác nhau của sử học quốc tế về Hồ Chí Minh là gì?',
        answer: `Sử học quốc tế thường chia thành vài hướng chính: một hướng nhấn mạnh Hồ Chí Minh là biểu tượng giải phóng dân tộc, một hướng phân tích ông trong khung chiến tranh lạnh và chủ nghĩa cộng sản, còn hướng khác cố gắng dung hòa cả hai. Điểm đáng chú ý là càng về sau, nhiều nghiên cứu càng nhìn ông như một chính trị gia linh hoạt, biết kết hợp lý tưởng với thực tiễn. Tranh luận không nằm ở việc ông có ảnh hưởng hay không, mà ở cách diễn giải bản chất ảnh hưởng ấy.`
      },
      {
        question: 'Di sản lớn nhất của Hồ Chí Minh đối với Việt Nam hiện đại là gì?',
        answer: `Di sản lớn nhất của Hồ Chí Minh là khung tư tưởng và biểu tượng chính trị cho một Việt Nam độc lập, thống nhất và có chủ quyền. Ở tầng sâu hơn, ông để lại một mẫu hình kết nối chính danh chính trị với đạo đức công vụ, dù việc hiện thực hóa mẫu hình đó về sau là câu chuyện phức tạp. Nói ngắn gọn, ông không chỉ để lại một giai đoạn lịch sử, mà còn để lại một chuẩn tham chiếu cho ký ức quốc gia.`
      },
    ]),
  },
  'le-loi': {
    self: withMeta('le-loi', 'self', [
      {
        question: 'Những năm đầu khởi nghĩa Lam Sơn gian nan nhất ở điểm nào?',
        answer: `Gian nan nhất là lúc nghĩa quân còn ít người, ít lương, mà quân Minh thì mạnh hơn hẳn về binh lực lẫn thế kiểm soát. Có những khi ta phải rút sâu vào núi rừng, chịu đói rét và nhìn người theo mình ngã xuống từng người một. Nhưng chính quãng ấy mới thử xem ai thật lòng với đại nghĩa, ai chỉ theo khi thuận lợi.`
      },
      {
        question: 'Ngài đánh giá vai trò của Nguyễn Trãi trong đại sự ra sao?',
        answer: `Ức Trai là người giỏi chữ, giỏi mưu, lại hiểu rất rõ cái thế của thiên hạ. Nếu ta giữ được lòng người trong cảnh hiểm nghèo, thì ông ấy giúp nghĩa quân biến chính nghĩa thành lời lẽ và kế sách khiến đối phương cũng phải chùn tay. Lam Sơn không chỉ thắng bằng gươm giáo, mà còn thắng nhờ người biết nghĩ sâu như Nguyễn Trãi.`
      },
      {
        question: 'Sau khi giành được độc lập, điều gì khiến ngài trăn trở nhất?',
        answer: `Đánh giặc khó một, giữ nước yên lại khó mười. Sau khi giành độc lập, điều khiến ta trăn trở nhất là làm sao dựng lại trật tự, khôi phục sức dân và không để triều đình quên những năm gian khổ ban đầu. Một triều đại nếu chỉ biết hưởng thành quả mà không nhớ gốc của mình, sớm muộn cũng suy.`
      },
    ]),
    contemporary: withMeta('le-loi', 'contemporary', [
      {
        question: 'Chúa công Lê Lợi khác những người lãnh đạo khác ở điểm nào?',
        answer: `Điều khác nhất ở chúa công là ông hiểu người dân và biết chờ thời, chứ không chỉ dựa vào lòng dũng cảm. Có người gan, có người giỏi, nhưng hiếm ai vừa chịu khổ cùng quân sĩ, vừa giữ được ý lớn lâu đến vậy. Người theo chúa công không chỉ vì sợ uy, mà vì tin ông thật sự gánh việc nước.`
      },
      {
        question: 'Ông nhớ nhất giai đoạn nào khi cùng Lê Lợi dựng nghiệp Lam Sơn?',
        answer: `Tôi nhớ nhất quãng đầu ở Lam Sơn, khi mọi thứ đều thiếu mà lòng người vẫn chưa hề rời. Những ngày ấy mới thấy chúa công là người thế nào: lúc nguy vẫn cứng, lúc thua vẫn không nản. Về sau thắng lớn ai cũng thấy, còn cái cốt cách của ông thì lộ rõ nhất trong những năm chưa ai dám chắc sẽ thắng.`
      },
      {
        question: 'Giữa tài cầm quân và lòng người, theo ông đâu là điểm mạnh lớn nhất của Lê Lợi?',
        answer: `Nếu phải chọn một điều, tôi cho rằng đó là lòng người. Tài cầm quân của chúa công là thật, nhưng nếu không quy tụ được nhân tâm thì nghĩa quân khó lòng đi suốt chặng đường dài như vậy. Người ta sẵn sàng chịu thiếu chịu khổ vì tin ông đánh giặc không phải để tranh quyền riêng cho mình.`
      },
    ]),
    historian: withMeta('le-loi', 'historian', [
      {
        question: 'Lê Lợi nên được đánh giá thế nào trong lịch sử Đông Nam Á thế kỷ 15?',
        answer: `Trong bối cảnh Đông Nam Á thế kỷ 15, **Lê Lợi** là một nhà kiến quốc nổi bật vì đã chuyển một cuộc khởi nghĩa kéo dài thành nền tảng cho một vương triều ổn định. Thành công của ông không chỉ nằm ở chiến thắng quân sự trước Minh, mà còn ở khả năng tái lập chính danh cho một nhà nước bản địa. Đó là điểm khiến ông vượt khỏi khuôn khổ một thủ lĩnh kháng chiến thuần túy.`
      },
      {
        question: 'Phần lịch sử và phần huyền thoại quanh Lê Lợi cần tách bạch ra sao?',
        answer: `Cần tách rõ **huyền thoại chính trị** như chuyện gươm thần Thuận Thiên khỏi chuỗi sự kiện quân sự, ngoại giao và tổ chức lực lượng có thể kiểm chứng qua sử liệu. Tuy vậy, huyền thoại không vô nghĩa; nó cho thấy cách triều đại mới xây dựng tính chính danh sau chiến thắng. Nói cách khác, phần huyền thoại không thay thế lịch sử, nhưng là một phần của lịch sử ký ức.`
      },
      {
        question: 'Những tranh luận lớn nhất về di sản chính trị của Lê Lợi là gì?',
        answer: `Tranh luận lớn nhất xoay quanh việc liệu Lê Lợi chủ yếu là nhà giải phóng dân tộc hay còn là người đặt nền cho một trật tự quân chủ tập quyền mới. Một số nhà nghiên cứu nhấn mạnh tính thực dụng và khả năng dùng người của ông; số khác chú ý hơn đến những giới hạn sau khi vương triều ổn định. Vì vậy, di sản của ông thường được nhìn trong thế vừa anh hùng kiến quốc, vừa người mở đầu cho những bài toán quyền lực hậu chiến.`
      },
    ]),
  },
  'nguyen-trai': {
    self: withMeta('nguyen-trai', 'self', [
      {
        question: 'Ngài nhìn lại đời mình như một người làm chính trị, làm thơ hay làm quân sư?',
        answer: `Nếu phải tự nói, ta là kẻ dùng chữ nghĩa để gánh việc đời. Làm thơ là chỗ lòng người tìm về, làm quân sư là chỗ trí phải căng ra giữa cơn loạn, còn chính trị là nơi cả tài lẫn mệnh đều bị thử thách. Ba điều ấy ở ta chưa từng tách rời nhau.`
      },
      {
        question: 'Điều gì ở khởi nghĩa Lam Sơn khiến ngài tin có thể giành lại độc lập?',
        answer: `Ta tin vì thấy ở Lam Sơn không chỉ có sự phẫn uất trước giặc Minh, mà còn có một hạt nhân biết gom lòng người quanh chính nghĩa. Chúa công Lê Lợi hiểu dân, biết nhẫn lúc yếu và quyết lúc cần, ấy là cái thế hiếm có. Khi chính nghĩa gặp đúng người cầm đầu, việc lớn tuy chậm nhưng không vô vọng.`
      },
      {
        question: 'Ngài muốn hậu thế hiểu đúng điều gì về bi kịch Lệ Chi Viên?',
        answer: `Điều ta mong hậu thế hiểu là một bi kịch lớn không chỉ hủy hoại một nhà mà còn phơi bày sự mong manh của công lý nơi triều chính. Đừng chỉ nhìn Lệ Chi Viên như câu chuyện oan khuất riêng của Nguyễn Trãi, mà hãy nhìn nó như vết rạn giữa công lao, quyền lực và lòng nghi kỵ. Nỗi đau ấy, nói cho cùng, là nỗi đau của cả một thời.`
      },
    ]),
    contemporary: withMeta('nguyen-trai', 'contemporary', [
      {
        question: 'Theo chúa công, Nguyễn Trãi giúp đại nghiệp Lam Sơn ở điểm nào lớn nhất?',
        answer: `Ức Trai giúp ở chỗ biến cái chí của nghĩa quân thành mưu lược có đường đi nước bước. Ông ấy không chỉ viết hay, mà còn khiến đối phương hiểu rằng theo giặc thì mất nghĩa, còn thuận thời thì còn đường lui. Ta cầm quân ngoài trận, còn nhiều phen ông ấy mở lối thắng ngay trên bàn giấy.`
      },
      {
        question: 'Giữa Nguyễn Trãi và các võ tướng, ông ấy khác biệt ra sao?',
        answer: `Các võ tướng thường nhìn trận địa trước mắt, còn Nguyễn Trãi nhìn cả cục diện xa hơn. Ông ấy dùng lời lẽ, đạo lý và cái hiểu về lòng người để đánh vào chỗ mềm của đối phương. Bởi vậy, khác biệt lớn nhất là ông ấy cầm bút nhưng sức nặng không hề kém một đạo quân.`
      },
      {
        question: 'Nguyễn Trãi là người đáng trọng ở tài mưu lược, văn chương hay khí tiết?',
        answer: `Khó tách rời ba điều ấy ở Nguyễn Trãi. Văn chương cho thấy tâm hồn và tầm nhìn của ông, mưu lược giúp đại sự thành công, còn khí tiết khiến hậu thế còn nhắc mãi sau khi mọi cuộc tranh công đã lắng xuống. Nếu phải nói gọn, cái đáng trọng nhất là ông giữ được cốt cách của mình giữa vòng xoáy quyền lực.`
      },
    ]),
    historian: withMeta('nguyen-trai', 'historian', [
      {
        question: 'Nguyễn Trãi nên được đọc như một chính trị gia hay một nhà tư tưởng lớn?',
        answer: `Nguyễn Trãi nên được đọc như một nhân vật giao thoa giữa tư tưởng và hành động chính trị. Nếu chỉ xem ông là nhà thơ hay nhà tư tưởng, ta sẽ bỏ lỡ vai trò của ông trong việc hình thành ngôn ngữ chính danh cho nhà Lê sơ. Ngược lại, nếu chỉ xem ông là chính trị gia, ta sẽ không thấy chiều sâu đạo lý khiến tư tưởng của ông sống lâu hơn thời đại mình.`
      },
      {
        question: 'Giới sử học hiện nay tranh luận những gì về vụ án Lệ Chi Viên?',
        answer: `Tranh luận chủ yếu xoay quanh mức độ can dự của các phe quyền lực trong triều, độ tin cậy của sử liệu về cái chết của vua Lê Thái Tông, và cách hậu thế kiến tạo hình tượng Nguyễn Trãi như biểu tượng oan khuất. Nhiều học giả thận trọng vì tư liệu vừa ít vừa bị lọc qua các lớp biên soạn chính trị. Do đó, điểm chắc chắn nhất là tính chất bi kịch của vụ án, còn cơ chế cụ thể dẫn tới nó vẫn còn khoảng trống.`
      },
      {
        question: 'Tầm vóc Nguyễn Trãi trong lịch sử tư tưởng Việt Nam nằm ở đâu?',
        answer: `Tầm vóc của Nguyễn Trãi nằm ở chỗ ông kết hợp được tư tưởng nhân nghĩa với thực tiễn dựng nước và giữ nước. Ông không bàn đạo lý như một học giả đứng ngoài cuộc, mà đưa nó vào chiến lược chính trị và ngôn ngữ quốc gia. Vì vậy, vị trí của ông trong lịch sử tư tưởng Việt Nam là một trong những điểm cao hiếm hoi nơi văn chương, đạo lý và quyền lực gặp nhau.`
      },
    ]),
  },
  'tran-hung-dao': {
    self: withMeta('tran-hung-dao', 'self', [
      {
        question: 'Ngài chuẩn bị tinh thần tướng sĩ thế nào trước một đối thủ mạnh như quân Nguyên?',
        answer: `Ta hiểu muốn thắng quân Nguyên thì trước hết phải thắng nỗi sợ trong lòng quân mình. Tướng sĩ cần biết vì sao phải đánh, đánh cho ai, và nếu lùi thì non sông sẽ ra sao. Bởi vậy, ta nói với họ không chỉ bằng mệnh lệnh, mà bằng danh dự và trách nhiệm của kẻ làm trai trước vận nước.`
      },
      {
        question: 'Trận Bạch Đằng là kết quả của mưu lược hay của thế trận lòng dân nhiều hơn?',
        answer: `Mưu lược là cái khung, còn lòng dân là cái nền. Nếu không có dân góp sức giữ thế trận, chở quân, giữ đường, giấu lương, thì mưu sâu đến đâu cũng khó thành ở một trận lớn như **Bạch Đằng**. Ta vẫn nói: dùng binh giỏi không thể tách khỏi lòng người.`
      },
      {
        question: 'Điều gì ngài coi là cốt lõi của nghệ thuật giữ nước?',
        answer: `Cốt lõi là biết mình, biết người và biết giữ cho lòng dân không rời triều đình. Kẻ mạnh chưa chắc thắng nếu chủ quan, còn kẻ yếu chưa chắc thua nếu biết dùng thời, dùng địa và dùng người. Giữ nước không chỉ là chuyện ngoài biên ải, mà là chuyện giữ cho trong nước còn cùng một ý chí.`
      },
    ]),
    contemporary: withMeta('tran-hung-dao', 'contemporary', [
      {
        question: 'Điều gì khiến Quốc công được tướng sĩ một lòng tin phục như vậy?',
        answer: `Đức ông được tin phục vì nói điều gì cũng gắn với việc làm của chính mình. Ông không đứng xa ra lệnh, mà chịu cùng nỗi lo với tướng sĩ, hiểu từng bước lùi tiến và không bao giờ xem quân lính là vật để dùng rồi bỏ. Người ta theo ông không chỉ vì uy, mà vì thấy ông thật lòng lo cho xã tắc và cho cả người dưới quyền.`
      },
      {
        question: 'Trong triều đình nhà Trần, Đức ông là người thế nào khi không ở giữa chiến trận?',
        answer: `Ngoài chiến trận thì uy nghi, còn trong đời thường Đức ông trầm tĩnh và nghĩ rất sâu. Có lúc ông ít nói đến mức người ngoài tưởng lạnh, nhưng ai hầu cận đều biết ông cân nhắc từng việc lớn nhỏ rất kỹ. Chính sự điềm đạm ấy khiến khi ra quyết định, người khác càng nể phục.`
      },
      {
        question: 'Ông nhớ nhất khoảnh khắc nào trước khi quân Nguyên bị đánh bại?',
        answer: `Tôi nhớ nhất là lúc mọi thứ như đang nén lại trước giờ vỡ tung, khi ai cũng hiểu thế trận đã dồn địch vào chỗ chết nhưng chưa ai dám mừng sớm. Không khí trên sông như đặc lại, căng đến nghẹt thở. Khi cục diện thật sự đổi chiều, cảm giác không chỉ là vui mà là nhẹ đi một gánh rất lớn cho cả nước.`
      },
    ]),
    historian: withMeta('tran-hung-dao', 'historian', [
      {
        question: 'Trần Hưng Đạo nên được đặt trong tương quan với các danh tướng chống Mông Cổ cùng thời ra sao?',
        answer: `Nếu đặt trong tương quan thế giới thế kỷ 13, **Trần Hưng Đạo** là một trong số rất ít danh tướng đã đánh bại hiệu quả cỗ máy quân sự Mông Cổ bằng chiến lược thích ứng địa phương. Ông không thắng nhờ lực lượng áp đảo, mà nhờ khả năng phối hợp chiến tranh tiêu hao, thủy chiến và tâm lý chiến. Chính điểm ấy khiến ông đứng ngang hàng với những trường hợp chống Mông Cổ thành công nhất cùng thời.`
      },
      {
        question: 'Bài học quân sự lớn nhất từ Trần Hưng Đạo là gì?',
        answer: `Bài học lớn nhất là không đối đầu với đối thủ mạnh hơn trên đúng sở trường của họ. Trần Hưng Đạo chủ động kéo giãn chiến tranh, bẻ gãy hậu cần, chờ thời cơ và dùng địa hình sông nước để xoay chuyển tương quan lực lượng. Đó là tư duy chiến lược hiện đại theo nghĩa rất sâu: thắng bằng thiết kế cục diện, không chỉ bằng một trận đánh đẹp.`
      },
      {
        question: 'Giữa huyền thoại và sử thực, hình tượng Trần Hưng Đạo đã được kiến tạo như thế nào?',
        answer: `Hình tượng Trần Hưng Đạo được kiến tạo trên hai lớp: lớp sử thực của một tổng chỉ huy kiệt xuất và lớp ký ức văn hóa, tín ngưỡng của một vị thánh bảo quốc. Về sau, hai lớp này quấn lấy nhau, khiến ranh giới giữa nhân vật lịch sử và biểu tượng tinh thần ngày càng mờ hơn. Nghiên cứu hiện đại không cần phá bỏ huyền thoại, nhưng phải nhận ra nó vận hành như một phần của lịch sử ký ức.`
      },
    ]),
  },
  'ly-thuong-kiet': {
    self: withMeta('ly-thuong-kiet', 'self', [
      {
        question: 'Vì sao ngài chọn đánh trước để giữ nước trong chiến tranh với nhà Tống?',
        answer: `Ta đánh trước không phải vì hiếu chiến, mà vì thấy rõ nếu ngồi chờ thì giặc sẽ chọn thời và chọn thế có lợi cho chúng. Khi đối phương đã chuẩn bị xong mà mình còn chần chừ, ấy là tự trói tay mình trước trận. Đánh phủ đầu là để giành thế chủ động, dùng một đòn sắc mà giảm cái họa lâu dài cho nước nhà.`
      },
      {
        question: 'Phòng tuyến Như Nguyệt được xây dựng với tư duy quân sự như thế nào?',
        answer: `Phòng tuyến Như Nguyệt không chỉ là bờ lũy đất hay thế sông, mà là cách ta buộc quân Tống phải đánh theo ý của Đại Việt. Ta chọn nơi có thể hạn chế ưu thế đông quân, kéo dài sức họ và giữ cho quân mình có thế xoay trở. Nói gọn, đó là chỗ biến địa thế thành đồng minh của quân ta.`
      },
      {
        question: 'Ngài nghĩ gì về việc hậu thế gắn Nam quốc sơn hà với tên tuổi của mình?',
        answer: `Ngươi hỏi chuyện ấy, ta chỉ nói rằng một bài thơ nếu có sức nâng lòng quân thì nó đã làm tròn việc của mình rồi. Hậu thế gắn nó với tên ta hay không, điều quan trọng hơn là tinh thần giữ nước mà bài thơ khơi dậy. Danh tiếng của một người không nên đứng cao hơn ý chí của cả một dân tộc.`
      },
    ]),
    contemporary: withMeta('ly-thuong-kiet', 'contemporary', [
      {
        question: 'Điều gì khiến triều đình đặt trọn niềm tin vào Thái úy Lý Thường Kiệt?',
        answer: `Thái úy khiến người ta tin không chỉ vì tài cầm quân, mà vì ông nhìn việc lớn rất quyết mà không hấp tấp. Trong những ngày nguy cấp, ông nói ít nhưng lời nào cũng trúng việc, làm người trong triều thấy vững lòng. Niềm tin ấy đến từ một người dám gánh trách nhiệm chứ không chỉ giỏi bàn mưu.`
      },
      {
        question: 'Những ngày giữ phòng tuyến Như Nguyệt căng thẳng ra sao?',
        answer: `Căng đến mức ngày đêm đều như bị kéo căng một sợi dây chưa biết khi nào đứt. Quân Tống đông và lì, còn bên ta phải giữ từng nhịp, từng thế cho khỏi sơ hở. Nhưng lạ là càng căng, người ta càng thấy rõ bản lĩnh của Thái úy, vì ông không để sự lo lắng lan thành rối loạn.`
      },
      {
        question: 'Bài thơ Nam quốc sơn hà tác động tới quân sĩ như thế nào khi ông trực tiếp chứng kiến?',
        answer: `Nghe giữa đêm ở phòng tuyến, bài thơ như làm khí sắc cả doanh trại đổi khác. Nó không chỉ là mấy câu chữ, mà như một lời khẳng định rằng mình đang đứng đúng phía của trời đất và của non sông. Người lính đang mệt cũng thẳng lưng hơn, kẻ đang lo cũng bớt run hơn.`
      },
    ]),
    historian: withMeta('ly-thuong-kiet', 'historian', [
      {
        question: 'Chiến lược tiên phát chế nhân của Lý Thường Kiệt nên được đánh giá ra sao?',
        answer: `Đây là một lựa chọn chiến lược rất hiện đại nếu đặt trong bối cảnh thế kỷ 11: đánh trước để phá quá trình tích tụ lực lượng của đối phương, chứ không đơn thuần để mở rộng chiến tranh. **Lý Thường Kiệt** hiểu rằng Đại Việt khó thắng nếu để nhà Tống hoàn tất thế trận xâm lược. Vì vậy, tiên phát chế nhân cần được đọc như một tính toán phòng vệ chủ động hơn là một hành vi phiêu lưu quân sự.`
      },
      {
        question: 'Những tranh luận học thuật lớn quanh Nam quốc sơn hà là gì?',
        answer: `Tranh luận lớn xoay quanh tác giả thực sự của bài thơ, hoàn cảnh xuất hiện cụ thể và mức độ can dự của các lớp biên soạn hậu thế vào văn bản hiện còn. Một số học giả chú ý nhiều hơn tới chức năng chính trị - tinh thần của bài thơ thay vì truy tìm tuyệt đối nguồn gốc nguyên thủy. Nói cách khác, đây vừa là vấn đề văn bản học, vừa là vấn đề lịch sử ký ức quốc gia.`
      },
      {
        question: 'Lý Thường Kiệt đã ảnh hưởng thế nào đến tư duy quân sự Việt Nam về sau?',
        answer: `Ảnh hưởng lớn nhất của Lý Thường Kiệt là cho thấy một quốc gia nhỏ vẫn có thể chủ động thiết kế thế trận trước đối thủ lớn hơn nhiều lần. Từ ông, truyền thống quân sự Việt Nam có thêm một mẫu hình rõ rệt: kết hợp đòn phủ đầu có tính toán với phòng thủ chiều sâu dựa vào địa hình. Tư duy ấy vọng lại trong nhiều cuộc chiến về sau, dù hình thức luôn thay đổi theo thời đại.`
      },
    ]),
  },
  'nguyen-hue': {
    self: withMeta('nguyen-hue', 'self', [
      {
        question: 'Điều gì giúp ngài đưa ra những quyết định thần tốc mà vẫn chính xác?',
        answer: `Ta quyết nhanh vì trước đó đã nghĩ rất lâu về thế trận, về người và về đường đi. Đến lúc thời cơ ló ra mà còn do dự, thì cơ hội sẽ biến thành họa. Nhanh không phải vì nóng vội; nhanh là vì đã thấy rõ mình phải đánh vào đâu để đối phương không kịp thở.`
      },
      {
        question: 'Ngài nhớ nhất khoảnh khắc nào trong chiến dịch đánh quân Thanh năm 1789?',
        answer: `Ta nhớ nhất là lúc khí thế ba quân lên đến đỉnh, khi từng mũi tiến công đều ăn khớp và quân Thanh bắt đầu rối loạn thật sự. Trong khoảnh khắc ấy, ta biết trận này không chỉ là một chiến thắng quân sự, mà còn là lời đáp cho cả nước trước nỗi nhục ngoại xâm. Có những trận đánh thắng rồi mới mừng, còn trận ấy là vừa đánh vừa thấy vận nước đổi chiều.`
      },
      {
        question: 'Nếu có thêm thời gian, ngài muốn hoàn thành cải cách nào trước nhất?',
        answer: `Nếu trời cho thêm thời gian, ta muốn đẩy mạnh việc chấn chỉnh triều chính, học hành và phép dùng người cho thật vững. Đánh giặc giỏi mà không kịp dựng nền trị nước lâu dài thì vẫn là việc chưa trọn. Ta từng nghĩ nhiều đến một nước mạnh không chỉ ở trận tiền, mà còn ở kỷ cương và trí lực.`
      },
    ]),
    contemporary: withMeta('nguyen-hue', 'contemporary', [
      {
        question: 'Theo Ngô Thì Nhậm, Quang Trung hơn người ở khí phách hay tầm nhìn?',
        answer: `Nếu chỉ nói khí phách thì chưa đủ, vì người hào hùng trong thời loạn không hiếm. Điều đáng nể ở **Quang Trung** là khí phách ấy luôn đi cùng một tầm nhìn rất tỉnh, rất thực tế về thời cơ và việc trị nước. Ông khiến người khác có cảm giác quyết định nào cũng như được chém ra từ một ý chí đã cân xong mọi mặt.`
      },
      {
        question: 'Không khí triều Tây Sơn trước khi xuất quân ra Bắc ra sao?',
        answer: `Không khí khi ấy khẩn trương đến nghẹt thở, nhưng không phải thứ rối loạn của kẻ bị dồn ép. Mọi người đều cảm nhận được ông quyết rất nhanh và kéo cả triều đình vào cùng một nhịp. Điều lạ là trong sự gấp gáp ấy vẫn có niềm tin, vì ai cũng thấy người cầm đầu hiểu rõ mình đang làm gì.`
      },
      {
        question: 'Sau chiến thắng, Quang Trung xử lý bang giao với nhà Thanh như thế nào?',
        answer: `Sau chiến thắng, ông không chỉ nghĩ đến vinh quang chiến trận mà lập tức xoay sang việc ổn định cục diện với nhà Thanh. Ở đây mới thấy chỗ sâu của ông: đánh rất cứng, nhưng xếp lại thế cờ thì tỉnh và linh hoạt. Một người chỉ biết thắng trận chưa chắc làm được điều ấy.`
      },
    ]),
    historian: withMeta('nguyen-hue', 'historian', [
      {
        question: 'Quang Trung nên được nhìn nhận ra sao trong bối cảnh Đông Nam Á cuối thế kỷ 18?',
        answer: `Trong bối cảnh Đông Nam Á cuối thế kỷ 18, **Quang Trung** là một hiện tượng hiếm: một nhà quân sự kiệt xuất đồng thời mang tham vọng cải cách nhà nước. Ông nổi bật không chỉ vì chiến thắng Ngọc Hồi - Đống Đa, mà còn vì tốc độ tái cấu trúc quyền lực trong một thời đại phân tranh dữ dội. Nếu sống lâu hơn, vị trí khu vực của ông có thể còn được đánh giá cao hơn nữa.`
      },
      {
        question: 'Những giả thuyết lớn nhất xoay quanh việc Quang Trung mất sớm là gì?',
        answer: `Các giả thuyết xoay quanh bệnh tật, kiệt sức do cường độ điều hành và chiến tranh, thậm chí có cả suy đoán về yếu tố chính trị, nhưng bằng chứng trực tiếp đều khá hạn chế. Vì vậy, sử học nghiêm túc thường nhấn mạnh khoảng trống tư liệu hơn là khẳng định chắc chắn một nguyên nhân. Điều ít tranh cãi hơn là cái chết sớm ấy đã cắt ngang một chương cải cách còn dang dở.`
      },
      {
        question: 'Di sản cải cách của Quang Trung bị dang dở ở những điểm nào?',
        answer: `Di sản dang dở nhất nằm ở việc xây dựng bộ máy cai trị bền vững sau chiến tranh, cải tổ giáo dục và củng cố một trật tự chính trị mới có khả năng kế tục. Quang Trung cho thấy ý chí cải cách rất mạnh, nhưng thời gian quá ngắn để các thiết kế ấy thành thể chế ổn định. Bởi vậy, di sản của ông luôn mang cảm giác rực sáng nhưng chưa kịp kết tinh.`
      },
    ]),
  },
  'khoi-nghia-lam-son': {
    'le-loi': withMeta('khoi-nghia-lam-son', 'le-loi', [
      {
        question: 'Những năm đầu của khởi nghĩa Lam Sơn khó khăn đến mức nào?',
        answer: `Những năm đầu, nghĩa quân Lam Sơn nhiều phen như ngọn lửa nhỏ giữa gió lớn. Lương ít, người mỏi, thế lực quân Minh lại dày đặc, có lúc tưởng chỉ một bước nữa là tan. Nhưng chính quãng đó rèn ra cái lõi của nghĩa quân: ai còn đứng lại khi gian nan thì sau này mới dám đi đến cùng.`
      },
      {
        question: 'Bước ngoặt nào khiến nghĩa quân Lam Sơn chuyển từ cầm cự sang thắng thế?',
        answer: `Bước ngoặt không đến từ một khoảnh khắc đơn lẻ, mà từ khi nghĩa quân vừa giữ được lực, vừa mở rộng được lòng người và vùng hậu thuẫn. Khi thế trận không còn bó hẹp trong núi rừng Lam Sơn, ta mới bắt đầu chuyển từ chống đỡ sang chủ động đánh lớn. Từ đó, mỗi thắng lợi không còn là may mắn, mà là kết quả của một thế đang lên.`
      },
      {
        question: 'Ông đã giữ vững ý chí của nghĩa quân ra sao suốt gần mười năm chiến đấu?',
        answer: `Giữ ý chí không phải chỉ bằng lời hô hào, mà bằng việc cùng ăn, cùng chịu và cho quân biết vì sao họ đang đánh. Ta luôn hiểu một đạo quân đói rét mà không tin vào ngày mai thì sớm muộn cũng rã. Bởi vậy, việc giữ lòng người quan trọng không kém việc đánh một trận thắng.`
      },
    ]),
    'nguyen-trai': withMeta('khoi-nghia-lam-son', 'nguyen-trai', [
      {
        question: 'Tâm công đã giúp khởi nghĩa Lam Sơn thay đổi cục diện như thế nào?',
        answer: `Tâm công giúp Lam Sơn không chỉ thắng ở chiến trường mà còn thắng ở chỗ làm đối phương mất dần lý do để cố thủ. Khi quân Minh hiểu rằng kéo dài chiến tranh chỉ hao người tốn của mà không giữ nổi lòng người bản xứ, cục diện đã đổi từ gốc. Đó là thắng lợi của chính nghĩa được nói ra đúng lúc, đúng lời.`
      },
      {
        question: 'Theo ông, đâu là vai trò riêng của Nguyễn Trãi trong thắng lợi Lam Sơn?',
        answer: `Vai trò riêng của ta là giúp nghĩa quân có một tiếng nói đủ sức thuyết phục cả người theo mình lẫn người ở phía bên kia. Gươm giáo có thể mở đường, nhưng lời lẽ và đạo nghĩa mới giúp mở rộng thắng lợi và kết thúc chiến tranh theo cách ít đổ máu hơn. Nếu Lam Sơn chỉ biết đánh mà không biết nói, đại sự sẽ nhọc nhằn hơn nhiều.`
      },
      {
        question: 'Giữa mưu lược quân sự và chính nghĩa, yếu tố nào quyết định thành công của Lam Sơn?',
        answer: `Hai điều ấy không tách rời, nhưng nếu phải nói điều gốc hơn, ta vẫn chọn chính nghĩa. Mưu lược quân sự cho ta cách thắng từng trận, còn chính nghĩa cho ta lý do để người người đứng về một phía và kiên trì đến cùng. Không có chính nghĩa, mưu lược dễ thành thủ đoạn; không có mưu lược, chính nghĩa dễ bị dập vùi.`
      },
    ]),
    historian: withMeta('khoi-nghia-lam-son', 'historian', [
      {
        question: 'Vì sao khởi nghĩa Lam Sơn có thể đi đến thắng lợi sau một giai đoạn rất dài cầm cự?',
        answer: `Lam Sơn thắng vì kết hợp được ba yếu tố trong thời gian đủ dài: một hạt nhân lãnh đạo bền bỉ, mạng lưới hậu thuẫn xã hội ngày càng rộng, và khả năng chuyển từ chiến tranh du kích sang chiến tranh có tổ chức hơn. Quá trình cầm cự lâu năm không phải dấu hiệu yếu kém, mà là giai đoạn tích lũy lực lượng và tính chính danh. Khi ba yếu tố ấy hội tụ, thắng lợi trở nên khả thi.`
      },
      {
        question: 'Những bài học lớn nhất từ khởi nghĩa Lam Sơn đối với lịch sử Việt Nam là gì?',
        answer: `Bài học lớn nhất là một cuộc kháng chiến muốn thành công phải gắn quân sự với chính trị và với việc thu phục lòng người. Lam Sơn cũng cho thấy giai đoạn đầu thất bại, thiếu thốn không quyết định toàn bộ số phận cuộc chiến nếu lực lượng lãnh đạo còn giữ được mục tiêu chiến lược. Đây là một trong những ví dụ điển hình nhất của quá trình từ khởi nghĩa địa phương vươn thành cuộc kiến quốc.`
      },
      {
        question: 'Giới sử học hiện nay đánh giá vai trò của Lê Lợi và Nguyễn Trãi trong khởi nghĩa ra sao?',
        answer: `Đa số nghiên cứu hiện nay xem **Lê Lợi** là trung tâm quy tụ lực lượng và quyền uy chính trị, còn **Nguyễn Trãi** là bộ não chiến lược về chính nghĩa, ngoại giao và ngôn ngữ chính danh. Tranh luận không nằm ở việc ai quan trọng hơn tuyệt đối, mà ở cách hai vai trò ấy bổ sung cho nhau. Chính sự kết hợp giữa thủ lĩnh thực chiến và nhà tư tưởng hành động đã làm nên bản sắc Lam Sơn.`
      },
    ]),
  },
  'chien-thang-bach-dang': {
    'tran-hung-dao': withMeta('chien-thang-bach-dang', 'tran-hung-dao', [
      {
        question: 'Ngài đã chọn thời điểm phát động trận Bạch Đằng như thế nào?',
        answer: `Thời điểm ở **Bạch Đằng** không thể chọn bằng cảm tính, mà phải ép đối phương đi đúng nhịp của ta. Ta chờ lúc thủy triều, địa thế và tâm lý địch cùng rơi vào điểm bất lợi nhất rồi mới đánh trúng. Dùng binh là vậy: chậm một nhịp thì thời cơ hóa hư không, sớm một nhịp thì tự phá thế mình.`
      },
      {
        question: 'Đâu là quyết định khó nhất khi bố trí bãi cọc và dụ địch vào sông?',
        answer: `Khó nhất là giữ cho kế ấy kín đến phút cuối mà vẫn khiến địch tin rằng chúng đang nắm thế chủ động. Bãi cọc chỉ là vật chết nếu không gắn với cách dụ địch, cách rút nhử và cách khóa đường lui thật khít. Một trận như thế thắng ở chỗ mọi mắt xích đều phải ăn nhau, hở một chỗ là nguy.`
      },
      {
        question: 'Sau chiến thắng, ngài nhìn ý nghĩa của trận Bạch Đằng ra sao?',
        answer: `Ta không nhìn đó chỉ là một trận thắng đẹp. **Bạch Đằng** là lời đáp rằng nước Đại Việt biết cách dùng thế của mình để bẻ gãy kẻ mạnh hơn rất nhiều lần. Ý nghĩa lớn nhất của nó là giữ được cơ đồ và giữ cho lòng người tin rằng non sông này không dễ bị khuất phục.`
      },
    ]),
    contemporary: withMeta('chien-thang-bach-dang', 'contemporary', [
      {
        question: 'Là một quân sĩ nhà Trần, ông nhớ nhất khoảnh khắc nào trong trận Bạch Đằng?',
        answer: `Tôi nhớ nhất lúc thuyền giặc bắt đầu mắc thế mà chưa hiểu vì sao, còn bên ta thì như nín thở chờ lệnh. Cảm giác khi ấy vừa sợ vừa căng, như biết mình đang đứng ở mép một khoảnh khắc sẽ được nhắc lại rất lâu. Đến khi cục diện vỡ ra, ai cũng hiểu mình vừa sống qua một trận đánh không dễ có lần thứ hai.`
      },
      {
        question: 'Tinh thần quân Trần trước giờ quyết chiến trên sông Bạch Đằng ra sao?',
        answer: `Trước giờ quyết chiến, tinh thần quân Trần căng như dây cung nhưng không hề rối. Ai cũng biết trận này không chỉ quyết một ngày đánh, mà quyết cả việc giặc có còn đường quay lại uy hiếp nước mình hay không. Chính điều ấy khiến nỗi sợ nhường chỗ cho quyết tâm.`
      },
      {
        question: 'Chiến thắng ấy tác động đến tướng sĩ và dân chúng như thế nào?',
        answer: `Với tướng sĩ, đó là cảm giác trút được gánh nặng sau nhiều năm chống đỡ một kẻ thù quá mạnh. Với dân chúng, chiến thắng đem lại niềm tin rằng nhà Trần và cả nước vẫn còn đứng vững trước sóng dữ. Nhiều người về sau nhắc **Bạch Đằng** không chỉ như chiến công, mà như một lần cả nước thở phào.`
      },
    ]),
    historian: withMeta('chien-thang-bach-dang', 'historian', [
      {
        question: 'Vì sao trận Bạch Đằng 1288 được xem là đỉnh cao nghệ thuật thủy chiến của Đại Việt?',
        answer: `Bạch Đằng 1288 là đỉnh cao thủy chiến vì nó kết hợp được địa hình, thủy văn, nghi binh, nhử địch và đòn quyết định trong một thiết kế tác chiến rất hoàn chỉnh. Đại Việt không đơn thuần chống trả trên sông, mà biến con sông thành một cỗ máy tiêu diệt đối phương. Đó là sự chín muồi của nghệ thuật đánh lớn bằng điều kiện bản địa.`
      },
      {
        question: 'Những nguồn sử liệu chính về trận Bạch Đằng khác nhau ở điểm nào?',
        answer: `Các nguồn sử Việt thường nhấn mạnh vai trò chủ động của Trần Hưng Đạo và yếu tố địa lợi, trong khi tư liệu phía Nguyên quan tâm nhiều hơn đến thất bại hậu cần, rút lui và sai lầm chỉ huy. Sự khác nhau nằm ở trọng tâm kể chuyện và mục đích ghi chép hơn là phủ nhận hoàn toàn lẫn nhau. Đọc đối chiếu mới giúp tái dựng trận đánh bớt một chiều.`
      },
      {
        question: 'Bài học quân sự lớn nhất rút ra từ Bạch Đằng là gì?',
        answer: `Bài học lớn nhất là không đánh theo cách đối phương muốn, mà kéo họ vào một môi trường nơi ưu thế của họ bị đảo ngược. **Bạch Đằng** cho thấy chiến trường hiệu quả nhất đôi khi không phải nơi dễ thắng nhất về hình thức, mà là nơi phù hợp nhất với cấu trúc sức mạnh của mình. Đây là tư duy thiết kế chiến tranh chứ không chỉ là mưu mẹo chiến thuật.`
      },
    ]),
  },
  'chien-tranh-ly-tong': {
    'ly-thuong-kiet': withMeta('chien-tranh-ly-tong', 'ly-thuong-kiet', [
      {
        question: 'Vì sao ông quyết định đánh phủ đầu vào đất Tống trước khi họ tràn sang?',
        answer: `Ta hiểu rất rõ rằng nếu để nhà Tống chuẩn bị xong rồi mới nghênh chiến thì Đại Việt sẽ phải gánh một cuộc chiến nặng nề hơn nhiều. Bởi vậy, đòn phủ đầu là để phá thế chuẩn bị, giành lại nhịp độ và buộc địch từ thế đi đánh thành thế chống đỡ. Trong việc binh, kẻ biết lấy chủ động thường đã thắng một nửa.`
      },
      {
        question: 'Phòng tuyến Như Nguyệt được chuẩn bị để đối phó quân Tống ra sao?',
        answer: `Ta cho chuẩn bị phòng tuyến không phải như một bức tường đứng yên, mà như một thế trận biết tiêu hao và cầm chân quân Tống. Sông nước, lũy đất, cách bố trí quân và nhịp phản kích đều phải hỗ trợ lẫn nhau. Mục tiêu là khiến địch càng đánh càng mỏi, còn ta càng giữ càng chắc.`
      },
      {
        question: 'Khoảnh khắc nào khiến ông tin Đại Việt sẽ giữ được thế chủ động?',
        answer: `Khi quân Tống bị buộc vào thế trận Như Nguyệt và không thể triển khai ưu thế như chúng dự tính, ta biết phần khó nhất đã qua. Từ đó, điều quan trọng không còn là thắng cho đẹp, mà là giữ nhịp, giữ sức và không cho đối phương lật thế. Có lúc niềm tin đến không phải từ tiếng reo mừng, mà từ việc thấy kế sách của mình đang khóa chặt địch từng chút một.`
      },
    ]),
    'tong-quan': withMeta('chien-tranh-ly-tong', 'tong-quan', [
      {
        question: 'Từ phía nhà Tống, chiến dịch phương Nam đã được kỳ vọng như thế nào trước khi xuất quân?',
        answer: `Từ triều đình nhìn xuống, chiến dịch phương Nam ban đầu được kỳ vọng sẽ là một cuộc chấn chỉnh trật tự biên cương hơn là một cuộc chiến dai dẳng. Nhiều người tin sức mạnh quân Tống đủ để áp đảo Đại Việt trong thời gian không dài. Chính vì kỳ vọng quá nhiều vào ưu thế sẵn có, chúng tôi đã không lường hết một đối thủ biết chủ động và rất giỏi tận dụng địa thế.`
      },
      {
        question: 'Quân Tống gặp những khó khăn gì lớn nhất khi đối đầu phòng tuyến Như Nguyệt?',
        answer: `Khó khăn lớn nhất là bị kéo vào một không gian tác chiến không thuận lợi, nơi quân đông chưa chắc phát huy được hết sức mạnh. Địa thế sông nước, nhịp phản kích của Đại Việt và sức bền chiến dịch khiến quân Tống dần mỏi mệt. Điều nguy hiểm hơn cả là cảm giác cục diện không đi theo kế hoạch ban đầu.`
      },
      {
        question: 'Theo ông, vì sao chiến dịch này cuối cùng không đạt được mục tiêu?',
        answer: `Thất bại đến từ sự cộng dồn của nhiều điều: đánh giá chưa đủ sâu về đối phương, không làm chủ được nhịp độ chiến dịch và không phá nổi phòng tuyến trọng yếu. Khi chiến tranh kéo dài hơn dự tính, ưu thế ban đầu của quân Tống cũng hao hụt đi nhiều. Nói thẳng, chúng tôi đã bước vào cuộc chiến với sự tự tin lớn hơn mức hiểu biết thực tế.`
      },
    ]),
    historian: withMeta('chien-tranh-ly-tong', 'historian', [
      {
        question: 'Chiến tranh Lý–Tống có phải là ví dụ tiêu biểu nhất cho tư duy tiên phát chế nhân của Đại Việt không?',
        answer: `Đây chắc chắn là một trong những ví dụ tiêu biểu nhất, vì tư duy tiên phát chế nhân được triển khai khá rõ từ đòn đánh phủ đầu đến thế phòng thủ sau đó. Tuy nhiên, điều đáng chú ý hơn là Đại Việt không tuyệt đối hóa đánh trước, mà kết hợp nó với phòng ngự chiều sâu và kiểm soát nhịp độ chiến tranh. Chính cấu trúc hai bước ấy mới làm nên giá trị điển hình của cuộc chiến.`
      },
      {
        question: 'Những nguyên nhân quyết định thắng lợi của Đại Việt trong cuộc chiến này là gì?',
        answer: `Ba nguyên nhân quyết định là: chủ động chiến lược của Lý Thường Kiệt, khả năng tận dụng địa hình - đặc biệt là phòng tuyến Như Nguyệt, và sức bền tổ chức của Đại Việt trước một chiến dịch lớn từ phương Bắc. Bên cạnh đó còn có yếu tố tâm lý chiến và tính toán chính trị hợp lý sau khi giữ được thế trận. Đại Việt thắng không nhờ một khoảnh khắc đơn lẻ, mà nhờ một chuỗi quyết định nhất quán.`
      },
      {
        question: 'So với các cuộc kháng chiến khác, chiến tranh Lý–Tống có nét riêng nào nổi bật?',
        answer: `Nét riêng nổi bật là mức độ chủ động rất cao ngay từ trước khi đối phương chính thức tràn sang toàn diện. Nếu nhiều cuộc kháng chiến khác thường được kể qua những trận đánh phòng thủ phản công, thì chiến tranh Lý–Tống cho thấy Đại Việt có thể định hình cuộc chiến từ sớm hơn nhiều. Chính vì vậy, đây là một mẫu hình chiến tranh tiền chủ động rất đáng chú ý trong lịch sử Việt Nam.`
      },
    ]),
  },
  'dien-bien-phu': {
    'viet-minh': withMeta('dien-bien-phu', 'viet-minh', [
      {
        question: 'Điều gì khiến Đại tướng quyết định chuyển sang phương châm đánh chắc tiến chắc?',
        answer: `Khi xem xét lại toàn bộ tương quan lực lượng và điều kiện chiến trường, tôi hiểu rằng một quyết định nóng vội có thể đổi bằng rất nhiều xương máu. Chuyển sang **đánh chắc tiến chắc** là chấp nhận khó khăn lớn hơn về thời gian để đổi lấy thế thắng vững hơn. Trong chiến tranh, có lúc bản lĩnh nằm ở việc biết dừng lại để sửa kế hoạch.`
      },
      {
        question: 'Sức mạnh của chiến tranh nhân dân được thể hiện rõ nhất ở Điện Biên Phủ ra sao?',
        answer: `Điều rõ nhất là cả một hệ thống người và việc phía sau mặt trận cùng vận động như một cơ thể sống. Từ dân công, hậu cần, mở đường, kéo pháo đến từng mạch tiếp tế, mọi thứ đều chứng minh rằng chiến thắng không chỉ sinh ra từ chiến hào tiền tuyến. **Điện Biên Phủ** là nơi chiến tranh nhân dân hiện lên không phải như khẩu hiệu, mà như năng lực tổ chức khổng lồ.`
      },
      {
        question: 'Khoảnh khắc nào trong chiến dịch khiến Đại tướng thấy cán cân đã thực sự đổi chiều?',
        answer: `Cán cân đổi chiều không chỉ ở một điểm nổ, mà ở lúc hệ thống phòng ngự của địch bắt đầu mất dần khả năng tự phục hồi. Khi đó, từng thắng lợi cục bộ không còn rời rạc nữa mà nối vào nhau thành một xu thế rõ rệt. Với người chỉ huy, khoảnh khắc ấy là lúc biết trận đánh đã chuyển từ khó thắng thành không thể bỏ lỡ.`
      },
    ]),
    'french': withMeta('dien-bien-phu', 'french', [
      {
        question: 'Thưa tướng De Castries, khi nào ông bắt đầu nhận ra tập đoàn cứ điểm không còn đứng vững được nữa?',
        answer: `Ban đầu, chúng tôi vẫn tin hệ thống cứ điểm có thể cầm cự đủ lâu để đảo ngược thế trận. Nhưng khi áp lực của Việt Minh ngày càng liên tục, hỏa lực của họ không ngừng bào mòn và khả năng tiếp tế bị siết lại, cảm giác ấy đổi khác. Từ một thời điểm nào đó, vấn đề không còn là giữ ưu thế, mà là giữ cho toàn bộ cấu trúc không sụp xuống cùng lúc.`
      },
      {
        question: 'Điều gì từ phía Việt Minh khiến ông bất ngờ và bị động nhất trong toàn bộ chiến dịch?',
        answer: `Điều khiến chúng tôi bất ngờ nhất là khả năng tổ chức và sức chịu đựng của Việt Minh vượt xa những dự đoán ban đầu. Họ không chỉ có quyết tâm, mà còn có năng lực kéo pháo, đào hào, duy trì áp lực và biến một chiến trường tưởng như bất lợi thành chỗ bào mòn chúng tôi từng ngày. Sự bị động lớn nhất đến từ việc nhận ra đối thủ có thể làm nhiều hơn điều mình cho là họ có thể.`
      },
      {
        question: 'Nhìn lại Điện Biên Phủ, theo ông đâu là nguyên nhân lớn nhất dẫn tới thất bại của quân Pháp?',
        answer: `Nguyên nhân lớn nhất là chúng tôi đã xây dựng kế hoạch trên một giả định sai về năng lực và giới hạn của đối phương. Khi giả định gốc sai, mọi ưu thế kỹ thuật và phòng ngự sau đó đều dần mất ý nghĩa. **Điện Biên Phủ** không chỉ là thất bại của một tập đoàn cứ điểm, mà còn là thất bại của một cách nhìn quá tự tin về cuộc chiến.`
      },
    ]),
    historian: withMeta('dien-bien-phu', 'historian', [
      {
        question: 'Điện Biên Phủ đã tác động thế nào đến sự tan rã của chủ nghĩa thực dân cũ trên thế giới?',
        answer: `Điện Biên Phủ có tác động biểu tượng rất lớn vì nó cho thấy một lực lượng thuộc địa hoàn toàn có thể đánh bại quân đội của một cường quốc thực dân bằng chiến tranh có tổ chức cao. Sau 1954, chiến thắng này trở thành nguồn cảm hứng và một tiền lệ tinh thần cho nhiều phong trào giải phóng dân tộc ở châu Á, châu Phi. Tác động của nó vượt khỏi biên giới Việt Nam rất rõ.`
      },
      {
        question: 'Vì sao Điện Biên Phủ không chỉ là một chiến thắng quân sự mà còn là một bước ngoặt chính trị toàn cầu?',
        answer: `Vì kết quả của nó làm thay đổi luôn bàn đàm phán quốc tế và đẩy nhanh quá trình sắp xếp lại quan hệ thuộc địa - hậu thuộc địa trong bối cảnh chiến tranh lạnh. Nó cho thấy vấn đề thuộc địa không còn có thể bị xử lý chỉ bằng ưu thế quân sự của mẫu quốc. Nói cách khác, **Điện Biên Phủ** là chiến thắng quân sự mang hiệu lực chính trị vượt biên giới ngay lập tức.`
      },
      {
        question: 'Giới nghiên cứu quốc tế hiện nay nhìn Điện Biên Phủ như thế nào?',
        answer: `Giới nghiên cứu quốc tế hiện nay nhìn Điện Biên Phủ như một trường hợp điển hình của chiến tranh bất cân xứng, nơi tổ chức, hậu cần và ý chí chính trị làm đảo chiều tương quan sức mạnh. Nhiều công trình gần đây cũng quan tâm hơn đến mạng lưới dân công, hậu phương và cấu trúc quyết định chiến lược của Việt Minh. Nhìn chung, trọng tâm đã dịch từ câu chuyện anh hùng thuần túy sang phân tích một chiến thắng hệ thống.`
      },
    ]),
  },
  'tran-dong-da': {
    'nguyen-hue': withMeta('tran-dong-da', 'nguyen-hue', [
      {
        question: 'Vì sao ngài chọn tốc chiến tốc thắng ngay trong dịp Tết Kỷ Dậu?',
        answer: `Ta chọn đánh nhanh đúng dịp Tết vì quân Thanh khi ấy đang ngỡ mình đã yên thế, còn lòng người trong nước thì không thể chịu kéo dài nhục mất nước thêm nữa. Đánh chậm sẽ cho địch thời gian củng cố, còn đánh thần tốc thì lấy được cả yếu tố bất ngờ lẫn khí thế. Trận này phải thắng gọn, thắng mạnh, thì mới dập tắt được cái thế ngạo mạn của chúng.`
      },
      {
        question: 'Trong chiến dịch Ngọc Hồi – Đống Đa, đâu là quyết định táo bạo nhất của ngài?',
        answer: `Táo bạo nhất là dám tin vào tốc độ hành quân và sức chịu đựng của quân mình đến mức biến nó thành lưỡi dao chém thẳng vào chỗ địch không kịp trở tay. Nhiều người thấy cái liều ở ngoài mặt trận, còn ta biết cái liều thực sự nằm ở chỗ dám đặt toàn bộ cục diện vào một nhịp đánh quá nhanh. Nhưng đã đánh là phải đánh cho đối phương không còn kịp hiểu điều gì vừa xảy ra.`
      },
      {
        question: 'Ngài nhìn chiến thắng này như một trận đánh, hay như bước hoàn tất việc thống nhất sơn hà?',
        answer: `Ta nhìn nó là cả hai. Về mặt binh sự, đó là trận đánh quyết định đập tan một đạo quân lớn; về mặt vận nước, nó là bước chặn đứng ngoại lực can thiệp và mở đường cho việc thống nhất lại non sông. Có những chiến thắng xong trận là hết, còn chiến thắng này thì chạm đến tận cái thế của cả nước.`
      },
    ]),
    'tong-doc-hu-binh': withMeta('tran-dong-da', 'tong-doc-hu-binh', [
      {
        question: 'Thưa Tôn Sĩ Nghị, khi nào ông nhận ra quân Thanh đã đánh giá sai đối thủ Tây Sơn?',
        answer: `Sự đánh giá sai ấy lộ ra rõ nhất khi tốc độ phản ứng của Tây Sơn vượt quá mọi dự liệu, còn các vị trí của quân Thanh chưa kịp khép thành một thế chắc chắn. Điều đáng sợ không chỉ là họ đánh nhanh, mà là họ đánh nhanh mà vẫn có tổ chức. Khi nhận ra điều đó, thế chủ động thực ra đã bắt đầu rời khỏi tay chúng tôi.`
      },
      {
        question: 'Điều gì trong cuộc hành quân của Quang Trung khiến quân Thanh trở tay không kịp?',
        answer: `Chính là nhịp độ. Quang Trung hành quân và tung đòn nhanh đến mức nhiều giả định về thời gian chuẩn bị của quân Thanh trở nên vô nghĩa. Một đối thủ vừa cơ động vừa quyết đoán như vậy khiến mọi phương án phản ứng thông thường đều trở nên chậm chạp.`
      },
      {
        question: 'Theo ông, thất bại ở Ngọc Hồi – Đống Đa đến từ chủ quan, bố trí chiến trận hay tinh thần quân sĩ?',
        answer: `Nếu phải chọn một gốc, tôi sẽ nói là sự chủ quan trong cách nhìn đối thủ và cục diện. Từ sự chủ quan ấy mới kéo theo bố trí thiếu chặt và tinh thần quân sĩ dao động khi thế trận vỡ nhanh hơn dự kiến. Nói cách khác, thất bại không đến từ một mắt xích đơn lẻ, mà từ cái nhìn sai ngay từ đầu.`
      },
    ]),
    historian: withMeta('tran-dong-da', 'historian', [
      {
        question: 'Điểm đặc sắc nhất trong nghệ thuật hành quân và đánh trận của Quang Trung ở Ngọc Hồi – Đống Đa là gì?',
        answer: `Điểm đặc sắc nhất là sự kết hợp cực hiếm giữa tốc độ hành quân chiến lược và khả năng tung đòn quyết chiến trong trạng thái lực lượng vẫn còn gắn kết. Quang Trung không chỉ đi nhanh, mà còn giữ được khả năng chỉ huy nhịp nhàng khi vào trận. Đây là lý do chiến dịch này luôn được xem là đỉnh cao của nghệ thuật tốc chiến trong lịch sử Việt Nam.`
      },
      {
        question: 'Vì sao chiến thắng Đống Đa được xem là một trong những đỉnh cao quân sự của lịch sử Việt Nam?',
        answer: `Vì nó hội đủ nhiều yếu tố đỉnh cao cùng lúc: xác định đúng thời cơ, cơ động thần tốc, tạo bất ngờ chiến lược và kết thúc bằng một kết quả có ý nghĩa chính trị rất lớn. Chiến thắng này không chỉ đẩy lùi ngoại xâm mà còn khẳng định năng lực tự quyết của một chính quyền mới nổi lên trong thời loạn. Hiếm có trận nào vừa gọn về thời gian vừa sâu về hệ quả như vậy.`
      },
      {
        question: 'Những nguồn sử liệu nào giúp tái dựng rõ nhất diễn biến của trận Đống Đa?',
        answer: `Để tái dựng rõ nhất, cần đối chiếu sử liệu Việt Nam thời Tây Sơn và Nguyễn với ghi chép của phía Thanh, cùng các nguồn địa phương và nghiên cứu quân sự hiện đại. Mỗi nguồn có thiên lệch riêng về vai trò cá nhân, quy mô lực lượng và nhịp diễn biến. Chính việc đọc chéo mới giúp trận **Ngọc Hồi - Đống Đa** hiện lên bớt huyền thoại hóa mà vẫn giữ được tầm vóc thực sự của nó.`
      },
    ]),
  },
  'vo-nguyen-giap': {
    self: withMeta('vo-nguyen-giap', 'self', [
      {
        question: 'Đại tướng đã quyết định chuyển sang đánh chắc tiến chắc ở Điện Biên Phủ như thế nào?',
        answer: `Đó là một trong những quyết định khó nhất đời tôi. Khi đã dàn quân xong, mọi thứ sẵn sàng để đánh nhanh, nhưng tôi nhìn lại toàn bộ tương quan và hiểu rằng nếu đánh vội, cái giá phải trả bằng xương máu sẽ rất lớn mà chưa chắc thắng gọn. Chuyển sang đánh chắc tiến chắc là chấp nhận khó khăn lớn hơn về thời gian, nhưng đổi lại một thế thắng vững chắc hơn. Trong chiến tranh, bản lĩnh đôi khi nằm ở chỗ dám dừng lại để sửa kế hoạch.`
      },
      {
        question: 'Điều gì khiến Đại tướng tin vào sức mạnh của chiến tranh nhân dân?',
        answer: `Tôi tin vì đã tận mắt chứng kiến sức mạnh ấy từ những ngày đầu kháng chiến. Khi cả một dân tộc cùng đứng lên, từ người nông dân gánh gạo, người phụ nữ mở đường đến anh bộ đội cầm súng, thì sức mạnh không nằm ở vũ khí hiện đại mà nằm ở ý chí và tổ chức. Chiến tranh nhân dân không phải khẩu hiệu, mà là cách biến toàn bộ năng lực dân tộc thành sức mạnh quân sự thực sự.`
      },
      {
        question: 'Đại tướng muốn thế hệ sau hiểu gì về những người lính đã ngã xuống?',
        answer: `Tôi muốn thế hệ sau hiểu rằng mỗi chiến thắng đều được đánh đổi bằng máu và nước mắt của rất nhiều người. Họ không phải những con số trong sách sử, mà là những con người có gia đình, có ước mơ, nhưng đã đặt tất cả xuống vì một điều lớn hơn bản thân mình. Nhớ đến họ không chỉ là tri ân, mà còn là trách nhiệm sống sao cho xứng đáng với sự hi sinh ấy.`
      },
    ]),
    contemporary: withMeta('vo-nguyen-giap', 'contemporary', [
      {
        question: 'Anh nhớ nhất điều gì về Đại tướng Võ Nguyên Giáp khi ở chiến trường?',
        answer: `Tôi nhớ nhất là cái cách Đại tướng nhìn vào bản đồ rồi đưa ra quyết định. Ông không bao giờ vội, không bao giờ để cảm xúc lấn át, nhưng khi đã quyết thì cả bộ máy vận hành theo một nhịp rất rõ. Ở ngoài mặt trận, anh em chúng tôi tin ông không chỉ vì ông là tướng, mà vì thấy ông thật sự cân nhắc sinh mạng từng người lính khi ra lệnh.`
      },
      {
        question: 'Những ngày kéo pháo vào Điện Biên Phủ gian khổ ra sao?',
        answer: `Gian khổ đến mức có lúc tưởng không thể. Đường rừng dốc đứng, mưa rừng, sình lầy, mỗi khẩu pháo nặng hàng tấn mà kéo bằng sức người qua từng mét núi. Nhưng lạ là không ai bỏ cuộc. Anh em nhìn nhau, biết nếu dừng lại thì cả chiến dịch sẽ hỏng, nên cứ thế mà kéo, mà đẩy, đêm này qua đêm khác. Sau này nghĩ lại, chính những đêm ấy mới cho thấy sức chịu đựng của bộ đội mình ghê gớm đến nhường nào.`
      },
      {
        question: 'Khoảnh khắc nào anh biết Điện Biên Phủ sẽ thắng?',
        answer: `Nói thật, không ai dám chắc thắng cho đến khi lá cờ cắm lên hầm De Castries. Nhưng có một khoảnh khắc tôi cảm nhận rõ cán cân đã nghiêng: khi các cứ điểm rụng dần và phía Pháp không còn khả năng phản kích hiệu quả nữa. Lúc ấy, từ trong hào, anh em nhìn nhau và hiểu rằng mọi gian khổ đã không uổng phí. Cảm giác không chỉ là vui, mà là nhẹ đi một gánh rất nặng trên vai cả nước.`
      },
    ]),
    historian: withMeta('vo-nguyen-giap', 'historian', [
      {
        question: 'Võ Nguyên Giáp nên được đặt ở vị trí nào trong lịch sử quân sự thế giới thế kỷ 20?',
        answer: `Võ Nguyên Giáp là một trong số rất ít tướng lĩnh thế kỷ 20 đã đánh bại lần lượt hai cường quốc quân sự bằng chiến tranh bất cân xứng có tổ chức cao. Vị trí của ông trong lịch sử quân sự thế giới nằm ở khả năng kết hợp tư duy chiến lược dài hạn với nghệ thuật tổ chức lực lượng toàn dân. Ông không chỉ thắng bằng mưu mẹo chiến thuật, mà bằng thiết kế toàn bộ cục diện chiến tranh nhân dân. Chính điều ấy khiến ông được so sánh ngang hàng với những nhà quân sự lớn nhất của thời đại.`
      },
      {
        question: 'Quyết định đánh chắc tiến chắc ở Điện Biên Phủ nên được phân tích ra sao?',
        answer: `Đây là một trong những quyết định chỉ huy kinh điển trong lịch sử quân sự hiện đại. Giáp đã chấp nhận rủi ro chính trị và tâm lý rất lớn khi rút lại toàn bộ kế hoạch tấn công đã chuẩn bị xong, để chuyển sang phương án tốn thời gian hơn nhưng chắc chắn hơn. Quyết định ấy cho thấy ông đặt tính toán chiến lược cao hơn áp lực phải hành động, và nó trực tiếp quyết định kết cục toàn bộ chiến dịch.`
      },
      {
        question: 'Di sản quân sự lớn nhất mà Võ Nguyên Giáp để lại là gì?',
        answer: `Di sản lớn nhất của Võ Nguyên Giáp là mô hình chiến tranh nhân dân được nâng lên tầm nghệ thuật quân sự có hệ thống. Ông chứng minh rằng một quốc gia nhỏ, ít tài nguyên quân sự có thể thắng đối thủ lớn hơn nhiều lần nếu biết tổ chức toàn dân, kiên trì chiến lược và chọn đúng thời cơ quyết chiến. Mô hình ấy đã trở thành nguồn tham khảo quan trọng cho nhiều phong trào giải phóng dân tộc và nhiều chương trình nghiên cứu quân sự trên thế giới.`
      },
    ]),
  },
}

function getPresetEntries(entityId, perspective) {
  return presetCatalog[entityId]?.[perspective] || []
}

export function getQuickSuggestions(entity, perspective) {
  if (!entity) return []

  const exactEntries = getPresetEntries(entity.id, perspective)
  if (exactEntries.length > 0) {
    return exactEntries.map((entry) => entry.question)
  }

  const name = entity.name
  const persona = entity.perspectives?.[perspective]?.persona || ''
  const isEvent = entity.type === 'event'

  if (perspective === 'historian') {
    return isEvent
      ? [
          `Phân tích ý nghĩa lịch sử của ${name}.`,
          `${name} đã thay đổi tiến trình lịch sử Việt Nam ra sao?`,
          `Những nguồn sử liệu khác nhau đánh giá ${name} thế nào?`,
        ]
      : [
          `Đánh giá vai trò của ${name} trong lịch sử Việt Nam.`,
          `Những tranh luận sử học lớn quanh ${name} là gì?`,
          `Di sản lớn nhất mà ${name} để lại là gì?`,
        ]
  }

  if (perspective === 'self') {
    return isEvent
      ? [
          'Kể lại diễn biến chính của sự kiện này.',
          'Bước ngoặt quyết định nhất là gì?',
          'Bài học lớn nhất rút ra từ sự kiện này là gì?',
        ]
      : [
          'Ngài hãy kể về cuộc đời và sự nghiệp của mình.',
          'Điều gì đã thôi thúc ngài dấn thân vì đất nước?',
          'Khoảnh khắc nào khiến ngài nhớ nhất trong đời mình?',
        ]
  }

  if (isEvent) {
    const lowerPersona = persona.toLowerCase()
    const isDefeatedSide = [
      'de castries',
      'tôn sĩ nghị',
      'tuong de castries',
      'tướng de castries',
      'tướng nhà tống',
      'tong',
      'thanh',
      'pháp',
      'french',
    ].some((token) => lowerPersona.includes(token))

    if (isDefeatedSide) {
      return [
        `${persona}, khi nào ngài nhận ra cục diện của ${name} đang xoay chuyển bất lợi?`,
        `Từ phía của ngài, khó khăn nào trong ${name} là nghiêm trọng nhất?`,
        `Nếu nhìn lại ${name}, ngài cho rằng nguyên nhân chính của thất bại là gì?`,
      ]
    }

    return [
      `${persona}, ngài đã trải qua ${name} như thế nào?`,
      `Quyết định khó khăn nhất của ngài trong ${name} là gì?`,
      `Khoảnh khắc nào trong ${name} khiến ngài nhớ nhất?`,
    ]
  }

  return [
    `${persona}, ngài đánh giá ${name} là người thế nào?`,
    `Ngài có kỷ niệm nào đáng nhớ với ${name}?`,
    `Trong vai trò của mình, ngài đã hợp tác với ${name} ra sao?`,
  ]
}

export function findPresetResponse({ entityId, perspective, input }) {
  const entries = getPresetEntries(entityId, perspective)
  if (!entries.length) return null

  const normalizedInput = normalizeText(input)
  if (!normalizedInput) return null

  const exact = entries.find((entry) => normalizeText(entry.question) === normalizedInput)
  if (exact) {
    return { ...exact, matchType: 'exact', confidence: 1 }
  }

  const rawInputTokens = Array.from(new Set(tokenize(input)))
  if (rawInputTokens.length < 2) return null
  const inputTokens = expandWithSynonyms(rawInputTokens)

  let bestMatch = null

  for (const entry of entries) {
    const normalizedQuestion = normalizeText(entry.question)

    if (
      normalizedInput.length >= 20 &&
      normalizedQuestion.length >= 20 &&
      (normalizedQuestion.includes(normalizedInput) || normalizedInput.includes(normalizedQuestion))
    ) {
      return { ...entry, matchType: 'contains', confidence: 0.98 }
    }

    const entryTokens = Array.from(new Set(tokenize(entry.question)))
    const overlap = inputTokens.filter((token) => entryTokens.includes(token)).length
    if (overlap < Math.min(3, entryTokens.length)) continue

    const presetCoverage = overlap / entryTokens.length
    const inputCoverage = overlap / inputTokens.length
    const textSimilarity = diceCoefficient(normalizedInput, normalizedQuestion)
    const score = presetCoverage * 0.45 + inputCoverage * 0.35 + textSimilarity * 0.2

    if (!bestMatch || score > bestMatch.confidence) {
      bestMatch = {
        ...entry,
        matchType: 'semantic',
        confidence: Number(score.toFixed(3)),
      }
    }
  }

  if (!bestMatch) return null
  if (bestMatch.confidence < 0.78) return null
  return bestMatch
}

export function hasPresetAudio(message) {
  return Boolean(message?.source === 'preset' && message?.audioSrc)
}

export function getPresetCatalog() {
  return presetCatalog
}

/**
 * Lấy 1 câu hỏi preset chưa được hỏi để gợi ý tiếp theo.
 * @param {string} entityId
 * @param {string} perspective
 * @param {string[]} askedQuestions - danh sách các câu hỏi đã hỏi (content text)
 * @returns {{ question: string, isPreset: true } | null}
 */
export function getNextPresetSuggestion(entityId, perspective, askedQuestions = []) {
  const results = getUnusedPresetSuggestions(entityId, perspective, askedQuestions, 1)
  return results.length > 0 ? results[0] : null
}

/**
 * Lấy nhiều câu hỏi preset chưa được hỏi.
 * @param {string} entityId
 * @param {string} perspective
 * @param {string[]} askedQuestions
 * @param {number} count - số lượng tối đa cần lấy
 * @returns {Array<{ question: string, isPreset: true }>}
 */
export function getUnusedPresetSuggestions(entityId, perspective, askedQuestions = [], count = 3) {
  const entries = getPresetEntries(entityId, perspective)
  if (!entries.length) return []

  const normalizedAsked = askedQuestions.map(q => normalizeText(q))

  const unused = entries.filter(entry => {
    const normalizedQ = normalizeText(entry.question)
    return !normalizedAsked.some(asked =>
      asked === normalizedQ ||
      (asked.length > 15 && normalizedQ.includes(asked)) ||
      (normalizedQ.length > 15 && asked.includes(normalizedQ))
    )
  })

  return unused.slice(0, count).map(entry => ({ question: entry.question, isPreset: true }))
}
