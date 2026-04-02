import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Cuộn lên đầu trang một cách mượt mà
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Dùng 'instant' để tránh giật lag khi chuyển trang, hoặc 'smooth' nếu muốn thấy hiệu ứng cuộn
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
