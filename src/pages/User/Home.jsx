import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import provinceService from '../../services/province.service';
import wardService from '../../services/ward.service';
import officeService from '../../services/office.service';
import routeService from '../../services/route.service';
import { LoadingSpinner } from '../../components/Common';
import '../../assets/styles/Home.css';
import NetworkMap from '../../components/NetworkMap/NetworkMap';
import bg3 from '../../assets/images/bg3.jpg';

const LocationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="location-icon">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
    </svg>

);

const Home = () => {
    const [offices, setOffices] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [departure, setDeparture] = useState('');
    const [destination, setDestination] = useState('');
    const [showDepList, setShowDepList] = useState(false);
    const [showDestList, setShowDestList] = useState(false);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                // Chỉ fetch offices vì đã có sẵn ProvinceName và WardName
                const officeRes = await officeService.getAllOffices();
                if (officeRes && officeRes.data) {
                    setOffices(officeRes.data?.data || officeRes.data || []);
                }
            } catch (error) {
                console.error('Lỗi khi lấy danh sách địa điểm:', error);
            }
        };
        const fetchRoutes = async () => {
            try {
                const res = await routeService.getRoutes();
                setRoutes(res.data?.data || res.data || []);
            } catch (error) {
                console.error("Lỗi lấy tuyến đường:", error);
            }
        };

        fetchLocations();
        fetchRoutes();
    }, []);

    const groupedOffices = React.useMemo(() => {
        if (!offices.length) return [];
        const map = {};

        offices.forEach(o => {
            const pName = o.provinceName || 'Tỉnh/Thành phố khác';
            if (!map[pName]) map[pName] = [];
            map[pName].push({ id: o.officeId, name: o.officeName });
        });

        return Object.keys(map).sort((a, b) => {
            if (a.toLowerCase().includes('hà nội')) return -1;
            if (b.toLowerCase().includes('hà nội')) return 1;
            return a.localeCompare(b);
        }).map(name => ({ label: name, items: map[name] }));
    }, [offices]);


    const handleSearch = () => {
        if (!departure || !destination) {
            // Hiển thị thông báo nếu chưa chọn địa điểm
            return;
        }
        // Navigate to booking page with search params
        navigate('/booking', {
            state: { departure, destination, date }
        });
    };


    const handleSwap = () => {
        setDeparture(destination);
        setDestination(departure);
    };

    return (
        <div className="home-container">
            {/* Hero & Search Section */}
            <section className="hero-search-section">

                <div className="container">
                    <div className="search-widget">
                        <div className="search-form">
                            <div className="input-group custom-select-wrapper">
                                <label><LocationIcon />Điểm khởi hành</label>
                                <div
                                    className={`custom-select-display ${!departure ? 'placeholder' : ''}`}
                                    onClick={() => setShowDepList(!showDepList)}
                                >
                                    {departure || 'Chọn điểm đi'}
                                </div>
                                {showDepList && (
                                    <ul className="custom-select-list">
                                        {groupedOffices.length > 0 ? groupedOffices.map(group => (
                                            <React.Fragment key={group.label}>
                                                <li className="province-header">{group.label}</li>
                                                {group.items.map(item => (
                                                    <li
                                                        key={item.id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setDeparture(item.name);
                                                            setShowDepList(false);
                                                        }}
                                                        className={`ward-item ${departure === item.name ? 'active' : ''}`}
                                                    >
                                                        {item.name}
                                                    </li>
                                                ))}
                                            </React.Fragment>
                                        )) : (
                                            <li className="loading-item">
                                                <LoadingSpinner size="small" message="" />
                                                <span className="u-size-12 u-color-slate-400">Đang tải dữ liệu...</span>
                                            </li>
                                        )}
                                    </ul>
                                )}
                            </div>

                            <button className="swap-button" onClick={handleSwap}>
                                <span className="u-size-20 u-weight-bold">⇌</span>
                            </button>

                            <div className="input-group custom-select-wrapper">
                                <label><LocationIcon /> Điểm đến</label>
                                <div
                                    className={`custom-select-display ${!destination ? 'placeholder' : ''}`}
                                    onClick={() => setShowDestList(!showDestList)}
                                >
                                    {destination || 'Chọn điểm đến'}
                                </div>
                                {showDestList && (
                                    <ul className="custom-select-list">
                                        {groupedOffices.length > 0 ? groupedOffices.map(group => (
                                            <React.Fragment key={group.label}>
                                                <li className="province-header">{group.label}</li>
                                                {group.items.map(item => (
                                                    <li
                                                        key={item.id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setDestination(item.name);
                                                            setShowDestList(false);
                                                        }}
                                                        className={`ward-item ${destination === item.name ? 'active' : ''}`}
                                                    >
                                                        {item.name}
                                                    </li>
                                                ))}
                                            </React.Fragment>
                                        )) : (
                                            <li className="loading-item">
                                                <LoadingSpinner size="small" message="" />
                                                <span className="u-size-12 u-color-slate-400">Đang tải dữ liệu...</span>
                                            </li>
                                        )}
                                    </ul>
                                )}
                            </div>


                            <div className="input-group date-group">
                                <label>Ngày đi</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>

                            <button className="search-button" onClick={handleSearch}>
                                <span className="u-size-18">🔍</span> Tìm vé xe
                            </button>
                        </div>

                        <div className="booking-steps-section">
                            <h3>DỄ DÀNG ĐẶT VÉ XE TRÊN WEBSITE</h3>
                            <div className="booking-steps">
                                <div className="step-item">
                                    <div className="step-icon">
                                        <span>🔍</span>
                                    </div>
                                    <h4>Tìm kiếm</h4>
                                    <p>Chọn thông tin hành trình ấn "Đặt vé"</p>
                                </div>
                                <div className="step-arrow">➔</div>
                                <div className="step-item">
                                    <div className="step-icon">
                                        <span>🚌</span>
                                    </div>
                                    <h4>Chọn chuyến</h4>
                                    <p>Lựa chọn chỗ ngồi phù hợp và điền thông tin cá nhân</p>
                                </div>
                                <div className="step-arrow">➔</div>
                                <div className="step-item">
                                    <div className="step-icon">
                                        <span>💳</span>
                                    </div>
                                    <h4>Thanh toán</h4>
                                    <p>Tiến hành thanh toán online hoặc giữ chỗ trước</p>
                                </div>
                                <div className="step-arrow">➔</div>
                                <div className="step-item">
                                    <div className="step-icon">
                                        <span>🎟️</span>
                                    </div>
                                    <h4>Nhận vé</h4>
                                    <p>Nhận mã vé, xác nhận và lên xe!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* Popular Routes Section */}
            <section className="popular-routes-section">
                <div className="container">
                    <div className="section-header">
                        <span className="dot-line-yellow">———</span>
                        <h2>Lộ trình <strong>phổ biến</strong></h2>
                    </div>

                    <div className="routes-grid">
                        {routes.filter(r => r.isActive !== false).slice(0, 6).map((route, index) => (
                            <div key={route.routeId || index} className="route-card">
                                <div className="route-image">
                                    <img src={route.imageUrl || bg3} alt={route.routeName} />
                                </div>
                                <div className="route-info">
                                    <div className="route-type">Xe Giường Nằm / Cabin <span className="vip-tag">VIP</span></div>
                                    <div className="route-points">
                                        <div className="point-item">
                                            <span className="point-icon yellow">•</span>
                                            <span>{(route.departureOfficeName || route.departureOffice?.officeName || 'Điểm đi')}</span>
                                        </div>
                                        <div className="route-connector">⇅</div>
                                        <div className="point-item">
                                            <span className="point-icon yellow">•</span>
                                            <span>{(route.arrivalOfficeName || route.arrivalOffice?.officeName || 'Điểm đến')}</span>
                                        </div>
                                    </div>
                                    <div className="route-footer">
                                        <div className="route-price">{(route.basePrice || 0).toLocaleString('vi-VN')}đ</div>
                                        <button 
                                            className="book-now-btn"
                                            onClick={() => {
                                                const depName = route.departureOfficeName || route.departureOffice?.officeName;
                                                const destName = route.arrivalOfficeName || route.arrivalOffice?.officeName;
                                                if (depName && destName) {
                                                    navigate('/booking', {
                                                        state: { departure: depName, destination: destName, date: date }
                                                    });
                                                }
                                            }}
                                        >
                                            Đặt vé
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Fallback if no routes found */}
                        {routes.length === 0 && (
                            <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '40px', color: '#64748b' }}>
                                Đang cập nhật danh sách lộ trình phổ biến...
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Network Map Section */}
            <section className="home-network-map-section">
                <div className="container">
                    <NetworkMap height="750px" showTitle={true} />
                </div>
            </section>

            {/* About Section */}
            <section className="home-about-section">
                <div className="container">
                    <div className="about-content">
                        <div className="about-text">
                            <div className="about-header">
                                <h2>Giới thiệu về <strong>Đồng Hương Sông Lam</strong></h2>
                            </div>
                            <p className="about-desc">
                                Đồng Hương Sông Lam – thương hiệu vận tải số 1 trên tuyến Nghệ An – Hà Nội – Nội Bài – Phú Thọ .
                                Với đội ngũ tài xế chuyên nghiệp cùng hệ thống xe limousine cabin, giường nằm hiện đại bậc nhất tại Việt Nam.
                                Đồng Hương Sông Lam sẽ mang đến sự sang trọng, tiện nghi và an toàn cho hành khách.
                            </p>

                            <div className="office-system">
                                <h3>Hệ thống văn phòng</h3>

                                <div className="office-group">
                                    <div className="city-title">
                                        <span className="city-icon"><LocationIcon /></span> Tại Hà Nội
                                    </div>
                                    <div className="office-list">
                                        <div className="office-item">
                                            <span className="item-icon">🏢</span> VP Mỗ Lao:364 P.Nguyễn Văn Lộc, Khu đô thị Mỗ Lao, Hà Đông
                                        </div>
                                        <div className="office-item">
                                            <span className="item-icon">🏢</span> VP Trần Vỹ:160 P.Trần Vỹ, Mai Dịch, Cầu Giấy
                                        </div>
                                        <div className="office-item">
                                            <span className="item-icon">🏢</span> VP Giải Phóng : 769 Giải Phóng, Hoàng Mai
                                        </div>
                                    </div>
                                </div>
                                <div className="office-group">
                                    <div className="city-title">
                                        <span className="city-icon"><LocationIcon /></span> Tại Nghệ An
                                    </div>
                                    <div className="office-list">
                                        <div className="office-item">
                                            <span className="item-icon">🏢</span> VP Anh Sơn : Tổ dân phố 3,khu đô thị Anh Sơn
                                        </div>
                                        <div className="office-item">
                                            <span className="item-icon">🏢</span> VP Tân Kì : Khối 2, Thị trấn Tân Kì
                                        </div>
                                        <div className="office-item">
                                            <span className="item-icon">🏢</span> VP Đô Lương : Ngã 3 Mét, KĐT Cầu Dâu, Thị trấn Đô Lương
                                        </div>
                                        <div className="office-item">
                                            <span className="item-icon">🏢</span> VP Diễn Châu :Xóm Trung Hồng, khu đô thị Diễn Ngọc
                                        </div>
                                    </div>

                                </div>

                                <div className="hotline-box">
                                    <div className="hotline-title">📞 Hotline</div>
                                    <div className="hotline-number">
                                        <span>🔍</span> Đặt vé: 1900.51.51
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="about-image-container">
                            <img src={bg3} alt="Giới thiệu Tân Kim Chi" className="about-main-image" />
                            <div className="contact-footer-info">
                                LIÊN HỆ ĐẶT VÉ: <strong>1900 5151</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Home;
