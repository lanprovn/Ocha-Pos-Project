import {
    Button,
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
    Input,
    Badge,
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui';

/**
 * Shadcn/UI Components Showcase
 * Demo page showing all available components
 */
export default function UIShowcase() {
    return (
        <div className="container mx-auto p-8 space-y-8">
            <div className="space-y-2">
                <h1 className="text-4xl font-bold">Shadcn/UI Components</h1>
                <p className="text-gray-600">
                    Modern, accessible, and customizable UI components for OCHA POS
                </p>
            </div>

            {/* Buttons */}
            <Card>
                <CardHeader>
                    <CardTitle>Buttons</CardTitle>
                    <CardDescription>
                        Different button variants and sizes
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-3">
                        <Button variant="default">Default</Button>
                        <Button variant="secondary">Secondary</Button>
                        <Button variant="destructive">Destructive</Button>
                        <Button variant="outline">Outline</Button>
                        <Button variant="ghost">Ghost</Button>
                        <Button variant="link">Link</Button>
                        <Button variant="success">Success</Button>
                        <Button variant="warning">Warning</Button>
                    </div>

                    <div className="flex flex-wrap gap-3 items-center">
                        <Button size="sm">Small</Button>
                        <Button size="default">Default</Button>
                        <Button size="lg">Large</Button>
                        <Button size="xl">Extra Large</Button>
                        <Button size="icon">🔥</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Sales</CardTitle>
                        <CardDescription>Today's revenue</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">₫2,450,000</div>
                        <Badge variant="success" className="mt-2">+15.3%</Badge>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Orders</CardTitle>
                        <CardDescription>Pending orders</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">24</div>
                        <Badge variant="warning" className="mt-2">3 urgent</Badge>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Products</CardTitle>
                        <CardDescription>Low stock items</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">8</div>
                        <Badge variant="destructive" className="mt-2">Need restock</Badge>
                    </CardContent>
                </Card>
            </div>

            {/* Inputs */}
            <Card>
                <CardHeader>
                    <CardTitle>Form Inputs</CardTitle>
                    <CardDescription>
                        Input fields with modern styling
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input type="email" placeholder="admin@ocha.com" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Password</label>
                            <Input type="password" placeholder="••••••••" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Product Name</label>
                            <Input placeholder="Cà Phê Americano" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Price</label>
                            <Input type="number" placeholder="45000" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Badges */}
            <Card>
                <CardHeader>
                    <CardTitle>Badges</CardTitle>
                    <CardDescription>
                        Status indicators and labels
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="default">Default</Badge>
                        <Badge variant="secondary">Secondary</Badge>
                        <Badge variant="success">Success</Badge>
                        <Badge variant="destructive">Error</Badge>
                        <Badge variant="warning">Warning</Badge>
                        <Badge variant="outline">Outline</Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Dialog */}
            <Card>
                <CardHeader>
                    <CardTitle>Dialog</CardTitle>
                    <CardDescription>
                        Modal dialogs with animations
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button>Open Dialog</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Order</DialogTitle>
                                <DialogDescription>
                                    Fill in the details to create a new order for the customer.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Customer Name</label>
                                    <Input placeholder="Nguyễn Văn A" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Phone Number</label>
                                    <Input placeholder="0901234567" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Table Number</label>
                                    <Input placeholder="Bàn 5" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline">Cancel</Button>
                                <Button>Create Order</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>

            {/* Real POS Example */}
            <Card>
                <CardHeader>
                    <CardTitle>Order Summary (Example)</CardTitle>
                    <CardDescription>
                        Using shadcn/ui components in a real POS scenario
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        {[
                            { name: 'Cà Phê Americano', qty: 2, price: 90000 },
                            { name: 'Bánh Croissant', qty: 1, price: 35000 },
                            { name: 'Trà Sen Vàng', qty: 1, price: 45000 },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                    <div className="font-medium">{item.name}</div>
                                    <div className="text-sm text-gray-500">x{item.qty}</div>
                                </div>
                                <div className="font-semibold">
                                    ₫{item.price.toLocaleString('vi-VN')}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-lg font-semibold">Total:</span>
                            <span className="text-2xl font-bold text-[--color-primary]">
                                ₫170,000
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Button variant="outline" size="lg">
                                Cancel
                            </Button>
                            <Button variant="success" size="lg">
                                Confirm Order
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
