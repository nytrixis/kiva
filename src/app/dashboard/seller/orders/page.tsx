import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { OrdersChart } from "@/components/dashboard/seller/OrdersChart";
import { OrdersTable } from "@/components/dashboard/seller/OrdersTable";
import { format } from "date-fns";
import { createClient } from "@supabase/supabase-js";

export const metadata = {
  title: "Orders | Seller Dashboard | Kiva",
  description: "Manage your orders and track your sales",
};

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

interface OrderItem {
  id: string;
  product?: { name?: string | null; id?: string };
  productId?: string;
  quantity: number;
  price: number;
}

interface OrderData {
  id: string;
  createdAt: string;
  total: number;
  status: string;
  user?: { name?: string | null };
  items: OrderItem[];
}

interface Order {
  id: string;
  createdAt: Date | string;
  total: number;
  status: string;
  user?: { name?: string | null };
  items: {
    id: string;
    product?: { name?: string | null };
    quantity: number;
    price: number;
  }[];
  orderNumber: string;
  customerName: string;
  date: Date;
}

// Helper function to format orders data for the chart
function formatOrdersDataForChart(orders: Order[], type: "revenue" | "orders") {
  interface MonthData {
    month: Date;
    name: string;
    value: number;
    target: number;
  }

  // Get the last 6 months
  const today = new Date();
  const months: MonthData[] = [];
  for (let i = 5; i >= 0; i--) {
    const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
    months.push({
      month: month,
      name: format(month, 'MMM'),
      value: 0,
      target: type === "revenue"
        ? Math.floor(Math.random() * 15000)
        : Math.floor(Math.random() * 70)
    });
  }

  // Group orders by month
  orders.forEach(order => {
    const orderDate = new Date(order.createdAt);
    const monthIndex = months.findIndex(m =>
      m.month.getMonth() === orderDate.getMonth() &&
      m.month.getFullYear() === orderDate.getFullYear()
    );

    if (monthIndex !== -1) {
      if (type === "revenue") {
        months[monthIndex].value += order.total;
      } else {
        months[monthIndex].value += 1;
      }
    }
  });

  return months;
}

export default async function SellerOrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/dashboard/seller/orders");
  }

  const userId = session.user.id;

  // Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Get all products by this seller
  const { data: sellerProducts, error: productsError } = await supabase
    .from("Product")
    .select("id")
    .eq("sellerId", userId);

  if (productsError) {
    return <div className="text-red-500">Error loading products.</div>;
  }

  const productIds = (sellerProducts ?? []).map((product: { id: string }) => product.id);

  if (productIds.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-heading text-primary mb-2">Orders</h1>
        <p className="text-gray-600 mb-8">
          Track and manage orders for your products
        </p>
        <div className="text-gray-500">No products found for this seller.</div>
      </div>
    );
  }

  // Fetch orders with items that contain seller's products
  const { data: ordersData, error: ordersError } = await supabase
    .from("Order")
    .select(`
      id,
      createdAt,
      total,
      status,
      user:userId (
        name
      ),
      items:OrderItem (
        id,
        quantity,
        price,
        product:productId (
          id,
          name
        )
      )
    `)
    .order("createdAt", { ascending: false });

  if (ordersError) {
    return <div className="text-red-500">Error loading orders.</div>;
  }

  // Filter orders to only those that have at least one item with a productId in productIds
  const orders = (ordersData ?? []).filter((order: any) =>
    (order.items ?? []).some((item: any) => {
      const pid = item.product?.id ?? item.productId;
      return pid !== undefined && productIds.includes(pid);
    })
  );

  // Format orders for the OrdersTable component
  const formattedOrders = orders.map((order: any) => ({
    id: order.id,
    createdAt: order.createdAt,
    total: order.total,
    status: (order.status?.toLowerCase() === 'paid' ? 'processing' : order.status?.toLowerCase()) as OrderStatus,
    user: { name: order.user?.name || 'Anonymous' },
    items: (order.items ?? []).map((item: any) => ({
      id: item.id,
      product: { name: item.product?.name ?? 'Unknown' },
      quantity: item.quantity,
      price: item.price
    })),
    orderNumber: order.id,
    customerName: order.user?.name || 'Anonymous',
    date: new Date(order.createdAt),
  }));

  // Format data for charts
  const revenueData = formatOrdersDataForChart(formattedOrders, "revenue");
  const ordersDataChart = formatOrdersDataForChart(formattedOrders, "orders");

  return (
    <div>
      <h1 className="text-3xl font-heading text-primary mb-2">Orders</h1>
      <p className="text-gray-600 mb-8">
        Track and manage orders for your products
      </p>

      {/* Revenue and Orders Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Revenue Overview</h2>
          <OrdersChart
            data={revenueData}
            type="revenue"
            colors={{ primary: "#2a4aa1", secondary: "#e7d1ff" }}
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Orders Overview</h2>
          <OrdersChart
            data={ordersDataChart}
            type="orders"
            colors={{ primary: "#e7d1ff", secondary: "#2a4aa1" }}
          />
        </div>
      </div>

      {/* Orders Table */}
      <OrdersTable orders={formattedOrders} />
    </div>
  );
}