import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/AdminDashboard.css';
import { toast } from 'react-toastify';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Card, Badge, Loading } from '../components/Common';
import dashboardService from '../services/dashboard.service';
import { handleApiResponse } from '../utils/common';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [userEmail, setUserEmail] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        const email = localStorage.getItem('userEmail');
        setUserEmail(email || 'Admin');
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        fetchDashboardStats();
    }, [selectedMonth, selectedYear]);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            const response = await dashboardService.getStats(selectedMonth, selectedYear);
            const data = handleApiResponse(response);
            setDashboardData(data);
        } catch (error) {
            console.error("Lỗi khi tải thống kê Dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        {
            title: `Doanh thu tháng ${selectedMonth}`,
            value: `${(dashboardData?.totalRevenue || 0).toLocaleString('vi-VN')} đ`,
            change: `${dashboardData?.revenueChange >= 0 ? '+' : ''}${dashboardData?.revenueChange || 0}%`,
            trend: (dashboardData?.revenueChange || 0) >= 0 ? 'up' : 'down',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
            ),
            color: '#34d399'
        },
        {
            title: `Vé bán trong tháng ${selectedMonth}`,
            value: dashboardData?.totalTicketsSold || '0',
            change: `${dashboardData?.ticketChange >= 0 ? '+' : ''}${dashboardData?.ticketChange || 0}%`,
            trend: (dashboardData?.ticketChange || 0) >= 0 ? 'up' : 'down',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                    <line x1="2" y1="10" x2="22" y2="10"></line>
                    <line x1="7" y1="15" x2="7" y2="15.01"></line>
                    <line x1="12" y1="15" x2="12" y2="15.01"></line>
                    <line x1="17" y1="15" x2="17" y2="15.01"></line>
                </svg>
            ),
            color: '#10b981'
        },
        {
            title: `Khách hàng tháng ${selectedMonth}`,
            value: dashboardData?.totalCustomers || '0',
            change: `${dashboardData?.customerChange >= 0 ? '+' : ''}${dashboardData?.customerChange || 0}%`,
            trend: (dashboardData?.customerChange || 0) >= 0 ? 'up' : 'down',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
            ),
            color: '#059669'
        },
        {
            title: 'Số chuyến xe hôm nay',
            value: dashboardData?.totalTripsToday || '0',
            change: '0%',
            trend: 'up',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v7h2"></path>
                    <circle cx="7" cy="17" r="2"></circle>
                    <circle cx="17" cy="17" r="2"></circle>
                </svg>
            ),
            color: '#065f46'
        }
    ];

    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    const recentActivities = [];

    const revenueData = dashboardData?.revenueLast7Days || [
        { date: '14/03', revenue: 0 },
        { date: '15/03', revenue: 0 },
        { date: '16/03', revenue: 0 },
        { date: '17/03', revenue: 0 },
        { date: '18/03', revenue: 0 },
        { date: '19/03', revenue: 0 },
        { date: '20/03', revenue: 0 },
    ];

    const tripPieData = dashboardData?.tripStatusStats?.length > 0 
        ? dashboardData.tripStatusStats.map(s => ({ name: s.status, value: s.count }))
        : [{ name: 'Chưa có chuyến đi', value: 1 }];

    const STATUS_COLORS = {
        'Sắp khởi hành': '#3182ce',
        'Đang di chuyển': '#dd6b20',
        'Đã hoàn thành': '#38a169',
        'Đã hủy': '#e53e3e',
        'Chưa có chuyến đi': '#e2e8f0'
    };

    return (
        <div className="admin-page-container" style={{ height: '100%', overflowY: 'auto' }}>
            
            {/* --- CARDS TỔNG QUAN --- */}
            <div className="u-flex u-gap-20 u-m-b-24">
                {stats.map((stat, index) => (
                    <Card key={index} padding="16px" className="u-flex-1" style={{ border: '1px solid #edf2f7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                        <div className="u-flex u-justify-between u-align-start u-m-b-10">
                            <h3 className="u-size-14 u-color-slate-500 u-weight-500 u-m-0">{stat.title}</h3>
                            <div className="u-flex u-align-center u-justify-center u-rounded-12" style={{ width: '32px', height: '32px', background: `${stat.color}10`, color: stat.color }}>
                                {React.cloneElement(stat.icon, { width: 16, height: 16 })}
                            </div>
                        </div>
                        
                        <div className="u-m-b-8">
                            <div className="u-size-24 u-weight-700 u-color-slate-800">{stat.value}</div>
                        </div>

                        <div className="u-flex u-align-center u-gap-6">
                            <div className="u-flex u-align-center u-gap-4 u-weight-600 u-size-12 u-color-emerald">
                                {stat.trend === 'up' ? (
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                                        <polyline points="17 6 23 6 23 12"></polyline>
                                    </svg>
                                ) : (
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
                                        <polyline points="17 18 23 18 23 12"></polyline>
                                    </svg>
                                )}
                                <span>{stat.change}</span>
                            </div>
                            <span className="u-size-11 u-color-slate-400">so với tháng trước</span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* --- BỘ LỌC THỜI GIAN --- */}
            <div className="u-flex u-justify-end u-align-center u-m-b-24">
                <div className="u-flex u-align-center u-gap-12 u-bg-white u-p-x-12 u-p-y-8 u-rounded-12" style={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div className="u-flex u-align-center u-gap-8">
                        <span className="u-size-13 u-weight-600 u-color-slate-600">Thống kê theo:</span>
                        <select 
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                            className="u-p-x-8 u-p-y-4 u-rounded-6 u-size-13 u-weight-700 u-color-blue"
                            style={{ border: 'none', backgroundColor: '#ebf8ff', outline: 'none', cursor: 'pointer' }}
                        >
                            {months.map(m => (
                                <option key={m} value={m}>Tháng {m}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ width: '1px', height: '20px', backgroundColor: '#e2e8f0' }}></div>
                    <div className="u-flex u-align-center u-gap-8">
                        <select 
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="u-p-x-8 u-p-y-4 u-rounded-6 u-size-13 u-weight-700 u-color-blue"
                            style={{ border: 'none', backgroundColor: '#ebf8ff', outline: 'none', cursor: 'pointer' }}
                        >
                            {years.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>

                    <button 
                        onClick={() => dashboardService.exportRevenue(selectedMonth, selectedYear)}
                        className="u-flex u-align-center u-gap-8 u-p-x-12 u-p-y-6 u-rounded-8 u-size-13 u-weight-700 u-color-white u-transition-all"
                        style={{ backgroundColor: '#107c41', border: 'none', cursor: 'pointer', boxShadow: '0 2px 4px rgba(16, 124, 65, 0.2)' }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#0d6334'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#107c41'}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                        <span>Xuất Excel</span>
                    </button>
                </div>
            </div>

            {/* --- KHU VỰC BIỂU ĐỒ (50/50) --- */}
            <div className="u-flex u-gap-20 u-m-b-24" style={{ width: '100%', alignItems: 'stretch' }}>
                
                {/* 1. Biểu đồ Area Doanh thu (50%) */}
                <div style={{ flex: '1 1 0%', minWidth: 0 }}>
                    <Card padding="24px" style={{ height: '100%' }}>
                        <div className="u-flex u-justify-between u-align-center u-m-b-20">
                            <h2 className="u-size-18 u-weight-700 u-color-slate-800">Doanh thu tháng {selectedMonth}/{selectedYear} (Triệu VNĐ)</h2>
                        </div>
                        <div style={{ height: '300px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3182ce" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3182ce" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#718096', fontSize: 12}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#718096', fontSize: 12}} dx={-10} />
                                    <RechartsTooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                        formatter={(value) => [`${value} Triệu đ`, 'Doanh thu']}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#3182ce" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>

                {/* 2. Biểu đồ Pie Trạng thái vận hành (50%) */}
                <div style={{ flex: '1 1 0%', minWidth: 0 }}>
                    <Card padding="24px" style={{ height: '100%' }}>
                        <h2 className="u-size-18 u-weight-700 u-color-slate-800 u-m-b-10">Trạng thái Vận hành</h2>
                        <div style={{ height: '300px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={tripPieData}
                                        cx="50%"
                                        cy="45%"
                                        innerRadius={60}
                                        outerRadius={95}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {tripPieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#cbd5e0'} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip formatter={(value) => [`${value} chuyến`, 'Số lượng']} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}/>
                                    <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>
            </div>

            {/* --- KHU VỰC HOẠT ĐỘNG (100%) --- */}
            <Card padding="24px" className="u-m-b-24">
                <div className="u-flex u-justify-between u-align-center u-m-b-15">
                    <h2 className="u-size-18 u-weight-700 u-color-slate-800">Hoạt động gần đây</h2>
                    <span className="u-size-13 u-color-blue u-weight-600 u-cursor-pointer">Xem tất cả</span>
                </div>
                <div className="u-flex u-flex-column u-gap-15">
                    {recentActivities.length > 0 ? (
                        recentActivities.map((activity, index) => (
                            <div key={index} className={`u-flex u-align-start u-gap-12 u-p-b-15 ${index < recentActivities.length - 1 ? 'u-border-b-dashed' : ''}`}>
                                <div style={{ 
                                    width: '10px', height: '10px', borderRadius: '50%', marginTop: '5px',
                                    background: activity.type === 'booking' ? '#3182ce' : activity.type === 'payment' ? '#38a169' : activity.type === 'cancel' ? '#e53e3e' : '#dd6b20'
                                }}></div>
                                <div className="u-flex-1">
                                    <p className="u-size-13 u-weight-700 u-color-slate-800 u-m-b-2">{activity.action}</p>
                                    <p className="u-size-12 u-color-slate-500">Bởi: <span className="u-weight-600">{activity.user}</span></p>
                                </div>
                                <span className="u-size-11 u-color-slate-400 u-text-nowrap">{activity.time}</span>
                            </div>
                        ))
                    ) : (
                        <div className="u-text-center u-p-y-20 u-color-slate-400 u-size-14">
                            Chưa có hoạt động nào được ghi nhận
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default AdminDashboard;

