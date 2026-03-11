import React from 'react';
import '../../assets/styles/AboutPages.css';

const AboutUs = () => {
    return (
        <div className="about-page minimal">
            <div className="page-header">
                <h1>Giới thiệu</h1>
            </div>

            <div className="content-container">
                <section className="intro-section">
                    <h2 className="main-subtitle">Giới thiệu nhà xe Đồng Hương Sông Lam – Lựa chọn hàng đầu tuyến Nghệ An – Hà Nội</h2>
                    <p>
                        Nhà xe <strong>Đồng Hương Sông Lam</strong> tự hào là một trong những đơn vị vận tải hành khách chất lượng cao, chuyên tuyến <strong>Nghệ An – Hà Nội</strong> và ngược lại. Với châm ngôn <em>“Dùng chữ “Tâm” để phục vụ – Lấy chữ “Tín” để phát triển”</em>, chúng tôi cam kết mang đến cho quý khách hàng trải nghiệm hành trình thoải mái và đáng tin cậy nhất.
                    </p>
                </section>

                <section className="content-group">
                    <h3 className="group-title">Dòng xe hiện đại, phục vụ mọi nhu cầu</h3>
                    <p className="sub-description">Đồng Hương Sông Lam cung cấp hai dòng xe chính để đáp ứng nhu cầu đa dạng của hành khách:</p>
                    
                    <div className="vehicle-type">
                        <h4>1. Xe giường phòng 20 chỗ:</h4>
                        <ul>
                            <li>Thiết kế hiện đại với không gian riêng tư.</li>
                            <li>Trang bị màn hình giải trí, cổng sạc USB, điều hòa và chăn gối sạch sẽ.</li>
                            <li>Phù hợp cho hành khách yêu thích sự thoải mái và riêng tư trong suốt hành trình.</li>
                        </ul>
                    </div>

                    <div className="vehicle-type">
                        <h4>2. Xe giường nằm 34 chỗ:</h4>
                        <ul>
                            <li>Không gian rộng rãi, thoải mái cho các hành khách.</li>
                            <li>Trang bị hệ thống điều hòa mát lạnh, đèn đọc sách và nội thất êm ái.</li>
                            <li>Thích hợp cho nhóm đông người hoặc khách hàng ưu tiên sự tiện lợi và chi phí hợp lý.</li>
                        </ul>
                    </div>
                </section>

                <section className="content-group">
                    <h3 className="group-title">Dịch vụ trung chuyển đón trả tận nơi</h3>
                    <p>
                        Tại Nghệ An, chúng tôi cung cấp dịch vụ trung chuyển đón trả tận nơi, giúp hành khách tiết kiệm thời gian và công sức di chuyển. Chỉ cần cung cấp địa chỉ cụ thể, đội ngũ nhân viên tận tâm của Đồng Hương Sông Lam sẽ đảm bảo quý khách được đưa đón đúng giờ và an toàn.
                    </p>
                </section>

                <section className="content-group">
                    <h3 className="group-title">Lịch trình linh hoạt, đúng giờ</h3>
                    <p>
                        Nhà xe Đồng Hương Sông Lam luôn duy trì lịch trình ổn định, với nhiều chuyến xe trong ngày để phục vụ khách hàng một cách tốt nhất. Chúng tôi đặc biệt chú trọng đến yếu tố đúng giờ, đảm bảo quý khách có một chuyến đi thuận lợi mà không lo lắng về việc trễ hẹn.
                    </p>
                </section>

                <section className="content-group">
                    <h3 className="group-title">Đặt vé dễ dàng</h3>
                    <p>
                        Quý khách có thể đặt vé trực tiếp qua hotline, website hoặc đến các văn phòng của Đồng Hương Sông Lam tại Nghệ An và Hà Nội. Đội ngũ nhân viên chăm sóc hàng của chúng tôi sẵn sàng hỗ trợ 24/7, giải đáp mọi thắc mắc và đảm bảo quy trình đặt vé diễn ra nhanh chóng, tiện lợi.
                    </p>
                </section>

                <section className="content-group reasons">
                    <h3 className="group-title">Lý do chọn nhà xe Đồng Hương Sông Lam</h3>
                    <ul className="reason-list">
                        <li>Dòng xe chất lượng cao, hiện đại.</li>
                        <li>Dịch vụ đón trả tận nơi tại Nghệ An.</li>
                        <li>Đội ngũ tài xế và nhân viên chuyên nghiệp, tận tình.</li>
                        <li>Giá vé hợp lý, phù hợp với mọi đối tượng khách hàng.</li>
                    </ul>
                </section>

                <div className="footer-closing">
                    <p>Hãy để Đồng Hương Sông Lam đồng hành cùng bạn trên mọi nẻo đường giữa Nghệ An và Hà Nội. Chúng tôi cam kết sẽ mang lại sự hài lòng và thoải mái trong từng chuyến đi!</p>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;
