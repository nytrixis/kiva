import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { OrdersChart } from "@/components/dashboard/seller/OrdersChart";
import { OrdersTable } from "@/components/dashboard/seller/OrdersTable";
import { format } from "date-fns";

export const metadata = {
  title: "Orders | Seller Dashboard | Kiva",
  description: "Manage your orders and track your sales",
};

interface Order {
  id: string;
  createdAt: Date | string;
  total: number;
  status: string;
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
        ? Math.floor(Math.random() * 15000) // Random target revenue
        : Math.floor(Math.random() * 70)    // Random target orders count
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
        months[monthIndex].value += 1; // Count orders
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
  
  // // First, get all products by this seller
  // const sellerProducts = await prisma.product.findMany({
  //   where: { sellerId: userId },
  //   select: { id: true }
  // });
  
  // const productIds = sellerProducts.map(product => product.id);
  
  // Now, we need to find orders that contain these products
  // Since the schema doesn't directly link orders to products,
  // we'll need to modify this based on your actual schema
  
  // For this example, let's assume we have an OrderItem model that links orders to products
  // This is a placeholder implementation - adjust according to your actual schema
  
  // Fetch orders with items that contain seller's products
  const orders = await prisma.order.findMany({
    where: {
      // This is a placeholder - you'll need to adjust based on your schema
      // For example, if you have OrderItems:
      // items: {
      //   some: {
      //     productId: { in: productIds }
      //   }
      // }
    },
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      },
      // Include order items if you have them
      // items: {
      //   include: {
      //     product: true
      //   }
      // }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  
  // Format orders for the OrdersTable component
  const formattedOrders = orders.map(order => ({
    id: order.id,
    orderNumber: `ORD-${order.id.substring(0, 6)}`,
    customerName: order.user?.name || 'Anonymous',
    date: order.createdAt,
    total: order.total,
    status: (order.status.toLowerCase() === 'paid' ? 'processing' : order.status.toLowerCase()) as OrderStatus,
    items: [] // You would populate this from order items if available
  }));
  
  // Format data for charts
  const revenueData = formatOrdersDataForChart(orders, "revenue");
  const ordersData = formatOrdersDataForChart(orders, "orders");
  
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
            data={ordersData} 
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