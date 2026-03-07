import React, { useState } from 'react';
import { products } from '../data/products';
import { BuildConfig, Product } from '../types';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Cpu, Monitor, HardDrive, Activity, Zap, Box, Snowflake, ShoppingCart, Check, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

type ComponentType = 'cpu' | 'gpu' | 'motherboard' | 'ram' | 'storage' | 'psu' | 'case' | 'cooler';

const componentCategories: { type: ComponentType; label: string; icon: any; category: string }[] = [
  { type: 'cpu', label: 'Processor (CPU)', icon: Cpu, category: 'CPU' },
  { type: 'gpu', label: 'Graphics Card (GPU)', icon: Monitor, category: 'GPU' },
  { type: 'motherboard', label: 'Motherboard', icon: Activity, category: 'Motherboard' },
  { type: 'ram', label: 'Memory (RAM)', icon: Zap, category: 'RAM' },
  { type: 'storage', label: 'Storage', icon: HardDrive, category: 'Storage' },
];

export function BuildPCPage() {
  const [build, setBuild] = useState<BuildConfig>({});
  const [selectedType, setSelectedType] = useState<ComponentType | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { addToCart } = useCart();

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

  const handleAddToCart = () => {
    const components = Object.values(build);
    if (components.length === 0) {
      toast.error('Please add components to your build');
      return;
    }
    components.forEach((component) => {
      addToCart(component as Product);
    });
    toast.success(`All ${components.length} components added to cart!`);
  };

  const totalPrice = Object.values(build).reduce(
    (sum, component) => sum + (component?.price || 0),
    0
  );

  const completedComponents = Object.keys(build).length;
  const requiredComponents = 5; // CPU, GPU, Motherboard, RAM, Storage

  const availableProducts = selectedType
    ? products.filter(
        (p) =>
          p.category ===
          componentCategories.find((c) => c.type === selectedType)?.category
      )
    : [];

  const getCompatibilityWarning = () => {
    const warnings: string[] = [];

    // Check CPU and Motherboard socket compatibility
    if (build.cpu && build.motherboard) {
      const cpuSocket = build.cpu.specifications.Socket;
      const moboSocket = build.motherboard.specifications.Socket;
      if (cpuSocket !== moboSocket) {
        warnings.push(`CPU socket (${cpuSocket}) doesn't match motherboard socket (${moboSocket})`);
      }
    }

    return warnings;
  };

  const warnings = getCompatibilityWarning();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">PC Builder</h1>
          <p className="text-gray-600">
            Build your custom PC by selecting components
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Component Selection */}
          <div className="lg:col-span-2 space-y-4">
            {componentCategories.map(({ type, label, icon: Icon, category }) => {
              const component = build[type];
              return (
                <Card key={type}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="size-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Icon className="size-6 text-blue-600" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold mb-1">{label}</h3>
                        {component ? (
                          <div className="flex items-start gap-4">
                            <ImageWithFallback
                              src={component.image}
                              alt={component.name}
                              className="size-16 object-cover rounded"
                            />
                            <div className="flex-1">
                              <p className="font-medium">{component.name}</p>
                              <p className="text-sm text-gray-600">{component.brand}</p>
                              <p className="font-bold text-blue-600 mt-1">
                                ${component.price.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No component selected</p>
                        )}
                      </div>

                      <div className="flex-shrink-0 flex gap-2">
                        {component && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveComponent(type)}
                          >
                            Remove
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() => handleSelectComponent(type)}
                        >
                          {component ? 'Change' : 'Select'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Compatibility Warnings */}
            {warnings.length > 0 && (
              <Card className="border-orange-300 bg-orange-50">
                <CardContent className="p-6">
                  <div className="flex gap-3">
                    <AlertCircle className="size-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-orange-900 mb-2">
                        Compatibility Warnings
                      </h3>
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

          {/* Build Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Build Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold">
                      {completedComponents}/{requiredComponents}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${(completedComponents / requiredComponents) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Components List */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Components</h4>
                  {componentCategories.map(({ type, label, icon: Icon }) => (
                    <div
                      key={type}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="size-4 text-gray-400" />
                        <span className="text-gray-600">{label}</span>
                      </div>
                      {build[type] ? (
                        <Check className="size-4 text-green-600" />
                      ) : (
                        <span className="text-xs text-gray-400">Not selected</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="pt-4 border-t space-y-2">
                  {Object.entries(build).map(([key, component]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-600 truncate">
                        {componentCategories.find((c) => c.type === key)?.label}
                      </span>
                      <span className="font-semibold">
                        ${component?.price.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold">Total Price</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={completedComponents === 0}
                  >
                    <ShoppingCart className="size-5 mr-2" />
                    Add All to Cart
                  </Button>
                </div>

                {/* Info */}
                <div className="bg-blue-50 p-4 rounded-lg text-sm">
                  <p className="font-semibold text-blue-900 mb-1">
                    Build Tips
                  </p>
                  <ul className="space-y-1 text-blue-800">
                    <li>• Check CPU and motherboard compatibility</li>
                    <li>• Ensure adequate PSU wattage</li>
                    <li>• Verify case can fit GPU length</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Component Selection Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Select{' '}
                {componentCategories.find((c) => c.type === selectedType)?.label}
              </DialogTitle>
            </DialogHeader>
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              {availableProducts.map((product) => (
                <Card
                  key={product.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleComponentChoice(product)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <ImageWithFallback
                        src={product.image}
                        alt={product.name}
                        className="size-20 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold line-clamp-2 mb-1">
                          {product.name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {product.brand}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-blue-600">
                            ${product.price.toFixed(2)}
                          </p>
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
