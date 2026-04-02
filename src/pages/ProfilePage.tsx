import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { orderService, OrderDto } from '../services/orderService';
import { customerService } from '../services/customerService';
import { addressService, AddressDto } from '../services/addressService';
import { 
  User, Mail, Phone, MapPin, Package, 
  Settings, ChevronRight, LogOut, ShieldCheck,
  Calendar, CreditCard, ExternalLink, Loader2, Plus, Trash2, Edit2
} from 'lucide-react';
import { toast } from 'sonner';

export function ProfilePage() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [addresses, setAddresses] = useState<AddressDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Partial<AddressDto> | null>(null);

  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    email: ''
  });

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [profile, addrList] = await Promise.all([
        customerService.getMyProfile(),
        addressService.getMyAddresses()
      ]);
      setProfileData({
        name: profile.fullName || profile.name || '',
        phone: profile.phoneNumber || profile.phone || '',
        email: profile.email || ''
      });
      setAddresses(addrList || []);
    } catch (error) {
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadInitialData(); }, []);

  useEffect(() => {
    if (activeTab === 'orders') {
      const fetchOrders = async () => {
        setLoading(true);
        try {
          const data = await orderService.getMyOrders();
          setOrders(data);
        } catch (error) {
          toast.error("Could not load orders");
        } finally {
          setLoading(false);
        }
      };
      fetchOrders();
    }
  }, [activeTab]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await customerService.updateMyProfile({
        fullName: profileData.name,
        phoneNumber: profileData.phone
      });
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Update failed.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!editingAddress) return;

  setIsUpdating(true);
  try {
    const id = editingAddress.id;

    // Ưu tiên lấy addressLine từ state, nếu không có thì thử lấy street (phòng hờ dữ liệu cũ)
    const finalAddressLine = editingAddress.addressLine || (editingAddress as any).street || "";

    const cleanPayload = {
      addressLine: finalAddressLine, 
      city: editingAddress.city || "",
      district: editingAddress.district || "",
      ward: editingAddress.ward || "",
      zipCode: editingAddress.zipCode || "70000",
      isDefault: editingAddress.isDefault ?? true
    };

    console.log("🚀 Payload thực tế gửi lên BE:", cleanPayload);

    if (id) {
      await addressService.updateAddress(Number(id), cleanPayload);
      toast.success("Cập nhật thành công!");
    } else {
      await addressService.createAddress(cleanPayload);
      toast.success("Thêm mới thành công!");
    }

    const updatedList = await addressService.getMyAddresses();
    setAddresses(updatedList);
    setEditingAddress(null);
  } catch (error: any) {
    console.error("Lỗi chi tiết:", error.response?.data);
    toast.error("Không thể lưu địa chỉ.");
  } finally {
    setIsUpdating(false);
  }
};
  const handleDeleteAddress = async (id: number) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await addressService.deleteAddress(id);
      setAddresses(addresses.filter(a => a.id !== id));
      toast.success("Deleted");
    } catch (error) { toast.error("Delete failed"); }
  };

  return (
    <>
      <style>{css}</style>
      <div className="pf-container">
        <div className="pf-header-card">
          <div className="pf-avatar-wrapper">
            <div className="pf-avatar-circle">{profileData.name?.charAt(0) || 'U'}</div>
            <div className="pf-user-info">
              <h1>{profileData.name || 'Loading...'}</h1>
              <p><Mail size={14} /> {profileData.email}</p>
            </div>
          </div>
          <div className="pf-header-badge"><ShieldCheck size={16} /> Verified Account</div>
        </div>

        <div className="pf-layout">
          <aside className="pf-sidebar">
            <button className={`pf-nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
              <Settings size={18} /> <span>Account Settings</span> <ChevronRight size={16} className="arrow" />
            </button>
            <button className={`pf-nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
              <Package size={18} /> <span>Order History</span> <ChevronRight size={16} className="arrow" />
            </button>
            <div className="pf-sidebar-divider" />
            <button className="pf-nav-item logout" onClick={logout}><LogOut size={18} /> <span>Logout</span></button>
          </aside>

          <main className="pf-main-content">
            {activeTab === 'profile' ? (
              <div className="space-y-6">
                <div className="pf-card animate-fade-in">
                  <div className="pf-card-header">
                    <h2>Personal Information</h2>
                    <p>Manage your basic account details</p>
                  </div>
                  <form className="pf-form" onSubmit={handleUpdateProfile}>
                    <div className="pf-form-grid">
                      <div className="pf-input-group">
                        <label>Full Name</label>
                        <div className="pf-input-wrapper">
                          <User size={18} />
                          <input type="text" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} />
                        </div>
                      </div>
                      <div className="pf-input-group">
                        <label>Phone Number</label>
                        <div className="pf-input-wrapper">
                          <Phone size={18} />
                          <input type="tel" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} />
                        </div>
                      </div>
                    </div>
                    <button type="submit" disabled={isUpdating} className="pf-btn-primary w-fit">
                      {isUpdating ? <Loader2 className="animate-spin" size={18} /> : 'Save Profile'}
                    </button>
                  </form>
                </div>

                <div className="pf-card animate-fade-in">
                  <div className="pf-card-header flex justify-between items-center">
                    <div>
                      <h2>Shipping Addresses</h2>
                      <p>Your saved delivery locations</p>
                    </div>
                    {!editingAddress && (
                      <button onClick={() => setEditingAddress({ addressLine: '', ward: '', district: '', city: '', zipCode: '' })} className="pf-btn-add">
                        <Plus size={16} /> Add New
                      </button>
                    )}
                  </div>

                  {editingAddress ? (
                    <form onSubmit={handleSaveAddress} className="pf-edit-address-form animate-slide-down">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="pf-input-group col-span-2">
                          <label>Street Address</label>
                          <input className="pf-input-basic" required value={editingAddress.addressLine || ''} 
                            onChange={e => setEditingAddress({...editingAddress, addressLine: e.target.value})} />
                        </div>
                        <div className="pf-input-group">
                          <label>Ward (Phường/Xã)</label>
                          <input className="pf-input-basic" required value={editingAddress.ward || ''} 
                            onChange={e => setEditingAddress({...editingAddress, ward: e.target.value})} />
                        </div>
                        <div className="pf-input-group">
                          <label>District (Quận/Huyện)</label>
                          <input className="pf-input-basic" required value={editingAddress.district || ''} 
                            onChange={e => setEditingAddress({...editingAddress, district: e.target.value})} />
                        </div>
                        <div className="pf-input-group">
                          <label>City (Tỉnh/Thành phố)</label>
                          <input className="pf-input-basic" required value={editingAddress.city || ''} 
                            onChange={e => setEditingAddress({...editingAddress, city: e.target.value})} />
                        </div>
                        <div className="pf-input-group">
                          <label>Zip Code</label>
                          <input className="pf-input-basic" value={editingAddress.zipCode || ''} 
                            onChange={e => setEditingAddress({...editingAddress, zipCode: e.target.value})} />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" disabled={isUpdating} className="pf-btn-primary">
                           {isUpdating ? <Loader2 className="animate-spin" size={18} /> : 'Save Address'}
                        </button>
                        <button type="button" onClick={() => setEditingAddress(null)} className="pf-btn-secondary">Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <div className="pf-address-list">
                      {addresses.map(addr => (
                        <div key={addr.id} className={`pf-address-item ${addr.isDefault ? 'active' : ''}`}>
                          <MapPin size={18} className="text-blue-500 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-bold text-sm text-slate-800">{addr.addressLine}</p>
                            <p className="text-xs text-slate-500">{[addr.ward, addr.district, addr.city].filter(Boolean).join(', ')}</p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => setEditingAddress(addr)} className="pf-action-btn edit"><Edit2 size={14}/></button>
                            {!addr.isDefault && <button onClick={() => handleDeleteAddress(addr.id)} className="pf-action-btn delete"><Trash2 size={14}/></button>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="pf-orders-list">
                {orders.map(order => (
                  <div key={order.id} className="pf-order-card">
                    <div className="pf-order-icon"><Package size={24} /></div>
                    <div className="pf-order-details">
                      <div className="pf-order-row">
                        <span className="pf-order-id">Order #{order.id}</span>
                        <span className={`pf-status-badge ${order.status?.toLowerCase()}`}>{order.status}</span>
                      </div>
                      <div className="pf-order-meta">
                        <span><Calendar size={12} /> {new Date(order.createdAt).toLocaleDateString()}</span>
                        <span><CreditCard size={12} /> {order.totalAmount?.toLocaleString()} VND</span>
                      </div>
                    </div>
                    <button className="pf-btn-icon"><ExternalLink size={18} /></button>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}

const css = `
  .pf-container { max-width: 1100px; margin: 40px auto; padding: 0 20px; font-family: sans-serif; }
  .pf-header-card { background: #1e293b; border-radius: 24px; padding: 40px; color: white; display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
  .pf-avatar-circle { width: 70px; height: 70px; background: #3b82f6; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: bold; }
  .pf-layout { display: grid; grid-template-columns: 280px 1fr; gap: 30px; }
  .pf-sidebar { background: white; border-radius: 24px; padding: 15px; border: 1px solid #e2e8f0; height: fit-content; }
  .pf-nav-item { width: 100%; display: flex; align-items: center; gap: 12px; padding: 12px 15px; border-radius: 12px; border: none; background: transparent; cursor: pointer; color: #64748b; font-weight: 500; text-align: left; }
  .pf-nav-item.active { background: #eff6ff; color: #2563eb; }
  .pf-card { background: white; border-radius: 24px; padding: 30px; border: 1px solid #e2e8f0; }
  .pf-input-group label { font-size: 13px; font-weight: 600; color: #475569; display: block; margin-bottom: 5px; }
  .pf-input-basic, .pf-input-wrapper input { width: 100%; padding: 10px 15px; border-radius: 12px; border: 1px solid #e2e8f0; outline: none; }
  .pf-input-wrapper { position: relative; display: flex; align-items: center; }
  .pf-input-wrapper svg { position: absolute; left: 12px; color: #94a3b8; }
  .pf-input-wrapper input { padding-left: 40px; }
  .pf-btn-primary { background: #2563eb; color: white; border: none; padding: 12px 24px; border-radius: 12px; cursor: pointer; font-weight: 600; }
  .pf-address-item { display: flex; align-items: center; gap: 15px; padding: 15px; border: 1px solid #f1f5f9; border-radius: 16px; margin-bottom: 10px; }
  .pf-address-item.active { border-color: #3b82f6; background: #f0f7ff; }
  .pf-status-badge { font-size: 10px; padding: 3px 8px; border-radius: 5px; font-weight: bold; }
  .pf-order-card { background: white; border-radius: 16px; padding: 15px; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 15px; margin-bottom: 10px; }
`;