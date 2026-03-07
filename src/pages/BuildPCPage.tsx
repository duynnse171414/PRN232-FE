import React, { useEffect, useMemo, useState } from 'react';
import { BuildConfig, Product } from '../types';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Cpu, Monitor, HardDrive, Activity, Zap, ShoppingCart, Check, AlertCircle, Save } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { buildPcService, BuildPcComponentTypeDto } from '../services/buildPcService';

type ComponentType = 'cpu' | 'gpu' | 'motherboard' | 'ram' | 'storage';

const componentCategories: { type: ComponentType; label: string; icon: any }[] = [
  { type: 'cpu', label: 'Processor (CPU)', icon: Cpu },
  { type: 'gpu', label: 'Graphics Card (GPU)', icon: Monitor },
  { type: 'motherboard', label: 'Motherboard', icon: Activity },
  { type: 'ram', label: 'Memory (RAM)', icon: Zap },
  { type: 'storage', label: 'Storage', icon: HardDrive },
];

function normalizeName(name?: string) {
  return (name || '').toLowerCase();
}

function mapNameToType(name?: string): ComponentType | null {
  const x = normalizeName(name);
  if (x.includes('cpu') || x.includes('processor')) return 'cpu';
  if (x.includes('gpu') || x.includes('graphics') || x.includes('vga')) return 'gpu';
  if (x.includes('mainboard') || x.includes('motherboard')) return 'motherboard';
  if (x.includes('ram') || x.includes('memory')) return 'ram';
  if (x.includes('storage') || x.includes('ssd') || x.includes('hdd')) return 'storage';
  return null;
}

function mapBackendProduct(item: any): Product {
  return {
    id: String(item.id),
    name: item.name || 'Unnamed product',
    category: item.categoryName || 'Other',
    price: item.price ?? 0,
    image: item.imageUrls?.[0] || '',
    description: item.description || '',
    specifications: {},
    stock: item.stock ?? 0,
    rating: 4.5,
    reviews: 0,
    brand: item.brandName || '',
  };
}

