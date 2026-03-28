
export const BUS_LAYOUTS = {
    // Xe Limousine 22 phòng (Cabin)
    '22': {
        name: 'Xe Limousine Cabin (22 phòng)',
        totalSeats: 21, // Theo ảnh thực tế là 21 ghế (10 tầng dưới, 11 tầng trên)
        columns: 3,
        floor1: [
            { seatNumber: 'D1', row: 0, col: 0 }, { seatNumber: 'C1', row: 0, col: 2 },
            { seatNumber: 'D2', row: 1, col: 0 }, { seatNumber: 'C2', row: 1, col: 2 },
            { seatNumber: 'D3', row: 2, col: 0 }, { seatNumber: 'C3', row: 2, col: 2 },
            { seatNumber: 'D4', row: 3, col: 0 }, { seatNumber: 'C4', row: 3, col: 2 },
            { seatNumber: 'D5', row: 4, col: 0 }, { seatNumber: 'C5', row: 4, col: 2 },
        ],
        floor2: [
            { seatNumber: 'A1', row: 0, col: 1 }, // A1 nằm giữa tầng 2? Theo ảnh thực tế
            { seatNumber: 'A2', row: 1, col: 1 }, 
            { seatNumber: 'A3', row: 2, col: 1 }, 
            { seatNumber: 'A4', row: 3, col: 1 }, 
            { seatNumber: 'A5', row: 4, col: 1 }, 
            { seatNumber: 'A6', row: 5, col: 1 }, 
            { seatNumber: 'B1', row: 0, col: 2 }, 
            { seatNumber: 'B2', row: 1, col: 2 }, 
            { seatNumber: 'B3', row: 2, col: 2 }, 
            { seatNumber: 'B4', row: 3, col: 2 }, 
            { seatNumber: 'B5', row: 4, col: 2 }, 
        ]
    },

    // Xe 16 chỗ (Transit/Hiace)
    '16': {
        name: 'Xe 16 chỗ (Ford Transit/Hiace)',
        totalSeats: 16,
        columns: 3,
        floor1: [
            { seatNumber: '01', row: 0, col: 0 }, { seatNumber: '02', row: 0, col: 1 }, { seatNumber: '03', row: 0, col: 2 },
            { seatNumber: '04', row: 1, col: 0 }, { seatNumber: '05', row: 1, col: 1 }, { seatNumber: '06', row: 1, col: 2 },
            { seatNumber: '07', row: 2, col: 0 }, { seatNumber: '08', row: 2, col: 1 }, { seatNumber: '09', row: 2, col: 2 },
            { seatNumber: '10', row: 3, col: 0 }, { seatNumber: '11', row: 3, col: 1 }, { seatNumber: '12', row: 3, col: 2 },
            { seatNumber: '13', row: 4, col: 0 }, { seatNumber: '14', row: 4, col: 1 }, { seatNumber: '15', row: 4, col: 2 },
            { seatNumber: '16', row: 5, col: 1 },
        ],
        floor2: []
    },

    // Xe Limousine 34 giường
    '34': {
        name: 'Xe Limousine (34 giường)',
        totalSeats: 34,
        columns: 3,
        floor1: [
            { seatNumber: 'C2', row: 0, col: 0 }, { seatNumber: 'B2', row: 0, col: 1 }, { seatNumber: 'A2', row: 0, col: 2 },
            { seatNumber: 'C4', row: 1, col: 0 }, { seatNumber: 'B4', row: 1, col: 1 }, { seatNumber: 'A4', row: 1, col: 2 },
            { seatNumber: 'C6', row: 2, col: 0 }, { seatNumber: 'B6', row: 2, col: 1 }, { seatNumber: 'A6', row: 2, col: 2 },
            { seatNumber: 'C8', row: 3, col: 0 }, { seatNumber: 'B8', row: 3, col: 1 }, { seatNumber: 'A10', row: 3, col: 2 },
            { seatNumber: 'C12', row: 5, col: 0 }, { seatNumber: 'B10', row: 4, col: 1 }, { seatNumber: 'A12', row: 4, col: 2 },
                                                  { seatNumber: 'N1', row: 5, col: 1 },
        ],
        floor2: [
            { seatNumber: 'C3', row: 0, col: 0 }, { seatNumber: 'B3', row: 0, col: 1 }, { seatNumber: 'A1', row: 0, col: 2 },
            { seatNumber: 'C5', row: 1, col: 0 }, { seatNumber: 'B5', row: 1, col: 1 }, { seatNumber: 'A3', row: 1, col: 2 },
            { seatNumber: 'C7', row: 2, col: 0 }, { seatNumber: 'B7', row: 2, col: 1 }, { seatNumber: 'A5', row: 2, col: 2 },
            { seatNumber: 'C9', row: 3, col: 0 }, { seatNumber: 'B9', row: 3, col: 1 }, { seatNumber: 'A7', row: 3, col: 2 },
            { seatNumber: 'C11', row: 4, col: 0 }, { seatNumber: 'N2', row: 4, col: 1 }, { seatNumber: 'A9', row: 4, col: 2 },
                                                                                      { seatNumber: 'A11', row: 5, col: 2 },
        ]
    },

    // Xe Giường nằm 40 chỗ
    '40': {
        name: 'Xe giường nằm (40 giường)',
        totalSeats: 40,
        columns: 3,
        floor1: [
            { seatNumber: 'C2', row: 0, col: 0 }, { seatNumber: 'B2', row: 0, col: 1 }, { seatNumber: 'A2', row: 0, col: 2 },
            { seatNumber: 'C4', row: 1, col: 0 }, { seatNumber: 'B4', row: 1, col: 1 }, { seatNumber: 'A4', row: 1, col: 2 },
            { seatNumber: 'C6', row: 2, col: 0 }, { seatNumber: 'B6', row: 2, col: 1 }, { seatNumber: 'A6', row: 2, col: 2 },
            { seatNumber: 'C8', row: 3, col: 0 }, { seatNumber: 'B8', row: 3, col: 1 }, { seatNumber: 'A8', row: 3, col: 2 },
            { seatNumber: 'C10', row: 4, col: 0 }, { seatNumber: 'B10', row: 4, col: 1 }, { seatNumber: 'A10', row: 4, col: 2 },
            { seatNumber: 'D2', row: 5, col: 0 }, { seatNumber: 'D6', row: 5, col: 1 }, { seatNumber: 'D10', row: 5, col: 2 },
            { seatNumber: 'D4', row: 6, col: 0 }, { seatNumber: 'D3', row: 6, col: 1 },
            { seatNumber: 'L1', row: 7, col: 0 }, { seatNumber: 'L2', row: 7, col: 1 },
        ],
        floor2: [
            { seatNumber: 'C1', row: 0, col: 0 }, { seatNumber: 'B1', row: 0, col: 1 }, { seatNumber: 'A1', row: 0, col: 2 },
            { seatNumber: 'C3', row: 1, col: 0 }, { seatNumber: 'B3', row: 1, col: 1 }, { seatNumber: 'A3', row: 1, col: 2 },
            { seatNumber: 'C5', row: 2, col: 0 }, { seatNumber: 'B5', row: 2, col: 1 }, { seatNumber: 'A5', row: 2, col: 2 },
            { seatNumber: 'C7', row: 3, col: 0 }, { seatNumber: 'B7', row: 3, col: 1 }, { seatNumber: 'A7', row: 3, col: 2 },
            { seatNumber: 'C9', row: 4, col: 0 }, { seatNumber: 'B9', row: 4, col: 1 }, { seatNumber: 'A9', row: 4, col: 2 },
            { seatNumber: 'D1', row: 5, col: 0 }, { seatNumber: 'D5', row: 5, col: 1 }, { seatNumber: 'D9', row: 5, col: 2 },
            { seatNumber: 'D8', row: 6, col: 0 }, { seatNumber: 'D7', row: 6, col: 1 },
            { seatNumber: 'L3', row: 7, col: 0 }, { seatNumber: 'L4', row: 7, col: 1 },
        ]
    }
};

export const getBusLayout = (type) => {
    return BUS_LAYOUTS[type.toString()] || BUS_LAYOUTS['40'];
};
