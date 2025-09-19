"use client";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar"; // shadcn calendar
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function Dashboard() {
  const [filter, setFilter] = useState("today");
  const [dateRange, setDateRange] = useState(null); // manual calendar range
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    let url = `/api/analytics?type=${filter}`;
    if (dateRange?.from && dateRange?.to) {
      url = `/api/analytics?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`;
    }

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("API error");
        return res.json();
      })
      .then((data) => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch failed:", err);
        setLoading(false);
        setAnalytics(null);
      });
  }, [filter, dateRange]);

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Hotel Business Dashboard</h1>

      {/* Filter Buttons */}
      <div className="flex space-x-4 items-center">
        {["today", "yesterday", "week", "month"].map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            onClick={() => {
              setFilter(f);
              setDateRange(null); // clear manual selection
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}

        {/* Calendar Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={dateRange ? "default" : "outline"}
              className="w-[240px] justify-start text-left font-normal"
            >
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "MMM d, yyyy")} →{" "}
                    {format(dateRange.to, "MMM d, yyyy")}
                  </>
                ) : (
                  format(dateRange.from, "MMM d, yyyy")
                )
              ) : (
                <span>Pick Date Range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2 rounded-xl shadow-lg border bg-white">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
              className="rounded-md border"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Results */}
      {!analytics ? (
        <p className="text-red-500">Failed to load analytics</p>
      ) : (
        <>
          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold">₹{analytics.revenue}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Most Sold Food</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl">{analytics.mostSold || "N/A"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Visitors</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl">{analytics.totalPeople}</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          {filter === "today" ? (
            <>
              {/* Hourly Revenue Chart */}
              {analytics?.hourlyRevenue?.length > 0 ? (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Revenue Trend (Hourly)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analytics.hourlyRevenue}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="hour"
                          tickFormatter={(val) => `${val}:00`}
                        />
                        <YAxis />
                        <Tooltip labelFormatter={(val) => `${val}:00`} />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#10b981"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              ) : (
                <p className="mt-4 text-gray-500">No hourly revenue data</p>
              )}

              {/* Daily Revenue Chart */}
              {analytics?.dailyRevenue?.length > 0 ? (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Revenue Trend (Daily)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analytics.dailyRevenue}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#3b82f6"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              ) : (
                <p className="mt-4 text-gray-500">No daily revenue data</p>
              )}
            </>
          ) : (
            // Default case: week, month, custom
            <>
              {analytics?.dailyRevenue?.length > 0 ? (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Revenue Trend (Daily)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analytics.dailyRevenue}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#10b981"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              ) : (
                <p className="mt-4 text-gray-500">
                  No revenue data for this period
                </p>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
