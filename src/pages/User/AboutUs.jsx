import React from 'react';
import '../../assets/styles/AboutPages.css';
import aboutImg1 from '../../assets/images/482356598_996202952614825_3578874963181622745_n.jpg';
import transferImg from '../../assets/images/494206505_1034041832164270_2977496624213028873_n.jpg';
import busImg1 from '../../assets/images/483926643_996853629216424_7820725980001898967_n.jpg';
import busImg2 from '../../assets/images/483683612_996853642549756_3442268665869518888_n.jpg';
import busImg3 from '../../assets/images/483548392_996185719283215_6023502181359507049_n.jpg';
import bookingImg from '../../assets/images/482248215_1000882942146826_2467553716153928696_n.jpg';
import reasonImg1 from '../../assets/images/483848529_996181329283654_6522994287161992713_n.jpg';
import reasonImg2 from '../../assets/images/483956144_996189932616127_2285532723094931096_n.jpg';
import reasonImg3 from '../../assets/images/484536189_1000320778869709_6061866890160424624_n.jpg';
import scheduleImg from '../../assets/images/483853635_995603086008145_130949029170951249_n.jpg';

const AboutUs = () => {
    return (
        <div className="about-page minimal">
            <div className="page-header">
                <h1>Giới thiệu</h1>
            </div>

            <div className="content-container">
                <section className="intro-section split-layout">
                    <div className="text-content">
                        <h2 className="main-subtitle">Giới thiệu nhà xe Đồng Hương Sông Lam – Lựa chọn hàng đầu tuyến Nghệ An – Hà Nội</h2>
                        <p>
                            Nhà xe <strong>Đồng Hương Sông Lam</strong> tự hào là một trong những đơn vị vận tải hành khách chất lượng cao, chuyên tuyến <strong>Nghệ An – Hà Nội</strong> và ngược lại. Với châm ngôn <em>“Dùng chữ “Tâm” để phục vụ – Lấy chữ “Tín” để phát triển”</em>, chúng tôi cam kết mang đến cho quý khách hàng trải nghiệm hành trình thoải mái và đáng tin cậy nhất.
                        </p>
                    </div>
                    <div className="image-content">
                        <img src={aboutImg1} alt="Nhà xe Đồng Hương Sông Lam" className="featured-image" />
                    </div>
                </section>

                <section className="content-group">
                    <h3 className="group-title">Dòng xe hiện đại, phục vụ mọi nhu cầu</h3>
                    <p className="sub-description">Đồng Hương Sông Lam tự hào sở hữu dàn xe đời mới, đa dạng cấu hình để quý khách lựa chọn:</p>
                    
                    <div className="vehicle-grid">
                        <div className="vehicle-card">
                            <div className="vehicle-image-wrapper">
                                <img src={busImg1} alt="Xe giường phòng 24 chỗ" />
                            </div>
                            <div className="vehicle-info">
                                <h4>1. Xe giường phòng 24 chỗ (Cung điện di động)</h4>
                                <ul>
                                    <li>Thiết kế 24 phòng VIP riêng biệt, không gian cực kỳ riêng tư.</li>
                                    <li>Màn hình giải trí riêng, cổng sạc, wifi tốc độ cao miễn phí.</li>
                                    <li>Hệ thống massage tích hợp trên từng giường nằm cao cấp.</li>
                                    <li>Đặc biệt phù hợp cho hành khách đòi hỏi sự sang trọng và kín đáo.</li>
                                </ul>
                            </div>
                        </div>

                        <div className="vehicle-card">
                            <div className="vehicle-image-wrapper">
                                <img src={busImg3} alt="Xe giường nằm 34 chỗ" />
                            </div>
                            <div className="vehicle-info">
                                <h4>2. Xe giường nằm 34 chỗ (Êm ái & Tiện nghi)</h4>
                                <ul>
                                    <li>Không gian rộng rãi, giường nằm bọc da cao cấp chống mỏi.</li>
                                    <li>Hệ thống điều hòa đa vùng, ánh sáng LED ấm cúng.</li>
                                    <li>Trang bị đầy đủ tiện ích: đèn đọc sách, chăn gối khử khuẩn.</li>
                                    <li>Sự lựa chọn tối ưu về chi phí mà vẫn đảm bảo trải nghiệm 5 sao.</li>
                                </ul>
                            </div>
                        </div>

                        <div className="vehicle-card">
                            <div className="vehicle-image-wrapper">
                                <img src={busImg2} alt="Nội thất sang trọng" />
                            </div>
                            <div className="vehicle-info">
                                <h4>3. Nội thất sang trọng & Đẳng cấp</h4>
                                <ul>
                                    <li>Mọi chi tiết được trau chuốt tỉ mỉ theo tiêu chuẩn hàng không.</li>
                                    <li>Ghế bọc da thật, sàn ốp gỗ cao cấp.</li>
                                    <li>Hệ thống âm thanh sống động, màn hình cảm ứng sắc nét.</li>
                                    <li>Mang lại cảm giác như đang ở trong chính ngôi nhà của bạn.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="content-group split-layout reverse">
                    <div className="text-content">
                        <h3 className="group-title">Dịch vụ trung chuyển đón trả tận nơi</h3>
                        <p>
                            Tại Nghệ An, chúng tôi cung cấp dịch vụ trung chuyển đón trả tận nơi, giúp hành khách tiết kiệm thời gian và công sức di chuyển. Chỉ cần cung cấp địa chỉ cụ thể, đội ngũ nhân viên tận tâm của Đồng Hương Sông Lam sẽ đảm bảo quý khách được đưa đón đúng giờ và an toàn.
                        </p>
                    </div>
                    <div className="image-content">
                        <img src={transferImg} alt="Dịch vụ trung chuyển" className="featured-image" />
                    </div>
                </section>

                <section className="content-group split-layout">
                    <div className="text-content">
                        <h3 className="group-title">Lịch trình linh hoạt, đúng giờ</h3>
                        <p>
                            Nhà xe Đồng Hương Sông Lam luôn duy trì lịch trình ổn định, với nhiều chuyến xe trong ngày để phục vụ khách hàng một cách tốt nhất. Chúng tôi đặc biệt chú trọng đến yếu tố đúng giờ, đảm bảo quý khách có một chuyến đi thuận lợi mà không lo lắng về việc trễ hẹn.
                        </p>
                    </div>
                    <div className="image-content">
                        <img src={scheduleImg} alt="Lịch trình di chuyển" className="featured-image" />
                    </div>
                </section>

                <section className="content-group split-layout reverse">
                    <div className="text-content">
                        <h3 className="group-title">Đặt vé dễ dàng</h3>
                        <p>
                            Quý khách có thể đặt vé trực tiếp qua hotline, website hoặc đến các văn phòng của Đồng Hương Sông Lam tại Nghệ An và Hà Nội. Đội ngũ nhân viên chăm sóc hàng của chúng tôi sẵn sàng hỗ trợ 24/7, giải đáp mọi thắc mắc và đảm bảo quy trình đặt vé diễn ra nhanh chóng, tiện lợi.
                        </p>
                    </div>
                    <div className="image-content">
                        <img src={bookingImg} alt="Đặt vé dễ dàng" className="featured-image" />
                    </div>
                </section>

                <section className="content-group reasons">
                    <h3 className="group-title">Lý do chọn nhà xe Đồng Hương Sông Lam</h3>
                    <div className="reasons-container">
                        <ul className="reason-list">
                            <li>Dòng xe chất lượng cao, hiện đại.</li>
                            <li>Dịch vụ đón trả tận nơi tại Nghệ An.</li>
                            <li>Đội ngũ tài xế và nhân viên chuyên nghiệp, tận tình.</li>
                            <li>Giá vé hợp lý, phù hợp với mọi đối tượng khách hàng.</li>
                        </ul>
                        <div className="reasons-gallery">
                            <img src={reasonImg1} alt="Lý do 1" />
                            <img src={reasonImg2} alt="Lý do 2" />
                            <img src={reasonImg3} alt="Lý do 3" />
                        </div>
                    </div>
                </section>

                <div className="footer-closing">
                    <p>Hãy để Đồng Hương Sông Lam đồng hành cùng bạn trên mọi nẻo đường giữa Nghệ An và Hà Nội. Chúng tôi cam kết sẽ mang lại sự hài lòng và thoải mái trong từng chuyến đi!</p>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;
