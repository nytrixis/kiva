"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Search, Filter, ChevronDown } from "lucide-react";

// Order data structure
interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  date: Date;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items: {
    id: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
}

interface OrdersTableProps {
  orders: Order[];
}

export function OrdersTable({ orders: initialOrders }: OrdersTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // For demo purposes, generate some placeholder orders if none provided
  const placeholderOrders: Order[] = initialOrders.length > 0 ? initialOrders : [
    {
      id: "1",
      orderNumber: "ORD-001",
      customerName: "Priya Sharma",
      date: new Date(2023, 6, 15),
      total: 2499,
      status: "delivered",
      items: [
        {
          id: "item1",
          productName: "Handwoven Silk Scarf",
          quantity: 1,
          price: 2499,
        },
      ],
    },
    {
      id: "2",
      orderNumber: "ORD-002",
      customerName: "Rahul Patel",
      date: new Date(2023, 6, 18),
      total: 4250,
      status: "shipped",
      items: [
        {
          id: "item2",
          productName: "Brass Table Lamp",
          quantity: 1,
          price: 4250,
        },
      ],
    },
    {
      id: "3",
      orderNumber: "ORD-003",
      customerName: "Ananya Desai",
      date: new Date(2023, 6, 20),
      total: 1850,
      status: "processing",
      items: [
        {
          id: "item3",
          productName: "Hand-painted Ceramic Platter",
          quantity: 1,
          price: 1850,
        },
      ],
    },
    {
      id: "4",
      orderNumber: "ORD-004",
      customerName: "Vikram Singh",
      date: new Date(2023, 6, 22),
      total: 3200,
      status: "pending",
      items: [
        {
          id: "item4",
          productName: "Wooden Serving Board Set",
          quantity: 1,
          price: 3200,
        },
      ],
    },
  ];
  
  // Filter orders based on search query and status filter
  const filteredOrders = placeholderOrders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  const getStatusBadgeClass = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-lg font-medium text-gray-800">Recent Orders</h2>
        
        <div className="flex flex-col md:flex-row gap-4">
          {/* Status filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary appearance-none"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>
        </div>
      </div>
      
      {/* Orders table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-primary">{order.orderNumber}</div>
                                    <div className="text-xs text-gray-500">{order.items.length} item(s)</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{order.customerName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{format(order.date, 'MMM d, yyyy')}</div>
                  <div className="text-xs text-gray-500">{format(order.date, 'h:mm a')}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">₹{order.total.toLocaleString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-primary hover:text-primary/80">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredOrders.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No orders found matching your search.</p>
          </div>
        )}
      </div>
      
      {/* Pagination placeholder */}
      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing <span className="font-medium">{filteredOrders.length}</span> orders
        </div>
        
        <div className="flex space-x-2">
          <button
            disabled
            className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-500 bg-gray-50 cursor-not-allowed"
          >
            Previous
          </button>
          <button
            disabled
            className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-500 bg-gray-50 cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
