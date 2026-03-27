import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/AdminDashboard.css';
import { toast } from 'react-toastify';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Card, Badge } from '../components/Common';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [userEmail, setUserEmail] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const email = localStorage.getItem('userEmail');
        setUserEmail(email || 'Admin');
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const stats = [
        {
            title: 'Tổng vé đã bán',
            value: '1,234',
            change: '+12.5%',
            trend: 'up',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
            ),
            color: '#10b981'
        },
        {
            title: 'Doanh thu tháng này',
            value: '₫45.2M',
            change: '+8.2%',
            trend: 'up',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
            ),
            color: '#34d399'
        },
        {
            title: 'Khách hàng mới',
            value: '856',
            change: '+23.1%',
            trend: 'up',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
            ),
            color: '#059669'
        },
        {
            title: 'Chuyến đi xuất bến',
            value: '42',
            change: '+5.4%',
            trend: 'up',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                </svg>
            ),
            color: '#065f46'
        }
    ];

    const recentActivities = [
        { action: 'Vé điện tử thành công (#TK-202)', user: 'Nguyễn Văn A', time: '5 phút trước', type: 'booking' },
        { action: 'Giao dịch qua VNPAY', user: 'Trần Thị B', time: '12 phút trước', type: 'payment' },
        { action: 'Chuyển xe dự phòng 37B-999.00', user: 'Admin', time: '1 giờ trước', type: 'update' },
        { action: 'Hủy vé sát giờ (#TK-105)', user: 'Phạm Thị D', time: '2 giờ trước', type: 'cancel' }
    ];

    const revenueData = [
        { date: '14/03', revenue: 15.2 },
        { date: '15/03', revenue: 18.5 },
        { date: '16/03', revenue: 12.0 },
        { date: '17/03', revenue: 22.4 },
        { date: '18/03', revenue: 28.1 },
        { date: '19/03', revenue: 20.9 },
        { date: '20/03', revenue: 35.6 },
    ];

    const routePieData = [
        { name: 'HN - Nghệ An', value: 45 },
        { name: 'Nghệ An - HN', value: 35 },
        { name: 'HN - Sầm Sơn', value: 10 },
        { name: 'Khác', value: 10 },
    ];
    const COLORS = ['#3182ce', '#38a169', '#dd6b20', '#a0aec0'];

    return (
        <div className="admin-page-container" style={{ padding: '0', height: '100%', overflowY: 'auto' }}>
            {/* The header is now handled by AdminLayout */}

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
                            <div className="u-flex u-align-center u-gap-4 u-color-emerald u-weight-600 u-size-12">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                                    <polyline points="17 6 23 6 23 12"></polyline>
                                </svg>
                                <span>{stat.change}</span>
                            </div>
                            <span className="u-size-11 u-color-slate-400">so với tháng trước</span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* --- KHU VỰC BIỂU ĐỒ & HOẠT ĐỘNG --- */}
            <div className="u-flex u-gap-20">
                
                {/* Cột trái: Biểu đồ Area Doanh thu */}
                <Card padding="24px" style={{ flex: 2 }}>
                    <div className="u-flex u-justify-between u-align-center u-m-b-20">
                        <h2 className="u-size-18 u-weight-700 u-color-slate-800">Doanh thu 7 ngày gần nhất (Triệu VNĐ)</h2>
                        <select className="u-p-x-12 u-p-y-6 u-rounded-8 u-size-13 u-weight-600" style={{ border: '1px solid #e2e8f0', outline: 'none' }}>
                            <option>7 ngày qua</option>
                            <option>Tháng này</option>
                        </select>
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
                                    formatter={(value) => [`${value} Triệu ₫`, 'Doanh thu']}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#3182ce" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Cột phải: Dọc (Pie chart + Hoạt động gần đây) */}
                <div className="u-flex-1 u-flex u-flex-column u-gap-20">
                    
                    {/* Miếng 1: Pie Chart tỉ trọng tuyến */}
                    <Card padding="24px">
                        <h2 className="u-size-18 u-weight-700 u-color-slate-800 u-m-b-10">Tỷ trọng Tuyến đường</h2>
                        <div style={{ height: '200px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                      data={routePieData}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={50}
                                      outerRadius={80}
                                      paddingAngle={5}
                                      dataKey="value"
                                      stroke="none"
                                    >
                                      {routePieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                      ))}
                                    </Pie>
                                    <RechartsTooltip formatter={(value) => [`${value}%`, 'Lấp đầy']} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}/>
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Miếng 2: Hoạt động gần đây */}
                    <Card padding="24px" style={{ flex: 1 }}>
                        <div className="u-flex u-justify-between u-align-center u-m-b-15">
                            <h2 className="u-size-18 u-weight-700 u-color-slate-800">Tin tức / Hoạt động</h2>
                            <span className="u-size-13 u-color-blue u-weight-600 u-cursor-pointer">Xem tất cả</span>
                        </div>
                        <div className="u-flex u-flex-column u-gap-15">
                            {recentActivities.map((activity, index) => (
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
                            ))}
                        </div>
                    </Card>

                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
