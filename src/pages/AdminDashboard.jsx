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
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
            color: '#1a3a8f'
        },
        {
            title: 'Doanh thu tháng này',
            value: '₫45.2M',
            change: '+8.2%',
            trend: 'up',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
            color: '#388e3c'
        },
        {
            title: 'Khách hàng mới',
            value: '856',
            change: '+23.1%',
            trend: 'up',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.3503 17.623 3.8507 18.1676 4.55231C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
            color: '#1565c0'
        },
        {
            title: 'Chuyến đi xuất bến',
            value: '42',
            change: '+5.4%',
            trend: 'up',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
            color: '#f9a825'
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
        <div className="admin-page-container" style={{ padding: '0 10px 20px 10px', height: '100%', overflowY: 'auto' }}>
            {/* --- HEADER --- */}
            <header className="admin-header u-m-b-20" style={{ paddingBottom: '12px' }}>
                <div className="admin-header-title">
                    <h1 className="u-size-20 u-weight-800 u-color-slate-800">Tổng quan Nhà xe (Dashboard)</h1>
                    <p className="u-color-slate-500 u-size-12">
                        Cập nhật lúc: {currentTime.toLocaleString('vi-VN', {
                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                            hour: '2-digit', minute: '2-digit', second: '2-digit'
                        })}
                    </p>
                </div>
                <div className="u-flex u-align-center u-gap-16">
                    <div className="u-flex u-align-center u-gap-12 u-p-x-16 u-p-y-8 u-rounded-50 u-bg-slate-50" style={{ border: '1px solid #edf2f7' }}>
                        <div className="u-flex u-align-center u-justify-center u-weight-bold" style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#3182ce', color: 'white' }}>
                            {userEmail.charAt(0).toUpperCase()}
                        </div>
                        <div className="u-flex u-flex-column">
                            <span className="u-weight-700 u-size-14 u-color-slate-800">{userEmail}</span>
                            <span className="u-size-12 u-color-slate-500">Quản trị viên cấp cao</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- CARDS TỔNG QUAN --- */}
            <div className="u-flex u-gap-20 u-m-b-24">
                {stats.map((stat, index) => (
                    <Card key={index} padding="24px" className="u-flex-1" style={{ position: 'relative', overflow: 'hidden' }}>
                        {/* Hiệu ứng màu gradient bóng mờ ở góc */}
                        <div style={{ position: 'absolute', top: '-15%', right: '-10%', width: '100px', height: '100px', borderRadius: '50%', background: stat.color, filter: 'blur(50px)', opacity: '0.15' }}></div>
                        
                        <div className="u-flex u-justify-between u-align-start u-m-b-16">
                            <div className="u-p-12 u-rounded-12" style={{ background: `${stat.color}15`, color: stat.color }}>
                                {stat.icon}
                            </div>
                            <div className="u-flex u-align-center u-gap-4 u-p-x-8 u-p-y-4 u-rounded-20 u-size-12 u-weight-bold" style={{ background: '#f0fff4', color: '#38a169' }}>
                                <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
                                    <path d="M12 19V5M5 12L12 5L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span>{stat.change}</span>
                            </div>
                        </div>
                        <div>
                            <h3 className="u-size-14 u-color-slate-500 u-weight-600 u-m-b-4">{stat.title}</h3>
                            <div className="u-size-28 u-weight-800 u-color-slate-800">{stat.value}</div>
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
