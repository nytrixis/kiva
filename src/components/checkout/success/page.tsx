import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Order Confirmation | Kiva",
  description: "Your order has been placed successfully",
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { orderId?: string };
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/checkout/success");
  }
  
  const { orderId } = searchParams;
  
  if (!orderId) {
    redirect("/dashboard");
  }
  
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
      userId: session.user.id,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      address: true,
    },
  });
  
  if (!order) {
    redirect("/dashboard");
  }
  
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-heading text-primary mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">
            Thank you for your purchase. Your order has been placed successfully.
          </p>
        </div>
        
        <div className="border rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <Package className="h-5 w-5 text-primary mr-2" />
              <h2 className="text-lg font-medium">Order Details</h2>
            </div>
            <span className="text-sm text-gray-500">
              {new Date(order.createdAt).toLocaleDateString()}
            </span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Order ID</span>
              <span className="font-medium">{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status</span>
              <span className="font-medium capitalize">{order.status.toLowerCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount</span>
              <span className="font-medium">₹{order.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Items</span>
              <span className="font-medium">{order.items.length}</span>
            </div>
          </div>
        </div>
        
        {order.address && (
          <div className="border rounded-lg p-4 mb-6">
            <h3 className="text-md font-medium mb-2">Shipping Address</h3>
            <div className="text-sm text-gray-600">
              <p>{order.address.name}</p>
              <p>{order.address.line1}</p>
              {order.address.line2 && <p>{order.address.line2}</p>}
              <p>
                {order.address.city}, {order.address.state} {order.address.postalCode}
              </p>
              <p>{order.address.country}</p>
              <p className="mt-1">{order.address.phone}</p>
            </div>
          </div>
        )}
        
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 mt-8">
          <Link href="/marketplace">
            <Button variant="outline" className="w-full md:w-auto">
              Continue Shopping
            </Button>
          </Link>
          
          <Link href={`/orders/${order.id}`}>
            <Button className="w-full md:w-auto bg-primary hover:bg-primary/90 flex items-center">
              View Order Details
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
