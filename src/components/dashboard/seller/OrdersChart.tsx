"use client";

import { useState, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

// Placeholder data for the chart
const generatePlaceholderData = (type: "revenue" | "orders") => {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  
  // Get current month index
  const currentMonth = new Date().getMonth();
  
  // Generate last 6 months of data
  return Array.from({ length: 6 }, (_, i) => {
    const monthIndex = (currentMonth - 5 + i + 12) % 12;
    return {
      name: months[monthIndex],
      value: type === "revenue" 
        ? Math.floor(Math.random() * 10000) 
        : Math.floor(Math.random() * 50),
      target: type === "revenue"
        ? Math.floor(Math.random() * 15000)
        : Math.floor(Math.random() * 70),
    };
  });
};

interface OrdersChartProps {
  data: any[]; // Replace with actual order data type
  type: "revenue" | "orders";
  colors: {
    primary: string;
    secondary: string;
  };
}

interface ChartDataPoint {
  name: string;
  value: number;
  target: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    dataKey: string;
    color: string;
  }>;
  label?: string;
}


export function OrdersChart({ data, type, colors }: OrdersChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [chartType, setChartType] = useState<"bar" | "line">("bar");
  
  useEffect(() => {
    // If real data is provided, use it; otherwise, use placeholder data
    if (data && data.length > 0) {
      setChartData(data);
    } else {
      setChartData(generatePlaceholderData(type));
    }
  }, [data, type]);
  
  const formatYAxisTick = (value: number): string => {
    if (type === "revenue") {
      return `₹${value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}`;
    }
    return value.toString();
  };
  
  
const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-sm rounded-md">
          <p className="font-medium text-gray-800">{label}</p>
          <p className="text-sm text-gray-600">
            {type === "revenue" ? "Revenue: " : "Orders: "}
            <span className="font-medium" style={{ color: colors.primary }}>
              {type === "revenue" ? `₹${payload[0].value.toLocaleString()}` : payload[0].value}
            </span>
          </p>
          <p className="text-sm text-gray-600">
            Target: 
            <span className="font-medium" style={{ color: colors.secondary }}>
              {type === "revenue" ? ` ₹${payload[1].value.toLocaleString()}` : ` ${payload[1].value}`}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div>
      <div className="flex justify-end mb-4">
        <div className="flex border border-gray-200 rounded-md overflow-hidden">
          <button
            onClick={() => setChartType("bar")}
            className={`px-3 py-1 text-sm ${
              chartType === "bar" 
                ? "bg-primary text-white" 
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Bar
          </button>
          <button
            onClick={() => setChartType("line")}
            className={`px-3 py-1 text-sm ${
              chartType === "line" 
                ? "bg-primary text-white" 
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Line
          </button>
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "bar" ? (
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={formatYAxisTick} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill={colors.primary} radius={[4, 4, 0, 0]} />
              <Bar dataKey="target" fill={colors.secondary} radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={formatYAxisTick} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={colors.primary} 
                strokeWidth={2}
                dot={{ r: 4, fill: colors.primary }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke={colors.secondary}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 4, fill: colors.secondary }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
      
      <div className="flex justify-center mt-4">
        <div className="flex items-center mr-4">
          <div 
            className="h-3 w-3 rounded-full mr-1" 
            style={{ backgroundColor: colors.primary }}
          ></div>
          <span className="text-xs text-gray-600">
            {type === "revenue" ? "Actual Revenue" : "Actual Orders"}
          </span>
        </div>
        <div className="flex items-center">
          <div 
            className="h-3 w-3 rounded-full mr-1" 
            style={{ backgroundColor: colors.secondary }}
          ></div>
          <span className="text-xs text-gray-600">Target</span>
        </div>
      </div>
    </div>
  );
}
