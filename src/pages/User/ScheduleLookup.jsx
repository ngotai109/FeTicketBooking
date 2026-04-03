import React, { useState, useEffect } from 'react';
import routeService from '../../services/route.service';
import tripService from '../../services/trip.service';
import '../../assets/styles/ScheduleLookup.css';

const ScheduleLookup = () => {
    const [routes, setRoutes] = useState([]);
    const [selectedRouteId, setSelectedRouteId] = useState(null);
    const [trips, setTrips] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Lấy danh sách tuyến đường
                const resRoute = await routeService.getRoutes();
                const activeRoutes = (resRoute.data?.data || resRoute.data || []).filter(r => r.isActive !== false);
                setRoutes(activeRoutes);
                
                if (activeRoutes.length > 0) {
                    setSelectedRouteId(activeRoutes[0].routeId);
                }

                // 2. Lấy danh sách chuyến đi thực tế (cho ngày hôm nay)
                const today = new Date().toISOString().split('T')[0];
                const resTrips = await tripService.getAllTrips(`?date=${today}`);
                setTrips(resTrips.data?.data || resTrips.data || []);

            } catch (error) {
                console.error("Lỗi lấy lịch trình:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredTrips = trips.filter(t => t.routeId === selectedRouteId);

    if (isLoading) return <div className="schedule-loading">Đang tải lịch trình...</div>;

    return (
        <div className="schedule-lookup-container">
            <div className="container">
                <div className="schedule-header">
                    <h1 className="schedule-title">Lịch trình xe chạy hôm nay</h1>
                    <div className="route-selector">
                        {routes.map(r => (
                            <button 
                                key={r.routeId} 
                                className={`route-tab ${selectedRouteId === r.routeId ? 'active' : ''}`}
                                onClick={() => setSelectedRouteId(r.routeId)}
                            >
                                {r.routeName}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="trips-grid">
                    {filteredTrips.length > 0 ? (
                        filteredTrips.map((trip) => (
                            <div key={trip.tripId} className="trip-card-simple">
                                <div className="trip-time-info">
                                    <div className="time-group">
                                        <span className="time-label">Khởi hành</span>
                                        <span className="time-value">{trip.departureTime}</span>
                                    </div>
                                    <div className="time-arrow">→</div>
                                    <div className="time-group">
                                        <span className="time-label">Dự kiến đến</span>
                                        <span className="time-value">{trip.arrivalTime}</span>
                                    </div>
                                </div>
                                <div className="trip-middle-info">
                                    <span className="bus-type-badge">{trip.busType}</span>
                                    <span className="bus-plate">{trip.busPlate}</span>
                                </div>
                                <div className="trip-footer-info">
                                    <div className="price-tag">{trip.ticketPrice?.toLocaleString()} đ</div>
                                    <div className="seat-count">Còn {trip.availableSeats} ghế trống</div>
                                </div>
                                <button className="btn-book-now-simple" onClick={() => window.location.href='/booking'}>
                                    Đặt vé ngay
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="no-trips-message">
                            Hiện tại chưa có chuyến đi nào được sắp xếp cho tuyến đường này trong hôm nay. 
                            Vui lòng liên hệ Hotline hoặc quay lại sau.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ScheduleLookup;
