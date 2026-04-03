import React from 'react';
import NetworkMap from '../../components/NetworkMap/NetworkMap';
import '../../assets/styles/ScheduleLookup.css';

const ScheduleLookup = () => {
    return (
        <div className="schedule-lookup-page">
            {/* Sử dụng Component Mạng lưới dùng chung với chiều cao Full màn hình (trừ Header) */}
            <NetworkMap height="calc(100vh - 100px)" showTitle={false} />
        </div>
    );
};

export default ScheduleLookup;
