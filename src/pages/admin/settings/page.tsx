import { useState } from "react";
import { Save, Upload } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    storeName: "Tech Store",
    email: "admin@techstore.com",
    phone: "+84 912 345 678",
    address: "123 Đường ABC, Quận 1, TPHCM",
    city: "TPHCM",
    country: "Việt Nam",
    zipCode: "70000",
    currency: "VND",
    taxRate: "10",
    shippingFee: "30000",
  });

  const [bankInfo, setBankInfo] = useState({
    bankName: "Vietcombank",
    accountName: "Tech Store Co.,Ltd",
    accountNumber: "1234567890123",
    swiftCode: "BFVIVNVX",
  });

  const [social, setSocial] = useState({
    facebook: "https://facebook.com/techstore",
    instagram: "https://instagram.com/techstore",
    twitter: "https://twitter.com/techstore",
    youtube: "https://youtube.com/@techstore",
  });

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBankChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBankInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSocial((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Cài đặt</h1>
        <p className="text-muted-foreground mt-1">
          Quản lý thông tin và cài đặt của cửa hàng
        </p>
      </div>

      {/* Store Information */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">
          Thông tin cửa hàng
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tên cửa hàng
              </label>
              <Input
                name="storeName"
                value={formData.storeName}
                onChange={handleFormChange}
                className="bg-input border-border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                className="bg-input border-border"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Điện thoại
              </label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
                className="bg-input border-border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Địa chỉ
              </label>
              <Input
                name="address"
                value={formData.address}
                onChange={handleFormChange}
                className="bg-input border-border"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Thành phố
              </label>
              <Input
                name="city"
                value={formData.city}
                onChange={handleFormChange}
                className="bg-input border-border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Quốc gia
              </label>
              <Input
                name="country"
                value={formData.country}
                onChange={handleFormChange}
                className="bg-input border-border"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Mã ZIP
              </label>
              <Input
                name="zipCode"
                value={formData.zipCode}
                onChange={handleFormChange}
                className="bg-input border-border"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Store Preferences */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">
          Tùy chọn cửa hàng
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tiền tệ
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleFormChange}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground"
              >
                <option>VND</option>
                <option>USD</option>
                <option>EUR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Thuế suất (%)
              </label>
              <Input
                name="taxRate"
                type="number"
                value={formData.taxRate}
                onChange={handleFormChange}
                className="bg-input border-border"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Phí vận chuyển mặc định
            </label>
            <Input
              name="shippingFee"
              type="number"
              value={formData.shippingFee}
              onChange={handleFormChange}
              className="bg-input border-border"
            />
          </div>
        </div>
      </Card>

      {/* Bank Information */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">
          Thông tin ngân hàng
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tên ngân hàng
              </label>
              <Input
                name="bankName"
                value={bankInfo.bankName}
                onChange={handleBankChange}
                className="bg-input border-border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tên tài khoản
              </label>
              <Input
                name="accountName"
                value={bankInfo.accountName}
                onChange={handleBankChange}
                className="bg-input border-border"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Số tài khoản
              </label>
              <Input
                name="accountNumber"
                value={bankInfo.accountNumber}
                onChange={handleBankChange}
                className="bg-input border-border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Mã SWIFT
              </label>
              <Input
                name="swiftCode"
                value={bankInfo.swiftCode}
                onChange={handleBankChange}
                className="bg-input border-border"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Social Media */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">
          Mạng xã hội
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Facebook
            </label>
            <Input
              name="facebook"
              type="url"
              value={social.facebook}
              onChange={handleSocialChange}
              className="bg-input border-border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Instagram
            </label>
            <Input
              name="instagram"
              type="url"
              value={social.instagram}
              onChange={handleSocialChange}
              className="bg-input border-border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Twitter
            </label>
            <Input
              name="twitter"
              type="url"
              value={social.twitter}
              onChange={handleSocialChange}
              className="bg-input border-border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              YouTube
            </label>
            <Input
              name="youtube"
              type="url"
              value={social.youtube}
              onChange={handleSocialChange}
              className="bg-input border-border"
            />
          </div>
        </div>
      </Card>

      {/* Store Logo */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">
          Logo cửa hàng
        </h2>
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="font-medium text-foreground mb-1">
            Tải lên logo của cửa hàng
          </p>
          <p className="text-sm text-muted-foreground">
            PNG, JPG hoặc SVG. Kích thước tối đa 5MB
          </p>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex gap-2">
        <Button size="lg" className="bg-primary hover:bg-primary/90">
          <Save className="w-5 h-5 mr-2" />
          Lưu thay đổi
        </Button>
        <Button variant="outline">Hủy</Button>
      </div>
    </div>
  );
}
