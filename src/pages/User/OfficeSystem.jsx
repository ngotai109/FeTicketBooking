import React, { useState } from 'react';
import '../../assets/styles/AboutPages.css';

const OfficeSystem = () => {
    const offices = [
        {
            id: 1,
            city: "Hà Nội",
            name: "Văn phòng Trần Vỹ",
            address: "162 P.Trần Vỹ, Quận Cầu Giấy, Thành Phố Hà Nội",
            phone: "028 3862 xxxx",
            email: "hcm.vphs@songlam.vn",
            mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.702751651134!2d105.76973904983599!3d21.04457643740467!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313454cec6ffe915%3A0x27a05824ecd23ac9!2zMTYyIFAuIFRy4bqnbiBW4bu5LCBNYWkgROG7i2NoLCBD4bqndSBHaeG6pXksIEjDoCBO4buZaSAxMDAwMDAsIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1773279619502!5m2!1svi!2s"
        },
        {
            id: 2,
            city: "Hà Nội",
            name: "Văn phòng Mỗ Lao",
            address: "364 P.Nguyễn Văn Lộc, P.Mỗ Lao, Quận Nam Từ Liêm, Thành Phố Hà Nội ",
            phone: "0236 382 xxxx",
            email: "dn.vphs@songlam.vn",
            mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3725.2746855776522!2d105.77761851143212!3d20.98162348931404!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31345332e5ddd34f%3A0xc28b0dba1f4c96c8!2zMzY0IFAuIE5ndXnhu4VuIFbEg24gTOG7mWMsIFAuIE3hu5kgTGFvLCBIw6AgTuG7mWksIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1773280112410!5m2!1svi!2s"
        },
        {
            id: 3,
            city: "Hà Nội",
            name: "Văn phòng Giải Phóng",
            address: "769 Giải Phóng, Quận Hoàng Mai, Hà Nội",
            phone: "024 3861 xxxx",
            email: "hn.vphs@songlam.vn",
            mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3725.14759833992!2d105.83875891143222!3d20.986719789139293!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ac6872e3bdcd%3A0x660d1bd30f1da786!2zNzY5IMSQLiBHaeG6o2kgUGjDs25nLCBHacOhcCBCw6F0LCBIb8OgbmcgTWFpLCBIw6AgTuG7mWksIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1773280646319!5m2!1svi!2s"
        },
        {
            id: 4,
            city: "Nghệ An",
            name: "Văn phòng Vinh (Bến xe mới)",
            address: "77 Lê Lợi, TP. Vinh, Nghệ An",
            phone: "0238 3757 xxxx",
            email: "vinh.vphs@songlam.vn",
            mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3779.940546375628!2d105.6749918760081!3d18.67784036469608!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3139ce6f5d8e7e1b%3A0x7d287042502690d7!2zNzcgTMOqIEzhu6NpLCBWaeG7h3QgTmFtLCBUUC4gVmluaCwgTmdo4buHIEFu!5e0!3m2!1svi!2s!4v1773281000000!5m2!1svi!2s"
        },
        {
            id: 5,
            city: "Nghệ An",
            name: "Văn phòng Cửa Lò",
            address: "Bình Minh, Thu Thủy, Cửa Lò, Nghệ An",
            phone: "0238 395 xxxx",
            email: "cualo.vphs@songlam.vn",
            mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3779.23456789!2d105.7123456!3d18.8123456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3139cxxxxxxxxxxx%3A0xxxxxxxxxxxxxxx!2zQsOgbmggTWluaCwgQ-G7r2EgTMOyLCBOZ2jhu4UgQW4sIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1773281100000!5m2!1svi!2s"
        }
    ];

    const [selectedCity, setSelectedCity] = useState("Hà Nội");
    const filteredOffices = offices.filter(office => office.city === selectedCity);
    const [activeOffice, setActiveOffice] = useState(filteredOffices[0]);
    const mapRef = React.useRef(null);

    const handleCityChange = (city) => {
        setSelectedCity(city);
        const newFiltered = offices.filter(office => office.city === city);
        setActiveOffice(newFiltered[0]);
    };


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
                        <div className="city-toggle-container">
                            <button 
                                className={`city-btn ${selectedCity === "Hà Nội" ? 'active' : ''}`}
                                onClick={() => handleCityChange("Hà Nội")}
                            >
                                Hà Nội
                            </button>
                            <button 
                                className={`city-btn ${selectedCity === "Nghệ An" ? 'active' : ''}`}
                                onClick={() => handleCityChange("Nghệ An")}
                            >
                                Nghệ An
                            </button>
                        </div>
                        <p className="sidebar-hint">Chọn văn phòng để xem vị trí:</p>
                    </div>
                    <div className="office-list">
                        {filteredOffices.map((office) => (
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