export function BuildPCPage() {
  const [build, setBuild] = useState<BuildConfig>({});
  const [selectedType, setSelectedType] = useState<ComponentType | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [componentsFromApi, setComponentsFromApi] = useState<BuildPcComponentTypeDto[]>([]);
  const [loadingComponents, setLoadingComponents] = useState(false);
  const [savingBuild, setSavingBuild] = useState(false);
  const [myBuilds, setMyBuilds] = useState<Array<{
    id: number;
    name: string;
    totalPrice: number;
    createdAt: string;
    items: Array<{
      componentTypeName: string;
      productName: string;
      quantity: number;
    }>;
  }>>([]);
  const [loadingMyBuilds, setLoadingMyBuilds] = useState(false);
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const load = async () => {
      setLoadingComponents(true);
      try {
        const list = await buildPcService.getComponents();
        setComponentsFromApi(list || []);
      } catch (error: any) {
        toast.error(error?.message || 'Failed to load Build PC components');
        setComponentsFromApi([]);
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

  const componentTypeIdByUiType = useMemo(() => {
    const map: Partial<Record<ComponentType, number>> = {};
    for (const ct of componentsFromApi) {
      const uiType = mapNameToType(ct.name);
      if (uiType) {
        map[uiType] = ct.id;
      }
    }
    return map;
  }, [componentsFromApi]);

  const productsByUiType = useMemo(() => {
    const map: Partial<Record<ComponentType, Product[]>> = {};
    for (const ct of componentsFromApi) {
      const uiType = mapNameToType(ct.name);
      if (!uiType) continue;
      map[uiType] = (ct.products || []).map(mapBackendProduct);
    }
    return map;
  }, [componentsFromApi]);

  const handleSelectComponent = (type: ComponentType) => {
    setSelectedType(type);
    setDialogOpen(true);
  };

  const handleComponentChoice = (product: Product) => {
    setBuild((prev) => ({ ...prev, [selectedType as ComponentType]: product }));
    setDialogOpen(false);
    toast.success(`${product.name} added to build`);
  };

  const handleRemoveComponent = (type: ComponentType) => {
    setBuild((prev) => {
      const newBuild = { ...prev };
      delete newBuild[type];
      return newBuild;
    });
    toast.success('Component removed from build');
  };

  const handleAddToCart = async () => {
    const components = Object.values(build);
    if (components.length === 0) {
      toast.error('Please add components to your build');
      return;
    }

    for (const component of components) {
      await addToCart(component as Product);
    }

    toast.success(`All ${components.length} components added to cart!`);
  };

  const handleSaveBuild = async () => {
    const entries = Object.entries(build) as [ComponentType, Product | undefined][];
    const selected = entries.filter(([, p]) => !!p) as [ComponentType, Product][];

    if (selected.length === 0) {
      toast.error('Please choose at least one component before saving');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please login to save your build');
      return;
    }

    setSavingBuild(true);
    try {
      const payload = {
        userId: Number(user?.id),
        name: `Build ${new Date().toLocaleString()}`,
        items: selected
          .map(([type, product]) => {
            const componentTypeId = componentTypeIdByUiType[type];
            if (!componentTypeId) return null;
            return {
              componentTypeId,
              productId: Number(product.id),
              quantity: 1,
            };
          })
          .filter((x): x is { componentTypeId: number; productId: number; quantity: number } => !!x),
      };

      if (payload.items.length === 0) {
        toast.error('No mapped component type found from backend. Please check BuildPC components config.');
        return;
      }

      const saved = await buildPcService.createBuild(payload);
      toast.success(`Build saved successfully (#${saved.id})`);

      try {
        const list = await buildPcService.getMyBuilds();
        setMyBuilds(list || []);
      } catch {
        // ignore refresh failure
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save build');
    } finally {
      setSavingBuild(false);
    }
  };

  const totalPrice = Object.values(build).reduce((sum, component) => sum + (component?.price || 0), 0);
  const completedComponents = Object.keys(build).length;
  const requiredComponents = 5;

  const availableProducts = selectedType ? productsByUiType[selectedType] || [] : [];
  const warnings: string[] = [];

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
            {componentCategories.map(({ type, label, icon: Icon }) => {
              const component = build[type];
              return (
                <Card key={type}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="size-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Icon className="size-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold mb-1">{label}</h3>
                        {component ? (
                          <div className="flex items-start gap-4">
                            <ImageWithFallback src={component.image} alt={component.name} className="size-16 object-cover rounded" />
                            <div className="flex-1">
                              <p className="font-medium">{component.name}</p>
                              <p className="text-sm text-gray-600">{component.brand}</p>
                              <p className="font-bold text-blue-600 mt-1">${component.price.toFixed(2)}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No component selected</p>
                        )}
                      </div>
                      <div className="flex-shrink-0 flex gap-2">
                        {component && (
                          <Button variant="outline" size="sm" onClick={() => handleRemoveComponent(type)}>
                            Remove
                          </Button>
                        )}
                        <Button size="sm" onClick={() => handleSelectComponent(type)}>
                          {component ? 'Change' : 'Select'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {warnings.length > 0 && (
              <Card className="border-orange-300 bg-orange-50">
                <CardContent className="p-6">
                  <div className="flex gap-3">
                    <AlertCircle className="size-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-orange-900 mb-2">Compatibility Warnings</h3>
                      <ul className="space-y-1 text-sm text-orange-800">
                        {warnings.map((warning, index) => (
                          <li key={index}>• {warning}</li>
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
                    <span className="font-semibold">{completedComponents}/{requiredComponents}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${(completedComponents / requiredComponents) * 100}%` }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Components</h4>
                  {componentCategories.map(({ type, label, icon: Icon }) => (
                    <div key={type} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Icon className="size-4 text-gray-400" />
                        <span className="text-gray-600">{label}</span>
                      </div>
                      {build[type] ? <Check className="size-4 text-green-600" /> : <span className="text-xs text-gray-400">Not selected</span>}
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold">Total Price</span>
                    <span className="text-2xl font-bold text-blue-600">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="space-y-2">
                    <Button className="w-full" size="lg" onClick={handleAddToCart} disabled={completedComponents === 0}>
                      <ShoppingCart className="size-5 mr-2" />Add All to Cart
                    </Button>
                    <Button className="w-full" variant="outline" onClick={handleSaveBuild} disabled={completedComponents === 0 || savingBuild}>
                      <Save className="size-4 mr-2" />{savingBuild ? 'Saving...' : 'Save Build'}
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
                        <span className="text-sm font-semibold text-blue-600">${b.totalPrice.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">#{b.id} • {new Date(b.createdAt).toLocaleString()}</p>
                      <div className="text-sm text-gray-700 space-y-1">
                        {b.items.slice(0, 4).map((it, idx) => (
                          <div key={idx}>
                            {it.componentTypeName}: {it.productName} x {it.quantity}
                          </div>
                        ))}
                        {b.items.length > 4 && <div className="text-xs text-gray-500">+{b.items.length - 4} more items</div>}
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
              <DialogTitle>Select {componentCategories.find((c) => c.type === selectedType)?.label}</DialogTitle>
            </DialogHeader>
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              {availableProducts.map((product) => (
                <Card key={product.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleComponentChoice(product)}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <ImageWithFallback src={product.image} alt={product.name} className="size-20 object-cover rounded" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold line-clamp-2 mb-1">{product.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-blue-600">${product.price.toFixed(2)}</p>
                          {product.stock < 10 && (
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
