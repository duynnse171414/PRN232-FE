import React, { useEffect, useMemo, useState } from 'react';
import { Product } from '../types';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import {
  Cpu,
  Monitor,
  HardDrive,
  Activity,
  Zap,
  ShoppingCart,
  Check,
  AlertCircle,
  Save,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import {
  buildPcService,
  BuildPcComponentTypeDto,
  BuildPcProductDto,
  BuildResponseDto,
} from '../services/buildPcService';

type SelectedMap = Record<number, { productId: number; quantity: number }>;

const iconByName: Array<{ keyword: string; icon: any }> = [
  { keyword: 'cpu', icon: Cpu },
  { keyword: 'processor', icon: Cpu },
  { keyword: 'gpu', icon: Monitor },
  { keyword: 'graphics', icon: Monitor },
  { keyword: 'vga', icon: Monitor },
  { keyword: 'motherboard', icon: Activity },
  { keyword: 'mainboard', icon: Activity },
  { keyword: 'ram', icon: Zap },
  { keyword: 'memory', icon: Zap },
  { keyword: 'storage', icon: HardDrive },
  { keyword: 'ssd', icon: HardDrive },
  { keyword: 'hdd', icon: HardDrive },
];

function getIconForComponent(name: string) {
  const lower = (name || '').toLowerCase();
  const matched = iconByName.find((x) => lower.includes(x.keyword));
  return matched?.icon || Cpu;
}

function mapBuildProductToProduct(item: BuildPcProductDto): Product {
  return {
    id: String(item.id),
    name: item.name || 'Unnamed product',
    category: 'PC Component',
    price: Number(item.price ?? 0),
    image: item.imageUrls?.[0] || '',
    description: '',
    specifications: {},
    stock: Number(item.stock ?? 0),
    rating: 4.5,
    reviews: 0,
    brand: '',
  };
}

export function BuildPCPage() {
  const [componentTypes, setComponentTypes] = useState<BuildPcComponentTypeDto[]>([]);
  const [selectedMap, setSelectedMap] = useState<SelectedMap>({});
  const [selectedComponentType, setSelectedComponentType] = useState<BuildPcComponentTypeDto | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loadingComponents, setLoadingComponents] = useState(false);
  const [savingBuild, setSavingBuild] = useState(false);
  const [myBuilds, setMyBuilds] = useState<BuildResponseDto[]>([]);
  const [loadingMyBuilds, setLoadingMyBuilds] = useState(false);

  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const load = async () => {
      setLoadingComponents(true);
      try {
        const list = await buildPcService.getComponents();
        const sorted = [...(list || [])].sort((a, b) => a.sortOrder - b.sortOrder);
        setComponentTypes(sorted);
      } catch (error: any) {
        toast.error(error?.message || 'Failed to load Build PC components');
        setComponentTypes([]);
      } finally {
        setLoadingComponents(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setMyBuilds([]);
      return;
    }

    const loadMyBuilds = async () => {
      setLoadingMyBuilds(true);
      try {
        const list = await buildPcService.getMyBuilds();
        setMyBuilds(list || []);
      } catch {
        setMyBuilds([]);
      } finally {
        setLoadingMyBuilds(false);
      }
    };

    loadMyBuilds();
  }, [isAuthenticated]);

  const productLookup = useMemo(() => {
    const map = new Map<number, BuildPcProductDto>();
    for (const ct of componentTypes) {
      for (const p of ct.products || []) {
        map.set(p.id, p);
      }
    }
    return map;
  }, [componentTypes]);

  const selectedProductByType = useMemo(() => {
    const map = new Map<number, BuildPcProductDto>();
    for (const ct of componentTypes) {
      const selected = selectedMap[ct.id];
      if (!selected) continue;
      const found = (ct.products || []).find((p) => p.id === selected.productId);
      if (found) map.set(ct.id, found);
    }
    return map;
  }, [componentTypes, selectedMap]);

  const selectedCount = Object.keys(selectedMap).length;
  const requiredCount = componentTypes.filter((x) => x.isRequired).length;

  const totalPrice = useMemo(() => {
    let sum = 0;
    for (const selected of Object.values(selectedMap)) {
      const product = productLookup.get(selected.productId);
      if (!product) continue;
      sum += Number(product.price ?? 0) * Number(selected.quantity ?? 1);
    }
    return sum;
  }, [selectedMap, productLookup]);

  const missingRequired = useMemo(
    () =>
      componentTypes
        .filter((ct) => ct.isRequired && !selectedMap[ct.id])
        .map((ct) => ct.name),
    [componentTypes, selectedMap]
  );

  const openSelectDialog = (ct: BuildPcComponentTypeDto) => {
    setSelectedComponentType(ct);
    setDialogOpen(true);
  };

  const handleChooseProduct = (componentTypeId: number, productId: number) => {
    setSelectedMap((prev) => ({
      ...prev,
      [componentTypeId]: { productId, quantity: 1 },
    }));
    setDialogOpen(false);

    const p = productLookup.get(productId);
    if (p) toast.success(`${p.name} added to build`);
  };

  const handleRemoveComponent = (componentTypeId: number) => {
    setSelectedMap((prev) => {
      const next = { ...prev };
      delete next[componentTypeId];
      return next;
    });
    toast.success('Component removed from build');
  };

  const handleAddToCart = async () => {
    const selectedEntries = Object.values(selectedMap);
    if (selectedEntries.length === 0) {
      toast.error('Please add components to your build');
      return;
    }

    for (const item of selectedEntries) {
      const p = productLookup.get(item.productId);
      if (!p) continue;
      await addToCart(mapBuildProductToProduct(p), item.quantity);
    }

    toast.success(`All ${selectedEntries.length} components added to cart!`);
  };

  const handleSaveBuild = async () => {
    const items = Object.entries(selectedMap).map(([componentTypeId, v]) => ({
      componentTypeId: Number(componentTypeId),
      productId: v.productId,
      quantity: v.quantity,
    }));

    if (items.length === 0) {
      toast.error('Please choose at least one component before saving');
      return;
    }

    if (missingRequired.length > 0) {
      toast.error(`Missing required components: ${missingRequired.join(', ')}`);
      return;
    }

    setSavingBuild(true);
    try {
      const payload = {
        userId: null,
        name: `Build ${new Date().toLocaleString()}`,
        items,
      };

      const saved = await buildPcService.createBuild(payload);
      toast.success(`Build saved successfully (#${saved.id})`);

      if (isAuthenticated) {
        try {
          const list = await buildPcService.getMyBuilds();
          setMyBuilds(list || []);
        } catch {
          // ignore reload failure
        }
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save build');
    } finally {
      setSavingBuild(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">PC Builder</h1>
          <p className="text-gray-600">Build your custom PC by selecting components</p>
          {loadingComponents && <p className="text-sm text-gray-500 mt-2">Loading components from API...</p>}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {componentTypes.map((ct) => {
              const Icon = getIconForComponent(ct.name);
              const selected = selectedProductByType.get(ct.id);

              return (
                <Card key={ct.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="size-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Icon className="size-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{ct.name}</h3>
                          {ct.isRequired && <Badge variant="outline">Required</Badge>}
                        </div>

                        {selected ? (
                          <div className="flex items-start gap-4">
                            <ImageWithFallback
                              src={selected.imageUrls?.[0] || ''}
                              alt={selected.name}
                              className="size-16 object-cover rounded"
                            />
                            <div className="flex-1">
                              <p className="font-medium">{selected.name}</p>
                              <p className="font-bold text-blue-600 mt-1">${Number(selected.price ?? 0).toFixed(2)}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No component selected</p>
                        )}
                      </div>
                      <div className="flex-shrink-0 flex gap-2">
                        {selected && (
                          <Button variant="outline" size="sm" onClick={() => handleRemoveComponent(ct.id)}>
                            Remove
                          </Button>
                        )}
                        <Button size="sm" onClick={() => openSelectDialog(ct)}>
                          {selected ? 'Change' : 'Select'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {missingRequired.length > 0 && (
              <Card className="border-orange-300 bg-orange-50">
                <CardContent className="p-6">
                  <div className="flex gap-3">
                    <AlertCircle className="size-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-orange-900 mb-2">Missing Required Components</h3>
                      <ul className="space-y-1 text-sm text-orange-800">
                        {missingRequired.map((name) => (
                          <li key={name}>• {name}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Build Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold">
                      {selectedCount}/{requiredCount || componentTypes.length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${
                          ((selectedCount / Math.max(requiredCount || componentTypes.length, 1)) * 100).toFixed(0)
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Components</h4>
                  {componentTypes.map((ct) => {
                    const Icon = getIconForComponent(ct.name);
                    return (
                      <div key={ct.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Icon className="size-4 text-gray-400" />
                          <span className="text-gray-600">{ct.name}</span>
                        </div>
                        {selectedMap[ct.id] ? (
                          <Check className="size-4 text-green-600" />
                        ) : (
                          <span className="text-xs text-gray-400">Not selected</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold">Total Price</span>
                    <span className="text-2xl font-bold text-blue-600">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="space-y-2">
                    <Button className="w-full" size="lg" onClick={handleAddToCart} disabled={selectedCount === 0}>
                      <ShoppingCart className="size-5 mr-2" />Add All to Cart
                    </Button>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={handleSaveBuild}
                      disabled={selectedCount === 0 || savingBuild}
                    >
                      <Save className="size-4 mr-2" />
                      {savingBuild ? 'Saving...' : 'Save Build'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {isAuthenticated && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>My Builds</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingMyBuilds ? (
                <p className="text-sm text-gray-500">Loading your saved builds...</p>
              ) : myBuilds.length === 0 ? (
                <p className="text-sm text-gray-500">You have no saved builds yet.</p>
              ) : (
                <div className="space-y-4">
                  {myBuilds.map((b) => (
                    <div key={b.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{b.name}</h4>
                        <span className="text-sm font-semibold text-blue-600">${Number(b.totalPrice ?? 0).toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">
                        #{b.id} • {new Date(b.createdAt).toLocaleString()}
                      </p>
                      <div className="text-sm text-gray-700 space-y-1">
                        {b.items.slice(0, 4).map((it, idx) => (
                          <div key={idx}>
                            {it.componentTypeName}: {it.productName} x {it.quantity}
                          </div>
                        ))}
                        {b.items.length > 4 && (
                          <div className="text-xs text-gray-500">+{b.items.length - 4} more items</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Select {selectedComponentType?.name}</DialogTitle>
            </DialogHeader>
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              {(selectedComponentType?.products || []).map((product) => (
                <Card
                  key={product.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => selectedComponentType && handleChooseProduct(selectedComponentType.id, product.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <ImageWithFallback
                        src={product.imageUrls?.[0] || ''}
                        alt={product.name}
                        className="size-20 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold line-clamp-2 mb-1">{product.name}</h4>
                        <div className="flex items-center justify-between mt-2">
                          <p className="font-bold text-blue-600">${Number(product.price ?? 0).toFixed(2)}</p>
                          {Number(product.stock ?? 0) < 10 && (
                            <Badge variant="outline" className="text-xs">
                              {product.stock} left
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
