import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Separator } from '../components/ui/separator';
import { CreditCard, Truck, Package, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { AddressOption } from '../types';
import { orderService, OrderDto } from '../services/orderService';
import { addressService } from '../services/addressService';

export function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<number | null>(null);
  const [addressOptions, setAddressOptions] = useState<AddressOption[]>([]);

  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    addressId: '1',
    notes: '',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    deliveryMethod: 'standard',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setAddressOptions([]);
      return;
    }

    const loadAddresses = async () => {
      const mapped = await addressService.getMyAddresses();
      if (mapped.length > 0) {
        setAddressOptions(mapped);
        setFormData((prev) => ({ ...prev, addressId: String(mapped[0].id) }));
        return;
      }

      setAddressOptions([]);
    };

    loadAddresses();
  }, [isAuthenticated]);

  const shippingCost = totalPrice > 50 ? 0 : 9.99;
  const taxRate = 0.08;
  const tax = totalPrice * taxRate;
  const deliveryFee =
    formData.deliveryMethod === 'express'
      ? 19.99
      : formData.deliveryMethod === 'overnight'
      ? 39.99
      : 0;
  const finalTotal = totalPrice + shippingCost + tax + deliveryFee;

  if (cart.length === 0 && !orderPlaced) {
    navigate('/cart');
    return null;
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.address ||
      !formData.city ||
      !formData.zipCode
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.cardNumber || !formData.cardName || !formData.expiryDate || !formData.cvv) {
      toast.error('Please fill in payment information');
      return;
    }

    setLoading(true);
    try {
      const combinedNotes = [
        `delivery=${formData.deliveryMethod}`,
        `${formData.address}, ${formData.city}`,
        formData.notes?.trim() || '',
      ]
        .filter(Boolean)
        .join(' | ');

      const addressId = Number(formData.addressId || '0');
      let order: OrderDto;

      if (isAuthenticated) {
        order = await orderService.checkoutFromCart({
          addressId: addressId > 0 ? addressId : undefined,
          notes: combinedNotes,
        });
      } else {
        order = await orderService.placeOrder({
          guestName: `${formData.firstName} ${formData.lastName}`.trim(),
          guestEmail: formData.email,
          guestPhone: formData.phone,
          addressId: addressId > 0 ? addressId : undefined,
          notes: combinedNotes,
          paymentMethod: 'cod',
          items: cart.map((item) => ({
            productId: Number(item.product.id),
            quantity: item.quantity,
          })),
        });
      }

      setPlacedOrderId(order.id);
      setOrderPlaced(true);
      await clearCart();
      toast.success('Order placed successfully!');
    } catch (error: any) {
      toast.error(error?.message || 'Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="inline-flex items-center justify-center size-16 bg-green-100 rounded-full mb-4">
              <CheckCircle2 className="size-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
            <p className="text-gray-600 mb-2">
              Thank you for your order. We've sent a confirmation email to{' '}
              <strong>{formData.email}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-2">
              Order ID: <strong>#{placedOrderId}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Order Total: <strong>${finalTotal.toFixed(2)}</strong>
            </p>
            <div className="space-y-2">
              <Button className="w-full" onClick={() => navigate('/')}>
                Continue Shopping
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/products')}
              >
                Browse Products
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="size-5" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input id="firstName" value={formData.firstName} onChange={(e) => handleChange('firstName', e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input id="lastName" value={formData.lastName} onChange={(e) => handleChange('lastName', e.target.value)} required />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" type="tel" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Street Address *</Label>
                    <Input id="address" value={formData.address} onChange={(e) => handleChange('address', e.target.value)} required />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="addressId">Address</Label>
                      {isAuthenticated && addressOptions.length > 0 ? (
                        <Select value={formData.addressId} onValueChange={(value: string) => handleChange('addressId', value)}>
                          <SelectTrigger id="addressId">
                            <SelectValue placeholder="Select address" />
                          </SelectTrigger>
                          <SelectContent>
                            {addressOptions.map((opt) => (
                              <SelectItem key={opt.id} value={String(opt.id)}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id="addressId"
                          type="number"
                          min={1}
                          value={formData.addressId}
                          onChange={(e) => handleChange('addressId', e.target.value)}
                          placeholder="1"
                        />
                      )}
                    </div>
                    <div>
                      <Label htmlFor="notes">Order Notes</Label>
                      <Input
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => handleChange('notes', e.target.value)}
                        placeholder="e.g. Call before delivery"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input id="city" value={formData.city} onChange={(e) => handleChange('city', e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input id="state" value={formData.state} onChange={(e) => handleChange('state', e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code *</Label>
                      <Input id="zipCode" value={formData.zipCode} onChange={(e) => handleChange('zipCode', e.target.value)} required />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="size-5" />
                    Delivery Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={formData.deliveryMethod} onValueChange={(value: string) => handleChange('deliveryMethod', value)}>
                    <div className="flex items-center justify-between p-4 border rounded-lg mb-3">
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="standard" id="standard" />
                        <Label htmlFor="standard" className="cursor-pointer">
                          <div className="font-semibold">Standard Delivery</div>
                          <div className="text-sm text-gray-600">5-7 business days</div>
                        </Label>
                      </div>
                      <span className="font-semibold text-green-600">FREE</span>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg mb-3">
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="express" id="express" />
                        <Label htmlFor="express" className="cursor-pointer">
                          <div className="font-semibold">Express Delivery</div>
                          <div className="text-sm text-gray-600">2-3 business days</div>
                        </Label>
                      </div>
                      <span className="font-semibold">$19.99</span>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="overnight" id="overnight" />
                        <Label htmlFor="overnight" className="cursor-pointer">
                          <div className="font-semibold">Overnight Delivery</div>
                          <div className="text-sm text-gray-600">Next business day</div>
                        </Label>
                      </div>
                      <span className="font-semibold">$39.99</span>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="size-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">Card Number *</Label>
                    <Input id="cardNumber" placeholder="1234 5678 9012 3456" value={formData.cardNumber} onChange={(e) => handleChange('cardNumber', e.target.value)} maxLength={19} required />
                  </div>

                  <div>
                    <Label htmlFor="cardName">Cardholder Name *</Label>
                    <Input id="cardName" placeholder="John Doe" value={formData.cardName} onChange={(e) => handleChange('cardName', e.target.value)} required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate">Expiry Date *</Label>
                      <Input id="expiryDate" placeholder="MM/YY" value={formData.expiryDate} onChange={(e) => handleChange('expiryDate', e.target.value)} maxLength={5} required />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV *</Label>
                      <Input id="cvv" placeholder="123" value={formData.cvv} onChange={(e) => handleChange('cvv', e.target.value)} maxLength={4} required />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.product.name} x {item.quantity}
                        </span>
                        <span className="font-semibold">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold">${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-semibold">
                        {shippingCost === 0 ? <span className="text-green-600">FREE</span> : `$${shippingCost.toFixed(2)}`}
                      </span>
                    </div>
                    {deliveryFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {formData.deliveryMethod === 'express' ? 'Express' : 'Overnight'} Delivery
                        </span>
                        <span className="font-semibold">${deliveryFee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-semibold">${tax.toFixed(2)}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg">
                    <span className="font-bold">Total</span>
                    <span className="font-bold">${finalTotal.toFixed(2)}</span>
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? 'Processing...' : 'Place Order'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
