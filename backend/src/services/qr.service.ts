/**
 * Service để tạo QR code thanh toán ngân hàng (VietQR format)
 * Format chuẩn VietQR: https://vietqr.net/ 
 * 
 * QR code này khi quét sẽ tự động mở app ngân hàng và điền thông tin chuyển khoản
 */

export interface QRPaymentData {
  bankCode: string; // Mã ngân hàng (VCB, TCB, CTG, etc.)
  accountNumber: string; // Số tài khoản
  accountName: string; // Tên chủ tài khoản
  amount: number; // Số tiền
  description: string; // Nội dung chuyển khoản
  orderNumber?: string; // Mã đơn hàng để verify
}

export class QRService {
  /**
   * Mapping mã ngân hàng sang mã NAPAS (dùng cho VietQR API)
   */
  private getNAPASCode(bankCode: string): string {
    const napasMap: Record<string, string> = {
      'CTG': '970415', // VietinBank
      'VCB': '970436', // Vietcombank
      'TCB': '970407', // Techcombank
      'VPB': '970432', // VPBank
      'ACB': '970416', // ACB
      'TPB': '970423', // TPBank
      'MBB': '970422', // MBBank
      'VIB': '970441', // VIB
      'STB': '970403', // Sacombank
      'HDB': '970437', // HDBank
      'MSB': '970426', // Maritime Bank
    };
    
    return napasMap[bankCode.toUpperCase()] || bankCode;
  }

  /**
   * Tạo VietQR Image URL từ API VietQR (QR code thật từ ngân hàng)
   * Format: https://img.vietqr.io/image/{napasCode}-{accountNumber}-{template}.png?amount={amount}&addInfo={description}&accountName={accountName}
   * 
   * QR code này được tạo từ API VietQR chính thức, đảm bảo hợp lệ với tất cả app ngân hàng
   * Template: 'print' (cho in ấn), 'compact2' (compact với logo), 'compact' (compact không logo), 'qr_only' (chỉ QR code)
   */
  generateVietQRImage(data: QRPaymentData, template: string = 'print'): string {
    const { bankCode, accountNumber, amount, description, orderNumber, accountName } = data;
    
    // Chuyển đổi mã ngân hàng sang mã NAPAS
    const napasCode = this.getNAPASCode(bankCode);
    
    // Tạo nội dung chuyển khoản
    let addInfo = orderNumber 
      ? `${description} ${orderNumber}`.substring(0, 100)
      : description.substring(0, 100);
    
    // Loại bỏ ký tự đặc biệt, chỉ giữ chữ, số, khoảng trắng
    addInfo = addInfo.replace(/[^\w\s]/g, '').trim();
    
    // Chuẩn hóa tên tài khoản (thay khoảng trắng bằng +)
    const normalizedAccountName = accountName.replace(/\s+/g, '+').toUpperCase();
    
    // Tạo URL image từ VietQR API
    // Format: https://img.vietqr.io/image/970415-0768562386-print.png?amount=100000&addInfo=Thanh+toan+don+hang+ORD001&accountName=LE+HOANG+NGOC+LAN
    const qrImageUrl = `https://img.vietqr.io/image/${napasCode}-${accountNumber}-${template}.png?amount=${amount}&addInfo=${encodeURIComponent(addInfo)}&accountName=${normalizedAccountName}`;
    
    return qrImageUrl;
  }

  /**
   * Tạo VietQR URL theo format chuẩn VietQR (backup - dùng cho QR code generator)
   * Format: https://vietqr.net/{bankCode}/{accountNumber}?amount={amount}&addInfo={description}
   */
  generateVietQR(data: QRPaymentData): string {
    const { bankCode, accountNumber, amount, description, orderNumber } = data;
    
    // Tạo nội dung chuyển khoản
    let addInfo = orderNumber 
      ? `${description} ${orderNumber}`.substring(0, 100)
      : description.substring(0, 100);
    
    // Loại bỏ ký tự đặc biệt không hợp lệ
    addInfo = addInfo.replace(/[^\w\s\-]/g, '');
    
    // Encode để URL safe
    const encodedInfo = encodeURIComponent(addInfo);
    
    // Tạo VietQR URL
    const qrUrl = `https://vietqr.net/${bankCode}/${accountNumber}?amount=${amount}&addInfo=${encodedInfo}`;
    
    return qrUrl;
  }

  /**
   * Tạo QR code theo format khác (backup - không dùng chính)
   */
  generateBankQR(data: QRPaymentData): string {
    const { accountNumber, amount, description, orderNumber } = data;
    const content = orderNumber ? `${description} ${orderNumber}`.substring(0, 100) : description.substring(0, 100);
    return `bank://transfer?account=${accountNumber}&amount=${amount}&content=${encodeURIComponent(content)}`;
  }

  /**
   * Tạo QR code data từ order
   */
  generateQRFromOrder(
    orderNumber: string,
    totalAmount: number,
    bankConfig: {
      bankCode: string;
      accountNumber: string;
      accountName: string;
    }
  ): QRPaymentData {
    return {
      bankCode: bankConfig.bankCode,
      accountNumber: bankConfig.accountNumber,
      accountName: bankConfig.accountName,
      amount: Math.round(totalAmount),
      description: `Thanh toan don hang ${orderNumber}`,
      orderNumber,
    };
  }
}

export default new QRService();

