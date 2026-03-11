import React, { useState } from 'react';
import '../../assets/styles/AboutPages.css';

const OfficeSystem = () => {
    const offices = [
        {
            id: 1,
            city: "TP. Hồ Chí Minh",
            name: "Văn phòng Quận 10",
            address: "453 Sư Vạn Hạnh, Phường 12, Quận 10, TP. HCM",
            phone: "028 3862 xxxx",
            email: "hcm.vphs@songlam.vn",
            mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4602!2d106.665!3d10.776!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752edfb7706691%3A0xe7fed2a527c11f00!2zNDUzIFPGsCBW4bqhbiBI4bqhbmgsIFBoxrDhu51uZyAxMiwgUXXhuq1uIDEwLCBUaMOgbmggcGjhu5EgSOG7kyBDaMOtIE1pbmgsIFZpZXRuYW0!5e0!3m2!1sen!2s!4v1710166000000!5m2!1sen!2s"
        },
        {
            id: 2,
            city: "Đà Nẵng",
            name: "Văn phòng Trung tâm",
            address: "123 Nguyễn Văn Linh, Quận Hải Châu, Đà Nẵng",
            phone: "0236 382 xxxx",
            email: "dn.vphs@songlam.vn",
            mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3834.1!2d108.21!3d16.06!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314219b7!2zMTIzIE5ndXnhu4VuIFbEg24gTGluaCwgxJDDoCBO4bq1bmc!5e0!3m2!1sen!2s!4v1710166100000!5m2!1sen!2s"
        },
        {
            id: 3,
            city: "Nghệ An",
            name: "Văn phòng Vinh",
            address: "78 Lê Lợi, TP. Vinh, Nghệ An",
            phone: "0238 384 xxxx",
            email: "vinh.vphs@songlam.vn",
            mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3779.9!2d105.67!3d18.67!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3139ce!2zNzggTMOqIEzhu6NpLCBWaW5o!5e0!3m2!1sen!2s!4v1710166200000!5m2!1sen!2s"
        },
        {
            id: 4,
            city: "Hà Nội",
            name: "Văn phòng Giải Phóng",
            address: "1028 Giải Phóng, Quận Hoàng Mai, Hà Nội",
            phone: "024 3861 xxxx",
            email: "hn.vphs@songlam.vn",
            mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3725.1!2d105.84!3d20.98!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ac!2zMTAyOCBHaeG6o2kgUGjDs25nLCBIw6AgTuG7mWk!5e0!3m2!1sen!2s!4v1710166300000!5m2!1sen!2s"
        }
    ];

    const [activeOffice, setActiveOffice] = useState(offices[0]);
    const mapRef = React.useRef(null);

    const handleOfficeClick = (office) => {
        setActiveOffice(office);
        // On mobile/tablet, scroll to map when an office is selected
        if (window.innerWidth <= 1024) {
            mapRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="about-page minimal office-system-page">
            <div className="page-header">
                <h1>Hệ Thống Văn Phòng</h1>
            </div>

            <div className="office-layout-container">
                {/* Left Side: Office List */}
                <div className="office-sidebar">
                    <div className="sidebar-intro">
                        <p>Chọn văn phòng để xem vị trí và chỉ dẫn:</p>
                    </div>
                    <div className="office-list">
                        {offices.map((office) => (
                            <div 
                                key={office.id} 
                                className={`office-item-card ${activeOffice.id === office.id ? 'active' : ''}`}
                                onClick={() => handleOfficeClick(office)}
                            >
                                <div className="office-item-header">
                                    <span className="city-label">{office.city}</span>
                                    <h3>{office.name}</h3>
                                </div>
                                <div className="office-item-body">
                                    <p>📍 {office.address}</p>
                                    <p>📞 {office.phone}</p>
                                    <div className="office-item-actions">
                                        <span className="view-map-link">📍 Xem bản đồ chỉ dẫn</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Interactive Map */}
                <div className="office-map-view" ref={mapRef}>
                    <div className="map-wrapper">
                        <iframe 
                            src={activeOffice.mapUrl} 
                            width="100%" 
                            height="100%" 
                            style={{ border: 0 }} 
                            allowFullScreen="" 
                            loading="lazy" 
                            referrerPolicy="no-referrer-when-downgrade"
                            title={activeOffice.name}
                        ></iframe>
                    </div>
                    <div className="map-info-overlay">
                        <h3>{activeOffice.name}</h3>
                        <p>{activeOffice.address}</p>
                        <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeOffice.address)}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="directions-btn"
                        >
                            Chỉ đường qua Google Maps
                        </a>
                    </div>
                </div>
            </div>
            
            <div className="footer-closing-minimal">
                <p>Mọi thắc mắc quý khách vui lòng liên hệ hotline 1900 xxxx để được hỗ trợ nhanh nhất.</p>
            </div>
        </div>
    );
};

export default OfficeSystem;
