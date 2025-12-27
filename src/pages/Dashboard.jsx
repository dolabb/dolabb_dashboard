import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { useEffect, useRef, useState } from 'react';
import {
  FaBox,
  FaChartLine,
  FaCheckCircle,
  FaClock,
  FaFileInvoiceDollar,
  FaGavel,
  FaMoneyBillWave,
  FaShoppingCart,
  FaUsers,
} from 'react-icons/fa';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  getDashboardStats,
  getRevenueTrends,
  getSalesOverTime,
  getListingsStatus,
  getTransactionTypes,
  getDisputesStatus,
  getCashoutRequestsSummary,
} from '../services/api';

const StatCard = ({ title, value, icon: Icon, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className='bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-xl transition-shadow border border-gray-200'
  >
    <div className='flex items-center justify-between'>
      <div className='min-w-0 flex-1'>
        <p className='text-gray-600 text-xs sm:text-sm font-medium whitespace-nowrap truncate'>
          {title}
        </p>
        <p
          className={`text-xl sm:text-2xl lg:text-3xl font-bold mt-2 whitespace-nowrap ${color}`}
        >
          {typeof value === 'string' ? value : value.toLocaleString()}
        </p>
      </div>
      <div
        className={`text-2xl sm:text-3xl lg:text-4xl ${color} flex-shrink-0 ml-2`}
      >
        <Icon />
      </div>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const titleRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: null,
    revenueTrends: null,
    salesOverTime: null,
    listingsStatus: null,
    transactionTypes: null,
    disputesStatus: null,
    cashoutSummary: null,
  });

  useEffect(() => {
    if (titleRef.current) {
      gsap.from(titleRef.current, {
        opacity: 0,
        y: -30,
        duration: 0.8,
        ease: 'power3.out',
      });
    }
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setStatsLoading(true);
      setChartsLoading(true);
      setError(null);
      
      // Helper function to fetch with timeout
      const fetchWithTimeout = async (apiCall, timeout = 15000) => {
        return Promise.race([
          apiCall(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), timeout)
          ),
        ]);
      };

      // Helper function to safely fetch data
      const safeFetch = async (apiCall, key) => {
        try {
          const response = await fetchWithTimeout(apiCall, 15000);
          if (response && response.success) {
            setDashboardData((prev) => ({ ...prev, [key]: response }));
            return response;
          }
          return null;
        } catch (err) {
          console.error(`Error fetching ${key}:`, err);
          return null;
        }
      };

      try {
        // Load stats first (most important) - show immediately
        const statsResult = await safeFetch(getDashboardStats, 'stats');
        setStatsLoading(false);
        if (statsResult) {
          // If stats loaded, we can show the page even if charts are still loading
          setLoading(false);
        }

        // Load charts progressively in parallel (non-blocking)
        // Use Promise.allSettled so one failure doesn't block others
        Promise.allSettled([
          safeFetch(getRevenueTrends, 'revenueTrends'),
          safeFetch(getSalesOverTime, 'salesOverTime'),
          safeFetch(getListingsStatus, 'listingsStatus'),
          safeFetch(getTransactionTypes, 'transactionTypes'),
          safeFetch(getDisputesStatus, 'disputesStatus'),
          safeFetch(getCashoutRequestsSummary, 'cashoutSummary'),
        ]).then(() => {
          setChartsLoading(false);
          setLoading(false);
        });

        // Fallback: if stats fail, still try to show something after timeout
        if (!statsResult) {
          setTimeout(() => {
            setStatsLoading(false);
            setLoading(false);
          }, 5000);
        }

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load some dashboard data. Please refresh the page.');
        setStatsLoading(false);
        setChartsLoading(false);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format revenue trends data
  const revenueData = dashboardData.revenueTrends?.monthlyRevenue?.map((item) => {
    const monthName = new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short' });
    const usersData = dashboardData.revenueTrends?.monthlyNewUsers?.find(
      (u) => u.month === item.month
    );
    return {
      month: monthName,
      revenue: item.revenue || 0,
      users: usersData?.newUsers || 0,
    };
  }) || [];

  // Format listings status data
  const listingsStatusData = dashboardData.listingsStatus
    ? [
        {
          name: 'Active',
          value: dashboardData.listingsStatus.activeListings || 0,
          color: '#10b981',
        },
        {
          name: 'Sold',
          value: dashboardData.listingsStatus.soldListings || 0,
          color: '#3b82f6',
        },
        {
          name: 'Removed',
          value: dashboardData.listingsStatus.removedListings || 0,
          color: '#ef4444',
        },
        {
          name: 'Pending Review',
          value: dashboardData.listingsStatus.pendingReviewListings || 0,
          color: '#f59e0b',
        },
      ]
    : [];

  // Format transaction types data
  const transactionTypesData = dashboardData.transactionTypes
    ? [
        {
          name: 'Purchase',
          value: dashboardData.transactionTypes.purchaseTransactions || 0,
          color: '#10b981',
        },
        {
          name: 'Offer',
          value: dashboardData.transactionTypes.offerTransactions || 0,
          color: '#f59e0b',
        },
        {
          name: 'Accepted Offer',
          value: dashboardData.transactionTypes.acceptedOfferTransactions || 0,
          color: '#3b82f6',
        },
      ]
    : [];

  // Format disputes status data
  const disputesData = [
    {
      name: 'Open',
      value: dashboardData.disputesStatus?.openDisputes || 0,
      color: '#ef4444',
    },
    {
      name: 'Resolved',
      value: dashboardData.disputesStatus?.resolvedDisputes || 0,
      color: '#10b981',
    },
    {
      name: 'Closed',
      value: dashboardData.disputesStatus?.closedDisputes || 0,
      color: '#6b7280',
    },
  ];

  // Format sales over time data
  const salesData = dashboardData.salesOverTime?.monthlySales?.map((item) => {
    const monthName = new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short' });
    return {
      month: monthName,
      sales: item.sales || 0,
    };
  }) || [];

  // Format cashout requests data
  const cashoutData = [
    {
      name: 'Pending',
      value: dashboardData.cashoutSummary?.pendingCashouts || 0,
      color: '#f59e0b',
    },
    {
      name: 'Approved',
      value: dashboardData.cashoutSummary?.approvedCashouts || 0,
      color: '#10b981',
    },
    {
      name: 'Rejected',
      value: dashboardData.cashoutSummary?.rejectedCashouts || 0,
      color: '#ef4444',
    },
  ];

  const stats = dashboardData.stats
    ? [
        {
          title: 'Total Users',
          value: dashboardData.stats.totalUsers || 0,
          icon: FaUsers,
          color: 'text-blue-600',
        },
        {
          title: 'Active Users',
          value: dashboardData.stats.activeUsers || 0,
          icon: FaUsers,
          color: 'text-green-600',
        },
        {
          title: 'Total Listings',
          value: dashboardData.stats.totalListings || 0,
          icon: FaBox,
          color: 'text-blue-600',
        },
        {
          title: 'Total Sales',
          value: dashboardData.stats['Total Sales'] || 0,
          icon: FaShoppingCart,
          color: 'text-yellow-600',
        },
        {
          title: 'Total Revenue',
          value: `SAR ${(dashboardData.stats.totalRevenue || 0).toLocaleString()}`,
          icon: FaMoneyBillWave,
          color: 'text-green-600',
        },
        {
          title: 'Pending Cashouts',
          value: dashboardData.stats.pendingCashouts || 0,
          icon: FaClock,
          color: 'text-red-600',
        },
        {
          title: 'Open Disputes',
          value: dashboardData.stats['Open Disputes'] || 0,
          icon: FaGavel,
          color: 'text-red-600',
        },
        {
          title: 'Resolved Disputes',
          value: dashboardData.stats.resolvedDisputes || 0,
          icon: FaCheckCircle,
          color: 'text-green-600',
        },
      ]
    : [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-white border border-gray-300 rounded-lg p-3 shadow-lg'>
          <p className='text-gray-700 text-sm whitespace-nowrap mb-1'>
            {label}
          </p>
          {payload.map((entry, index) => (
            <p
              key={index}
              className='text-sm whitespace-nowrap'
              style={{ color: entry.color }}
            >
              {`${entry.name}: ${
                typeof entry.value === 'number'
                  ? entry.value.toLocaleString()
                  : entry.value
              }`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Skeleton Loader Component
  const SkeletonCard = () => (
    <div className='bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200 animate-pulse'>
      <div className='flex items-center justify-between'>
        <div className='flex-1'>
          <div className='h-4 bg-gray-200 rounded w-24 mb-3'></div>
          <div className='h-8 bg-gray-300 rounded w-32'></div>
        </div>
        <div className='h-10 w-10 bg-gray-200 rounded'></div>
      </div>
    </div>
  );

  const SkeletonChart = () => (
    <div className='bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200 animate-pulse'>
      <div className='h-6 bg-gray-200 rounded w-48 mb-4'></div>
      <div className='h-[300px] bg-gray-100 rounded'></div>
    </div>
  );

  if (statsLoading) {
    return (
      <div className='space-y-4 sm:space-y-6'>
        {/* Header Skeleton */}
        <div className='animate-pulse'>
          <div className='h-8 bg-gray-200 rounded w-64 mb-2'></div>
          <div className='h-4 bg-gray-200 rounded w-96'></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6'>
          {[...Array(8)].map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6'>
          {[...Array(6)].map((_, index) => (
            <SkeletonChart key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='space-y-4 sm:space-y-6'>
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg'>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4 sm:space-y-6'>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 mb-2 whitespace-nowrap'>
          Dashboard Overview
        </h1>
        <p className='text-gray-600 text-sm sm:text-base whitespace-nowrap'>
          Welcome to the Dolabb Admin Dashboard
        </p>
      </motion.div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6'>
        {stats.map((stat, index) => (
          <StatCard key={stat.title} {...stat} delay={index * 0.1} />
        ))}
      </div>

      {/* Charts Section */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6'>
        {/* Revenue and Users Trend */}
        {chartsLoading && !dashboardData.revenueTrends ? (
          <SkeletonChart />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className='bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200'
          >
            <h2 className='text-lg sm:text-xl font-semibold text-gray-900 mb-4 whitespace-nowrap flex items-center gap-2'>
              <FaChartLine className='text-green-600' />
              Revenue & Users Trend
            </h2>
            <ResponsiveContainer width='100%' height={300}>
              <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
              <XAxis dataKey='month' stroke='#6b7280' />
              <YAxis stroke='#6b7280' />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#6b7280' }} />
              <Line
                type='monotone'
                dataKey='revenue'
                stroke='#10b981'
                strokeWidth={2}
                name='Revenue ($)'
              />
              <Line
                type='monotone'
                dataKey='users'
                stroke='#3b82f6'
                strokeWidth={2}
                name='Users'
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
        )}

        {/* Sales Over Time */}
        {chartsLoading && !dashboardData.salesOverTime ? (
          <SkeletonChart />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className='bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200'
          >
            <h2 className='text-lg sm:text-xl font-semibold text-gray-900 mb-4 whitespace-nowrap flex items-center gap-2'>
              <FaShoppingCart className='text-yellow-600' />
              Sales Over Time
            </h2>
            <ResponsiveContainer width='100%' height={300}>
              <BarChart data={salesData}>
              <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
              <XAxis dataKey='month' stroke='#6b7280' />
              <YAxis stroke='#6b7280' />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey='sales' fill='#f59e0b' name='Sales' />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
        )}

        {/* Listings Status */}
        {chartsLoading && !dashboardData.listingsStatus ? (
          <SkeletonChart />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className='bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200'
          >
            <h2 className='text-lg sm:text-xl font-semibold text-gray-900 mb-4 whitespace-nowrap flex items-center gap-2'>
              <FaBox className='text-blue-600' />
              Listings Status
            </h2>
            <ResponsiveContainer width='100%' height={300}>
              <PieChart>
                <Pie
                  data={listingsStatusData}
                cx='50%'
                cy='50%'
                labelLine={false}
                outerRadius={80}
                fill='#8884d8'
                dataKey='value'
              >
                {listingsStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                content={<CustomTooltip />}
                formatter={(value, name, props) => [
                  `${value} (${((value / listingsStatusData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%)`,
                  name
                ]}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value, entry) => {
                  const total = listingsStatusData.reduce((sum, item) => sum + item.value, 0);
                  const percent = total > 0 ? ((entry.payload.value / total) * 100).toFixed(0) : 0;
                  return `${value}: ${percent}%`;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
        )}

        {/* Transaction Types */}
        {chartsLoading && !dashboardData.transactionTypes ? (
          <SkeletonChart />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.1 }}
            className='bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200'
          >
            <h2 className='text-lg sm:text-xl font-semibold text-gray-900 mb-4 whitespace-nowrap flex items-center gap-2'>
              <FaFileInvoiceDollar className='text-purple-600' />
              Transaction Types
            </h2>
            <ResponsiveContainer width='100%' height={300}>
              <PieChart>
                <Pie
                  data={transactionTypesData}
                cx='50%'
                cy='50%'
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill='#8884d8'
                dataKey='value'
              >
                {transactionTypesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
        )}

        {/* Disputes Status */}
        {chartsLoading && !dashboardData.disputesStatus ? (
          <SkeletonChart />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className='bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200'
          >
            <h2 className='text-lg sm:text-xl font-semibold text-gray-900 mb-4 whitespace-nowrap flex items-center gap-2'>
              <FaGavel className='text-red-600' />
              Disputes Status
            </h2>
            <ResponsiveContainer width='100%' height={300}>
              <PieChart>
                <Pie
                  data={disputesData}
                cx='50%'
                cy='50%'
                labelLine={false}
                outerRadius={80}
                fill='#8884d8'
                dataKey='value'
              >
                {disputesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                content={<CustomTooltip />}
                formatter={(value, name, props) => {
                  const total = disputesData.reduce((sum, item) => sum + item.value, 0);
                  const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                  return [`${value} (${percent}%)`, name];
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value, entry) => {
                  const total = disputesData.reduce((sum, item) => sum + item.value, 0);
                  const percent = total > 0 ? ((entry.payload.value / total) * 100).toFixed(0) : 0;
                  return `${value}: ${percent}%`;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
        )}

        {/* Cashout Requests */}
        {chartsLoading && !dashboardData.cashoutSummary ? (
          <SkeletonChart />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.3 }}
            className='bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200'
          >
            <h2 className='text-lg sm:text-xl font-semibold text-gray-900 mb-4 whitespace-nowrap flex items-center gap-2'>
              <FaClock className='text-orange-600' />
              Cashout Requests
            </h2>
            <ResponsiveContainer width='100%' height={300}>
              <PieChart>
                <Pie
                  data={cashoutData}
                cx='50%'
                cy='50%'
                labelLine={false}
                outerRadius={80}
                fill='#8884d8'
                dataKey='value'
              >
                {cashoutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                content={<CustomTooltip />}
                formatter={(value, name, props) => {
                  const total = cashoutData.reduce((sum, item) => sum + item.value, 0);
                  const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                  return [`${value} (${percent}%)`, name];
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value, entry) => {
                  const total = cashoutData.reduce((sum, item) => sum + item.value, 0);
                  const percent = total > 0 ? ((entry.payload.value / total) * 100).toFixed(0) : 0;
                  return `${value}: ${percent}%`;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
        )}
      </div>

      
    </div>
  );
};

export default Dashboard;
