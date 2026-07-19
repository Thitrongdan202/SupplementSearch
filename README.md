# Supplement 

Supplement là catalogue thực phẩm bổ sung dùng dữ liệu công khai, có ảnh
thật và phân loại theo 45 nhánh. Ứng dụng hợp nhất ba nguồn trực tiếp:

- **Open Food Facts**: barcode, tên, thương hiệu, taxonomy và ảnh bao bì.
- **Open Prices**: giá quan sát, tiền tệ, ngày và địa điểm.
- **NIH ODS · DSLD**: nhãn, dạng dùng và thành phần chuyên dietary supplement.

Không còn CSV giá mô phỏng, SQLite cục bộ, model embedding hay API key Gemini.

## Điểm chính

- 45 nhánh trong 4 hệ: dinh dưỡng nền tảng, mục tiêu cơ thể, giai đoạn sống và
  thể thao & hiệu suất.
- Bao phủ cả vitamin, khoáng chất, thảo dược, probiotic, prenatal lẫn whey,
  creatine, BCAA/EAA, pre-workout, điện giải, gel sức bền và meal replacement.
- Kệ mặc định trộn dữ liệu từ cả ba nguồn, 24 card mỗi lượt.
- Bộ lọc **Chỉ có giá** giữ lại sản phẩm có giá Open Prices hợp lệ.
- Card không có giá được ghi rõ **Chưa có giá mở**; ứng dụng không tự gán giá,
  không quy đổi sang VND và không lấy giá trung bình.
- API server-side có cache theo provider và stale fallback 24 giờ. Open Food
  Facts có đường dự phòng qua máy chủ khu vực và product mirror của Open Prices.
- UI React/TypeScript có lớp Three.js nhẹ cho “chòm sao dinh dưỡng”; tìm kiếm,
  lọc và hộp thoại vẫn là DOM semantic, hỗ trợ bàn phím và reduced motion.

## Nguồn và phạm vi

- [Open Food Facts API](https://openfoodfacts.github.io/openfoodfacts-server/api/)
- [Open Prices API](https://prices.openfoodfacts.org/api/docs)
- [NIH Dietary Supplement Label Database](https://api.ods.od.nih.gov/dsld/v9/)

Open Food Facts/Open Prices là dữ liệu cộng đồng và có thể thiếu hoặc sai. Giá là
một quan sát tại nơi và thời điểm cụ thể, không phải báo giá bán tại Việt Nam.
NIH DSLD phản ánh nội dung nhãn do nhà sản xuất hoặc nhà phân phối cung cấp,
không xác nhận hiệu quả hay độ an toàn. Ứng dụng dùng cho tra cứu sản phẩm, không
thay thế tư vấn y tế.

## Chạy local

Yêu cầu Node.js 22.13+ và pnpm.

```bash
pnpm install
pnpm dev
```

Mặc định mở `http://localhost:3000`.

```bash
pnpm test
pnpm build
```

Không cần `.env` hoặc API key cho ba nguồn hiện tại.

## API nội bộ

```http
GET /api/catalog
GET /api/catalog?q=creatine
GET /api/catalog?category=vitamins-multivitamins
GET /api/catalog?mode=priced
GET /api/catalog?page=2&limit=24&mode=all
```

Tham số:

- `q`: tên sản phẩm hoặc hoạt chất, tối đa 80 ký tự.
- `category`: ID trong `lib/taxonomy.ts`.
- `mode`: `all` hoặc `priced`.
- `page`: 1–50.
- `limit`: 6–36, mặc định 24.

Response trả `items`, phân trang, tổng số hồ sơ khớp, trạng thái từng provider và
thời điểm lấy dữ liệu. Mỗi item có ảnh, taxonomy đa nhãn, nguồn hồ sơ và trạng
thái giá. Sản phẩm có giá còn có tiền tệ, ngày, địa điểm và link kiểm chứng.

## Kiến trúc

```text
app/
  api/catalog/route.ts      API cùng origin và validate input
  components/               Catalogue, card, dialog và Three.js
lib/
  catalog.ts                Orchestrator, interleave và loại trùng
  open-food-facts.ts        Adapter catalog/ảnh và mirror fallback
  open-prices.ts            Adapter giá quan sát
  dsld.ts                   Adapter nhãn/thành phần NIH DSLD
  provider-cache.ts         Cache và stale fallback dùng chung
  taxonomy.ts               45 nhánh + alias Việt/Anh + classifier
  types.ts                  Contract dữ liệu đa nguồn
worker/
  index.ts                  Cloudflare Worker entry cho Vinext
```

## Giới hạn có chủ đích

- Không tuyên bố bao phủ tuyệt đối mọi SKU trên thị trường.
- Không scrape Shopee, Lazada hay nhà bán lẻ không cấp API/feed hợp pháp.
- Không suy diễn tác dụng điều trị từ tên hoặc nội dung nhãn.
- Giá Việt Nam hiện hành cần feed được cấp phép từ nhà bán lẻ Việt Nam.
