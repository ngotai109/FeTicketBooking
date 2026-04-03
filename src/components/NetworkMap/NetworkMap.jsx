import React, { useState, useEffect } from 'react';
import provinceService from '../../services/province.service';
import wardService from '../../services/ward.service';
import '../../assets/styles/NetworkMap.css';

const NetworkMap = ({ height = "calc(100vh - 100px)", showTitle = false }) => {
    const [hanoiWards, setHanoiWards] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [zoomLevel, setZoomLevel] = useState(1.1);
    const [position, setPosition] = useState({ x: 80, y: 50 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const ngheanWardsList = [
        { id: 17, name: "Xã Tân Mai" },
        { id: 16, name: "Xã Quỳnh Mai" },
        { id: 15, name: "Xã Quỳnh Anh" },
        { id: 14, name: "Xã Quỳnh Phú" },
        { id: 13, name: "Xã Hải Châu" },
        { id: 12, name: "Xã Diễn Châu" },
        { id: 11, name: "Xã Minh Châu" },
        { id: 10, name: "Xã Hợp Minh" },
        { id: 9, name: "Xã Văn Hiến" },
        { id: 8, name: "Xã Đô Lương" },
        { id: 7, name: "Xã Yên Xuân" },
        { id: 6, name: "Xã Anh Sơn" },
        { id: 4, name: "Xã Vĩnh Tường" },
        { id: 5, name: "Xã Nhân Hòa" }
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await provinceService.getAllProvincesActive();
                const provinces = res.data?.data || res.data || [];
                const hn = provinces.find(p => p.provinceName.includes("Hà Nội"));
                if (hn) {
                    const resHn = await wardService.getWardsByProvinceId(hn.provinceId);
                    const dataHn = (resHn.data?.data || resHn.data || []).slice(0, 3);
                    const formattedHn = dataHn.map(w => ({
                        ...w,
                        wardName: w.wardName.startsWith("Quận") ? w.wardName : `Quận ${w.wardName}`
                    }));
                    setHanoiWards(formattedHn.length >= 3 ? formattedHn : [
                        { wardId: 101, wardName: "Quận Cầu Giấy" },
                        { wardId: 102, wardName: "Quận Hà Đông" },
                        { wardId: 103, wardName: "Quận Hoàng Mai" }
                    ]);
                }
            } catch (error) {
                setHanoiWards([
                    { wardId: 101, wardName: "Quận Cầu Giấy" }, { wardId: 102, wardName: "Quận Hà Đông" }, { wardId: 103, wardName: "Quận Hoàng Mai" }
                ]);
            }
            finally { setIsLoading(false); }
        };
        fetchData();
    }, []);

    const hnNodes = [{ x: 100, y: 150 }, { x: 220, y: 270 }, { x: 380, y: 270 }];
    const ninhBinhEnd = { x: 565, y: 270 };
    const thanhHoaEnd = { x: 1150, y: 270 };

    const getNaNodes = () => {
        let nodes = [];
        const HORIZONTAL_SPACING = 150;
        for (let i = 0; i < 6; i++) {
            nodes.push({ x: thanhHoaEnd.x + (i * HORIZONTAL_SPACING), y: 270 });
        }
        const hubX = nodes[5].x;
        const hubY = 270;
        for (let i = 0; i < 8; i++) {
            const innerSeg = Math.floor(i / 4);
            if (innerSeg === 0) nodes.push({ x: hubX - (i + 1) * 85, y: hubY + (i + 1) * 115 });
            else {
                const lastIdx9 = 9;
                const baseNode = nodes[lastIdx9];
                nodes.push({ x: baseNode.x, y: baseNode.y + (i - 3) * 120 });
            }
        }
        return nodes;
    };
    const naNodes = getNaNodes();

    const handleMouseDown = (e) => { setIsDragging(true); setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y }); };
    const handleMouseMove = (e) => { if (!isDragging) return; setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); };
    const handleMouseUp = () => setIsDragging(false);
    const handleWheel = (e) => { const scale = -e.deltaY * 0.001; setZoomLevel(prev => Math.min(Math.max(prev + scale, 0.4), 3)); };
    const reset = () => { setZoomLevel(1.1); setPosition({ x: 80, y: 50 }); };

    if (isLoading) return <div className="network-map-loading">Đang tối ưu góc nhìn toàn cảnh...</div>;

    return (
        <div className="network-map-outer-container">
            {showTitle && (
                <div className="network-map-header-standalone">
                    <h2 className="section-title">MẠNG LƯỚI HÀNH TRÌNH ĐỒNG HƯƠNG</h2>
                    <p className="section-subtitle">Chuyên nghiệp - An toàn - Phủ rộng</p>
                </div>
            )}

            <div className="network-map-wrapper" style={{ height }} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
                <div className="map-legend-layer">
                    <h4 className="legend-title">CHÚ GIẢI LỘ TRÌNH</h4>
                    <div className="legend-item"><span className="dot red"></span> Hà Nội</div>
                    <div className="legend-item"><span className="dot blue"></span> Ninh Bình</div>
                    <div className="legend-item"><span className="dot yellow"></span> Thanh Hóa</div>
                    <div className="legend-item"><span className="dot green"></span> Nghệ An</div>
                </div>

                <div className="map-main-container" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onWheel={handleWheel} style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
                    <div className="map-canvas-plane" style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${zoomLevel})`, transformOrigin: '0 0' }}>
                        <svg viewBox="0 0 2400 1600" className="network-svg-element">
                            <path d={`M ${hnNodes[0].x} ${hnNodes[0].y} L ${hnNodes[1].x} ${hnNodes[1].y} L ${hnNodes[2].x} ${hnNodes[2].y}`} stroke="#ef4444" strokeWidth="14" fill="none" strokeLinejoin="round" />
                            <path d={`M ${hnNodes[2].x} ${hnNodes[2].y} L ${ninhBinhEnd.x} ${ninhBinhEnd.y}`} stroke="#2563eb" strokeWidth="14" fill="none" />
                            <path d={`M ${ninhBinhEnd.x} ${ninhBinhEnd.y} L ${thanhHoaEnd.x} ${thanhHoaEnd.y}`} stroke="#f59e0b" strokeWidth="14" fill="none" />
                            <path d={`M ${thanhHoaEnd.x} ${thanhHoaEnd.y} L ${naNodes[5].x + 150} ${naNodes[5].y}`} stroke="#10b981" strokeWidth="14" fill="none" strokeLinejoin="round" strokeLinecap="round" />
                            <path d={`M ${naNodes[5].x} ${naNodes[5].y} ${naNodes.slice(6).map(n => `L ${n.x} ${n.y}`).join(' ')}`} stroke="#10b981" strokeWidth="14" fill="none" strokeLinejoin="round" />

                            {hanoiWards.slice(0, 3).map((w, i) => (
                                <g key={i}>
                                    <circle cx={hnNodes[i].x} cy={hnNodes[i].y} r="14" fill="white" stroke="#ef4444" strokeWidth="7" />
                                    <text x={hnNodes[i].x} y={hnNodes[i].y + (i === 1 ? 65 : -45)} className="station-label hn-dist" textAnchor="middle">{w.wardName}</text>
                                </g>
                            ))}
                            {ngheanWardsList.map((w, i) => {
                                if (!naNodes[i]) return null;
                                const isHorizontal = i < 6;
                                const isEven = i % 2 === 0;
                                if (isHorizontal) {
                                    return (
                                        <g key={i}>
                                            <circle cx={naNodes[i].x} cy={naNodes[i].y} r="14" fill="white" stroke="#10b981" strokeWidth="7" />
                                            <text x={naNodes[i].x} y={naNodes[i].y + (isEven ? -50 : 65)} className="station-label na-ward-horizontal" textAnchor="middle">{w.name}</text>
                                        </g>
                                    );
                                }
                                return (
                                    <g key={i}>
                                        <circle cx={naNodes[i].x} cy={naNodes[i].y} r="14" fill="white" stroke="#10b981" strokeWidth="7" />
                                        <text x={naNodes[i].x + (isEven ? 40 : -40)} y={naNodes[i].y + 8} className={`station-label na-ward-vertical ${!isEven ? 'text-end' : ''}`} textAnchor={!isEven ? "end" : "start"}>{w.name}</text>
                                    </g>
                                );
                            })}
                        </svg>
                    </div>
                    <div className="map-control-overlay">
                        <button className="ctrl-btn-round" onClick={() => setZoomLevel(z => Math.min(z + 0.3, 3))}>+</button>
                        <button className="ctrl-btn-round" onClick={reset}>🎯</button>
                        <button className="ctrl-btn-round" onClick={() => setZoomLevel(z => Math.max(z - 0.3, 0.4))}>-</button>
                    </div>
                </div>
                <div className="map-bottom-guide">🖱️ Cuộn chuột để Zoom • Giữ chuột để kéo bản đồ</div>
            </div>
        </div>
    );
};

export default NetworkMap;
