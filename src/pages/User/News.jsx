import React, { useState } from 'react';
import '../../assets/styles/News.css';

import img27thang7 from '../../assets/images/27thang7.jpg';
import imgMoonFestival from '../../assets/images/moonfertival.jpg';
import imgOld from '../../assets/images/old.jpg';
import img29 from '../../assets/images/29.jpg';

const newsData = [
    {
        id: 1,
        image: img27thang7,
        title: 'Kỷ niệm 77 năm Ngày Thương Binh Liệt Sỹ – Đồng Hương Sông Lam tri ân anh hùng',
        date: '27 Tháng 7, 2024',
        category: 'Sự kiện',
        excerpt:
            'Nhân dịp kỷ niệm 77 năm Ngày Thương Binh Liệt Sỹ (27/7/1947 – 27/7/2024), Nhà xe Đồng Hương Sông Lam trân trọng tri ân các anh hùng liệt sỹ đã hy sinh vì Tổ quốc. Áp dụng chương trình miễn phí vé cho thân nhân liệt sỹ trên tuyến Nghệ An – Hà Nội từ ngày 10/7/2024 đến 30/7/2024.',
        tags: ['Tri ân', 'Thương Binh Liệt Sỹ', 'Miễn vé'],
    },
    {
        id: 2,
        image: imgMoonFestival,
        title: 'Đi xe Đồng Hương Sông Lam – Về đón Trung Thu bình an cùng gia đình',
        date: '15 Tháng 9, 2024',
        category: 'Khuyến mãi',
        excerpt:
            'Tết Trung Thu đang đến gần, Đồng Hương Sông Lam mang đến chương trình ưu đãi đặc biệt cho hành khách về quê đón Tết cùng gia đình. Tham gia nhóm "Đi cùng Đồng Hương Sông Lam" trên Facebook để nhận ngay những ưu đãi hấp dẫn nhất trong mùa Trung Thu này.',
        tags: ['Trung Thu', 'Khuyến mãi', 'Ưu đãi'],
    },
    {
        id: 3,
        image: imgOld,
        title: 'Chào mừng Quốc Tế Người Cao Tuổi – Miễn vé cho hành khách từ 60 tuổi trở lên',
        date: '1 Tháng 10, 2024',
        category: 'Chính sách',
        excerpt:
            'Nhân dịp Ngày Quốc Tế Người Cao Tuổi, Nhà xe Đồng Hương Sông Lam triển khai chính sách nhân văn miễn hoàn toàn chi phí vé xe cho hành khách từ 60 tuổi trở lên trên tất cả các tuyến. Đây là món quà ý nghĩa thể hiện sự tri ân và tôn trọng của Đồng Hương Sông Lam dành cho thế hệ cao tuổi.',
        tags: ['Người cao tuổi', 'Miễn vé', 'Nhân văn'],
    },
    {
        id: 4,
        image: img29,
        title: 'Nghỉ Lễ 2/9 – Về quê với cha mẹ nào cùng Đồng Hương Sông Lam',
        date: '2 Tháng 9, 2024',
        category: 'Sự kiện',
        excerpt:
            'Dịp lễ Quốc Khánh 2/9 là thời điểm tuyệt vời để về quê thăm cha mẹ và sum họp gia đình. Nhà xe Đồng Hương Sông Lam tăng cường chuyến xe phục vụ bà con trên tuyến Nghệ An – Hà Nội – Nội Bài. Đặt vé ngay hôm nay để có chỗ ngồi hợp lý nhất. Liên hệ: 0969 037 123 – 0969 037 456.',
        tags: ['Quốc Khánh', 'Lễ 2/9', 'Ưu đãi'],
    },
];

const categoryColors = {
    'Sự kiện': '#e74c3c',
    'Khuyến mãi': '#f39c12',
    'Chính sách': '#2980b9',
};

const News = () => {
    const [activeCategory, setActiveCategory] = useState('Tất cả');
    const [expandedId, setExpandedId] = useState(null);

    const categories = ['Tất cả', ...new Set(newsData.map((n) => n.category))];

    const filtered =
        activeCategory === 'Tất cả'
            ? newsData
            : newsData.filter((n) => n.category === activeCategory);

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="news-page">
            <div className="news-page-header">
                <div className="news-page-header-content">
                    <span className="news-header-tag">BẢN TIN MỚI NHẤT</span>
                    <h1 className="news-page-title">Tin Tức &amp; Sự Kiện</h1>
                    <p className="news-page-subtitle">
                        Cập nhật những tin tức mới nhất, chương trình khuyến mãi và sự kiện
                        đặc biệt từ Đồng Hương Sông Lam
                    </p>
                </div>
                <div className="news-header-decoration">
                    <span className="deco-circle c1"></span>
                    <span className="deco-circle c2"></span>
                    <span className="deco-circle c3"></span>
                </div>
            </div>

            <div className="news-container">
                {/* Filter Tabs */}
                <div className="news-filter-bar">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            className={`news-filter-btn ${activeCategory === cat ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* News Grid */}
                <div className="news-grid">
                    {filtered.map((item, index) => (
                        <article
                            key={item.id}
                            className={`news-card ${index === 0 && activeCategory === 'Tất cả' ? 'news-card--featured' : ''}`}
                        >
                            <div className="news-card-image-wrap">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="news-card-image"
                                    loading="lazy"
                                />
                                <span
                                    className="news-card-category"
                                    style={{ background: categoryColors[item.category] || '#555' }}
                                >
                                    {item.category}
                                </span>
                                <div className="news-card-overlay"></div>
                            </div>

                            <div className="news-card-body">
                                <div className="news-card-meta">
                                    <span className="news-card-date">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                        {item.date}
                                    </span>
                                    <span className="news-card-divider">|</span>
                                    <span className="news-card-comments">0 Bình luận</span>
                                </div>

                                <h2 className="news-card-title">{item.title}</h2>

                                <p className={`news-card-excerpt ${expandedId === item.id ? 'expanded' : ''}`}>
                                    {item.excerpt}
                                </p>

                                <div className="news-card-tags">
                                    {item.tags.map((tag) => (
                                        <span key={tag} className="news-tag">#{tag}</span>
                                    ))}
                                </div>

                                <button
                                    className="news-card-readmore"
                                    onClick={() => toggleExpand(item.id)}
                                    aria-label={expandedId === item.id ? 'Thu gọn' : 'Xem thêm'}
                                >
                                    {expandedId === item.id ? 'Thu gọn ‹‹' : 'Xem thêm »'}
                                </button>
                            </div>
                        </article>
                    ))}
                </div>

                {filtered.length === 0 && (
                    <div className="news-empty">
                        <span>😔</span>
                        <p>Không có tin tức nào trong danh mục này.</p>
                    </div>
                )}

                {/* Bottom CTA */}
                <div className="news-cta-bar">
                    <div className="news-cta-content">
                        <h3>Liên hệ đặt vé ngay hôm nay!</h3>
                        <p>Hotline: <strong>0969 037 123</strong> – <strong>0969 037 456</strong></p>
                    </div>
                    <a href="/booking" className="news-cta-btn">Đặt vé ngay</a>
                </div>
            </div>
        </div>
    );
};

export default News;
